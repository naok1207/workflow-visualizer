import { create } from 'zustand';
import { Task } from '@workflow-visualizer/shared';
import { fetchActiveTasks } from '../services/api';

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  selectTask: (taskId: string | null) => void;
  loadTasks: () => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks],
  })),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.task_id === taskId ? { ...task, ...updates } : task
    ),
  })),

  selectTask: (taskId) => set({ selectedTaskId: taskId }),

  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchActiveTasks();
      set({ tasks: response.tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'タスクの読み込みに失敗しました',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));