import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

interface TaskNodeData {
  taskId: string;
  workflowName: string;
  status: string;
}

interface TaskNodeProps {
  data: TaskNodeData;
  selected: boolean;
}

const TaskNode = memo(({ data, selected }: TaskNodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'active':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div
      className={clsx(
        'px-6 py-4 rounded-lg border-2 bg-white shadow-md min-w-[250px]',
        'transition-all duration-200',
        selected ? 'border-primary-500 shadow-lg' : 'border-gray-300'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-500">メインタスク</div>
        <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(data.status))}>
          {data.status === 'active' ? '実行中' : 
           data.status === 'completed' ? '完了' : 
           data.status === 'cancelled' ? 'キャンセル' : '不明'}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {data.workflowName}
      </h3>
      
      <div className="text-xs text-gray-500">
        ID: {data.taskId.slice(0, 8)}...
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary-500 !border-2 !border-white"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

export default TaskNode;