export type WorkflowStatus = 'active' | 'completed' | 'cancelled';
export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

export interface WorkflowStep {
  step_id: string;
  name: string;
  description?: string;
  order_index: number;
  status: StepStatus;
  started_at?: string;
  completed_at?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface Workflow {
  workflow_id: string;
  task_id: string;
  name: string;
  status: WorkflowStatus;
  current_step_id?: string;
  created_at: string;
  updated_at: string;
  steps: WorkflowStep[];
}

export interface WorkflowHistory {
  history_id: string;
  workflow_id: string;
  action: 'created' | 'step_added' | 'step_modified' | 'step_removed' | 'forked';
  details: Record<string, unknown>;
  created_at: string;
}