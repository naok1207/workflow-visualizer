import { z } from 'zod';
import {
  AddWorkflowStepRequest,
  ModifyWorkflowRequest,
  ForkWorkflowRequest,
  GetWorkflowHistoryRequest,
} from '@workflow-visualizer/shared';
import { TaskDAO } from '../database/dao/task-dao.js';
import { WorkflowDAO } from '../database/dao/workflow-dao.js';
import { emitWorkflowEvent } from '../services/websocket-client.js';

// ワークフローステップ追加ツール
export const addWorkflowStepTool = {
  definition: {
    name: 'add_workflow_step',
    description: '実行中のワークフローに新しいステップを追加',
    inputSchema: z.object({
      task_id: z.string().describe('タスクID'),
      after_step: z.string().optional().describe('このステップの後に追加（省略時は最後に追加）'),
      new_step: z.object({
        id: z.string().describe('新しいステップのID'),
        name: z.string().describe('ステップ名'),
        description: z.string().optional().describe('ステップの説明'),
      }).describe('追加するステップの情報'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'add_workflow_step') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as AddWorkflowStepRequest;
        
        // Get task and workflow
        const task = TaskDAO.getTask(args.task_id);
        if (!task) {
          throw new Error('タスクが見つかりません');
        }

        const workflow = WorkflowDAO.getWorkflowByTaskId(args.task_id);
        if (!workflow) {
          throw new Error('ワークフローが見つかりません');
        }

        if (workflow.status !== 'active') {
          throw new Error('完了またはキャンセルされたワークフローは変更できません');
        }

        // Add step
        const newStep = WorkflowDAO.addStep(
          workflow.workflow_id,
          args.after_step || null,
          args.new_step
        );

        // Get updated workflow
        const updatedWorkflow = WorkflowDAO.getWorkflow(workflow.workflow_id)!;

        // Emit event
        await emitWorkflowEvent({
          task_id: args.task_id,
          workflow: updatedWorkflow,
          action: 'step_added',
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                task_id: args.task_id,
                workflow_id: workflow.workflow_id,
                new_step: newStep,
                message: `ステップ「${args.new_step.name}」を追加しました`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : 'ステップの追加に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};

// ワークフロー変更ツール
export const modifyWorkflowTool = {
  definition: {
    name: 'modify_workflow',
    description: 'ワークフローステップの情報を変更',
    inputSchema: z.object({
      task_id: z.string().describe('タスクID'),
      step_id: z.string().describe('変更するステップのID'),
      updates: z.object({
        name: z.string().optional().describe('新しいステップ名'),
        description: z.string().optional().describe('新しい説明'),
        order: z.number().optional().describe('新しい順序'),
      }).describe('更新内容'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'modify_workflow') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as ModifyWorkflowRequest;
        
        // Get task and workflow
        const task = TaskDAO.getTask(args.task_id);
        if (!task) {
          throw new Error('タスクが見つかりません');
        }

        const workflow = WorkflowDAO.getWorkflowByTaskId(args.task_id);
        if (!workflow) {
          throw new Error('ワークフローが見つかりません');
        }

        if (workflow.status !== 'active') {
          throw new Error('完了またはキャンセルされたワークフローは変更できません');
        }

        // Modify step
        WorkflowDAO.modifyStep(
          workflow.workflow_id,
          args.step_id,
          args.updates
        );

        // Get updated workflow
        const updatedWorkflow = WorkflowDAO.getWorkflow(workflow.workflow_id)!;

        // Emit event
        await emitWorkflowEvent({
          task_id: args.task_id,
          workflow: updatedWorkflow,
          action: 'step_modified',
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                task_id: args.task_id,
                workflow_id: workflow.workflow_id,
                step_id: args.step_id,
                updates: args.updates,
                message: 'ステップを更新しました',
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : 'ステップの変更に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};

// ワークフロー分岐ツール
export const forkWorkflowTool = {
  definition: {
    name: 'fork_workflow',
    description: 'ワークフローを特定のステップから分岐',
    inputSchema: z.object({
      task_id: z.string().describe('タスクID'),
      from_step: z.string().describe('分岐元のステップID'),
      new_branch_name: z.string().describe('新しい分岐の名前'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'fork_workflow') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as ForkWorkflowRequest;
        
        // Get task and workflow
        const task = TaskDAO.getTask(args.task_id);
        if (!task) {
          throw new Error('タスクが見つかりません');
        }

        const workflow = WorkflowDAO.getWorkflowByTaskId(args.task_id);
        if (!workflow) {
          throw new Error('ワークフローが見つかりません');
        }

        // Find from_step
        const fromStepIndex = workflow.steps.findIndex(s => s.step_id === args.from_step);
        if (fromStepIndex === -1) {
          throw new Error('指定されたステップが見つかりません');
        }

        // Create new task for the fork
        const forkedTask = TaskDAO.createTask({
          title: `${task.title} - ${args.new_branch_name}`,
          description: `${task.description || ''}\n\n分岐元: ${task.title} (ステップ: ${workflow.steps[fromStepIndex].name})`,
          task_type: task.task_type,
          metadata: {
            ...task.metadata,
            forked_from: task.task_id,
            forked_at_step: args.from_step,
          },
        });

        // Create workflow with remaining steps
        const remainingSteps = workflow.steps.slice(fromStepIndex + 1);
        const forkedWorkflow = WorkflowDAO.createWorkflow({
          task_id: forkedTask.task_id,
          name: `${args.new_branch_name} - ワークフロー`,
          steps: remainingSteps.map((step, index) => ({
            name: step.name,
            description: step.description,
            order: index + 1,
          })),
        });

        // Update forked task with workflow
        TaskDAO.updateTask(forkedTask.task_id, { 
          workflow_id: forkedWorkflow.workflow_id,
          status: 'active',
        });

        // Add history to original workflow
        WorkflowDAO.addHistory(workflow.workflow_id, 'forked', {
          forked_task_id: forkedTask.task_id,
          forked_workflow_id: forkedWorkflow.workflow_id,
          from_step: args.from_step,
          branch_name: args.new_branch_name,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                original_task_id: args.task_id,
                forked_task_id: forkedTask.task_id,
                forked_workflow_id: forkedWorkflow.workflow_id,
                branch_name: args.new_branch_name,
                message: `ワークフローを分岐しました: ${args.new_branch_name}`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : 'ワークフローの分岐に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};

// ワークフロー履歴取得ツール
export const getWorkflowHistoryTool = {
  definition: {
    name: 'get_workflow_history',
    description: 'ワークフローの変更履歴を取得',
    inputSchema: z.object({
      task_id: z.string().describe('タスクID'),
      limit: z.number().optional().describe('取得件数（デフォルト: 50）'),
    }),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'get_workflow_history') {
        return { error: 'Unknown tool' };
      }

      try {
        const args = request.params.arguments as GetWorkflowHistoryRequest;
        
        // Get task and workflow
        const task = TaskDAO.getTask(args.task_id);
        if (!task) {
          throw new Error('タスクが見つかりません');
        }

        const workflow = WorkflowDAO.getWorkflowByTaskId(args.task_id);
        if (!workflow) {
          throw new Error('ワークフローが見つかりません');
        }

        // Get history
        const history = WorkflowDAO.getHistory(
          workflow.workflow_id,
          args.limit || 50
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                task_id: args.task_id,
                workflow_id: workflow.workflow_id,
                history: history.map(h => ({
                  timestamp: h.created_at,
                  action: h.action,
                  details: h.details,
                })),
                total_entries: history.length,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error instanceof Error ? error.message : '履歴の取得に失敗しました'}`,
            },
          ],
        };
      }
    },
  },
};