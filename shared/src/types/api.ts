import { Task, TaskType } from './task';
import { Workflow, WorkflowStep } from './workflow';

// MCPツールのリクエスト/レスポンス型定義

// ヘルプツール
export interface GetHelpRequest {
  topic?: 'overview' | 'quick-start' | 'task-types' | 'workflow-management' | 'api';
}

export interface GetHelpResponse {
  topic: string;
  content: string;
  examples?: string[];
  related_topics?: string[];
}

// システム情報ツール
export interface GetSystemInfoResponse {
  version: string;
  status: 'healthy' | 'degraded' | 'error';
  database_connected: boolean;
  websocket_connected: boolean;
  active_tasks_count: number;
  completed_tasks_count: number;
  uptime_seconds: number;
}

// タスク管理ツール
export interface CreateTaskRequest {
  title: string;
  description?: string;
  task_type: TaskType;
  workflow_template?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTaskProgressRequest {
  task_id: string;
  current_step?: string;
  status?: 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
}

export interface GetTaskStatusRequest {
  task_id: string;
  include_workflow?: boolean;
  include_history?: boolean;
}

export interface GetTaskStatusResponse {
  task: Task;
  workflow?: Workflow;
  history?: Array<{
    timestamp: string;
    action: string;
    details: Record<string, unknown>;
  }>;
}

export interface ListActiveTasksRequest {
  task_type?: TaskType;
  limit?: number;
  offset?: number;
}

export interface ListActiveTasksResponse {
  tasks: Task[];
  total_count: number;
}

// ワークフロー管理ツール
export interface AddWorkflowStepRequest {
  task_id: string;
  after_step?: string;
  new_step: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface ModifyWorkflowRequest {
  task_id: string;
  step_id: string;
  updates: {
    name?: string;
    description?: string;
    order?: number;
  };
}

export interface ForkWorkflowRequest {
  task_id: string;
  from_step: string;
  new_branch_name: string;
}

export interface GetWorkflowHistoryRequest {
  task_id: string;
  limit?: number;
}

// WebSocket イベント
export interface TaskCreatedEvent {
  type: 'task_created';
  data: Task;
}

export interface ProgressUpdatedEvent {
  type: 'progress_updated';
  data: {
    task_id: string;
    progress_percentage: number;
    current_step?: WorkflowStep;
  };
}

export interface WorkflowModifiedEvent {
  type: 'workflow_modified';
  data: {
    task_id: string;
    workflow: Workflow;
    action: string;
  };
}

export type WebSocketEvent = TaskCreatedEvent | ProgressUpdatedEvent | WorkflowModifiedEvent;