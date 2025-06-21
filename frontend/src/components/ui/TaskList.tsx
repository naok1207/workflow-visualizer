import { useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import clsx from 'clsx';
import { TASK_TYPE_INFO } from '@workflow-visualizer/shared';
import { useTaskStore } from '../../stores/taskStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { fetchWorkflowByTaskId } from '../../services/api';
import ProgressBar from './ProgressBar';

export default function TaskList() {
  const { tasks, selectedTaskId, selectTask, loadTasks, isLoading, error } = useTaskStore();
  const { loadWorkflow } = useWorkflowStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskSelect = async (taskId: string) => {
    selectTask(taskId);
    
    try {
      const workflow = await fetchWorkflowByTaskId(taskId);
      loadWorkflow(workflow);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">アクティブタスク</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">アクティブタスク</h2>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">アクティブタスク</h2>
        <span className="text-sm text-gray-500">{tasks.length}件</span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            アクティブなタスクはありません
          </div>
        ) : (
          tasks.map((task) => {
            const typeInfo = TASK_TYPE_INFO[task.task_type];
            
            return (
              <div
                key={task.task_id}
                onClick={() => handleTaskSelect(task.task_id)}
                className={clsx(
                  'task-list-item',
                  selectedTaskId === task.task_id && 'active'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{typeInfo.icon}</span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${typeInfo.color}20`,
                          color: typeInfo.color 
                        }}
                      >
                        {typeInfo.label}
                      </span>
                      <span>
                        {format(new Date(task.created_at), 'MM/dd HH:mm', { locale: ja })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {task.progress_percentage}%
                    </div>
                  </div>
                </div>
                
                <ProgressBar 
                  percentage={task.progress_percentage} 
                  color={typeInfo.color}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}