import axios from 'axios';
import { 
  Task, 
  Workflow, 
  ListActiveTasksResponse,
  GetTaskStatusResponse 
} from '@workflow-visualizer/shared';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// タスク関連API
export const fetchActiveTasks = async (): Promise<ListActiveTasksResponse> => {
  const response = await apiClient.get<ListActiveTasksResponse>('/tasks/active');
  return response.data;
};

export const fetchTaskStatus = async (
  taskId: string,
  includeWorkflow = true,
  includeHistory = false
): Promise<GetTaskStatusResponse> => {
  const response = await apiClient.get<GetTaskStatusResponse>(`/tasks/${taskId}/status`, {
    params: {
      include_workflow: includeWorkflow,
      include_history: includeHistory,
    },
  });
  return response.data;
};

// ワークフロー関連API
export const fetchWorkflow = async (workflowId: string): Promise<Workflow> => {
  const response = await apiClient.get<Workflow>(`/workflows/${workflowId}`);
  return response.data;
};

export const fetchWorkflowByTaskId = async (taskId: string): Promise<Workflow> => {
  const response = await apiClient.get<Workflow>(`/tasks/${taskId}/workflow`);
  return response.data;
};