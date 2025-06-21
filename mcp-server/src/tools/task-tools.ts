import { z } from 'zod';
import {
  CreateTaskRequest,
  UpdateTaskProgressRequest,
  GetTaskStatusRequest,
  GetTaskStatusResponse,
  ListActiveTasksRequest,
  ListActiveTasksResponse,
  DEFAULT_WORKFLOWS,
} from '@workflow-visualizer/shared';
import { TaskDAO } from '../database/dao/task-dao.js';
import { WorkflowDAO } from '../database/dao/workflow-dao.js';
import { emitTaskEvent, emitProgressEvent, emitWorkflowCreated } from '../services/websocket-client.js';

// タスク作成ツール
export const createTaskTool = {
  definition: {
    name: 'create_task',
    description: '新しいタスクを作成し、デフォルトまたは指定されたワークフローを設定',
    inputSchema: z.object({
      title: z.string().describe('タスクのタイトル'),
      description: z.string().optional().describe('タスクの詳細説明'),
      task_type: z.enum(['feature-planning', 'issue-resolution', 'documentation', 'research', 'refactoring', 'custom'])
        .describe('タスクタイプ'),
      workflow_template: z.string().optional().describe('カスタムワークフローテンプレート名'),
      metadata: z.record(z.unknown()).optional().describe('追加メタデータ'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'create_task') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as CreateTaskRequest;
        
        // Create task
        const task = TaskDAO.createTask({
          title: args.title,
          description: args.description,
          task_type: args.task_type,
          metadata: args.metadata,
        });

        // Create workflow
        const workflowSteps = DEFAULT_WORKFLOWS[args.task_type] || DEFAULT_WORKFLOWS.custom;
        const workflow = WorkflowDAO.createWorkflow({
          task_id: task.task_id,
          name: `${args.title} - ワークフロー`,
          steps: workflowSteps.map(step => ({
            name: step.name,
            description: step.description,
            order: step.order,
          })),
        });

        // Update task with workflow_id
        TaskDAO.updateTask(task.task_id, { 
          workflow_id: workflow.workflow_id,
          status: 'active',
        });
        task.workflow_id = workflow.workflow_id;
        task.status = 'active';

        // Emit events
        await emitTaskEvent(task);
        await emitWorkflowCreated(task.task_id, workflow);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                task_id: task.task_id,
                title: task.title,
                workflow_id: workflow.workflow_id,
                status: task.status,
                message: `タスク「${task.title}」を作成しました`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : 'タスクの作成に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};

// タスク進捗更新ツール
export const updateTaskProgressTool = {
  definition: {
    name: 'update_task_progress',
    description: 'タスクの進捗を更新し、ワークフローステップのステータスを変更',
    inputSchema: z.object({
      task_id: z.string().describe('タスクID'),
      current_step: z.string().optional().describe('現在のステップID'),
      status: z.enum(['completed', 'failed']).optional().describe('ステップのステータス'),
      result: z.record(z.unknown()).optional().describe('ステップの実行結果'),
      error: z.string().optional().describe('エラーメッセージ（失敗時）'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'update_task_progress') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as UpdateTaskProgressRequest;
        
        // Get task and workflow
        const task = TaskDAO.getTask(args.task_id);
        if (!task) {
          throw new Error('タスクが見つかりません');
        }

        const workflow = WorkflowDAO.getWorkflowByTaskId(args.task_id);
        if (!workflow) {
          throw new Error('ワークフローが見つかりません');
        }

        // Update current step if specified
        if (args.current_step) {
          const step = workflow.steps.find(s => s.step_id === args.current_step);
          if (!step) {
            throw new Error('指定されたステップが見つかりません');
          }

          // Update step status
          if (args.status) {
            WorkflowDAO.updateStep(workflow.workflow_id, args.current_step, {
              status: args.status === 'completed' ? 'completed' : 'failed',
              result: args.result,
              error: args.error,
            });
          }
        }

        // Calculate progress
        const updatedWorkflow = WorkflowDAO.getWorkflow(workflow.workflow_id)!;
        const totalSteps = updatedWorkflow.steps.length;
        const completedSteps = updatedWorkflow.steps.filter(s => s.status === 'completed').length;
        const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

        // Update task progress
        TaskDAO.updateTask(args.task_id, { 
          progress_percentage: progressPercentage,
          status: updatedWorkflow.status === 'completed' ? 'completed' : task.status,
        });

        // Emit progress event
        const currentStep = updatedWorkflow.steps.find(s => s.step_id === updatedWorkflow.current_step_id);
        await emitProgressEvent({
          task_id: args.task_id,
          progress_percentage: progressPercentage,
          current_step: currentStep,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                task_id: args.task_id,
                progress_percentage: progressPercentage,
                current_step: currentStep?.name,
                workflow_status: updatedWorkflow.status,
                message: '進捗を更新しました',
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : '進捗の更新に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};

// タスクステータス取得ツール
export const getTaskStatusTool = {
  definition: {
    name: 'get_task_status',
    description: 'タスクの詳細ステータス、ワークフロー、履歴を取得',
    inputSchema: z.object({
      task_id: z.string().describe('タスクID'),
      include_workflow: z.boolean().optional().describe('ワークフロー情報を含める'),
      include_history: z.boolean().optional().describe('履歴情報を含める'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'get_task_status') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as GetTaskStatusRequest;
        
        const task = TaskDAO.getTask(args.task_id);
        if (!task) {
          throw new Error('タスクが見つかりません');
        }

        const response: GetTaskStatusResponse = { task };

        if (args.include_workflow) {
          const workflow = WorkflowDAO.getWorkflowByTaskId(args.task_id);
          if (workflow) {
            response.workflow = workflow;
          }
        }

        if (args.include_history && response.workflow) {
          const history = WorkflowDAO.getHistory(response.workflow.workflow_id, 20);
          response.history = history.map(h => ({
            timestamp: h.created_at,
            action: h.action,
            details: h.details,
          }));
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : 'ステータスの取得に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};

// アクティブタスク一覧取得ツール
export const listActiveTasksTool = {
  definition: {
    name: 'list_active_tasks',
    description: 'アクティブなタスクの一覧を取得',
    inputSchema: z.object({
      task_type: z.enum(['feature-planning', 'issue-resolution', 'documentation', 'research', 'refactoring', 'custom'])
        .optional().describe('フィルタするタスクタイプ'),
      limit: z.number().optional().describe('取得件数（デフォルト: 50）'),
      offset: z.number().optional().describe('オフセット（ページネーション用）'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'list_active_tasks') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as ListActiveTasksRequest;
        
        const result = TaskDAO.listActiveTasks({
          task_type: args.task_type,
          limit: args.limit,
          offset: args.offset,
        });

        const response: ListActiveTasksResponse = result;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : 'タスク一覧の取得に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};