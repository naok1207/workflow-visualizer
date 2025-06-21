export type TaskType = 
  | 'feature-planning'
  | 'issue-resolution' 
  | 'documentation'
  | 'research'
  | 'refactoring'
  | 'custom';

export type TaskStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  task_id: string;
  title: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  progress_percentage: number;
  workflow_id: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
}