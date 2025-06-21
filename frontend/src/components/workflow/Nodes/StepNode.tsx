import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import clsx from 'clsx';
import { WorkflowStep } from '@workflow-visualizer/shared';

interface StepNodeData {
  step: WorkflowStep;
  isCurrent: boolean;
}

interface StepNodeProps {
  data: StepNodeData;
  selected: boolean;
}

const StepNode = memo(({ data, selected }: StepNodeProps) => {
  const { step, isCurrent } = data;

  const getStatusStyles = () => {
    switch (step.status) {
      case 'completed':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50',
          icon: '✓',
          iconColor: 'text-green-600',
        };
      case 'active':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-50',
          icon: '◉',
          iconColor: 'text-amber-600',
        };
      case 'failed':
        return {
          border: 'border-red-500',
          bg: 'bg-red-50',
          icon: '✕',
          iconColor: 'text-red-600',
        };
      case 'skipped':
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-100',
          icon: '⊘',
          iconColor: 'text-gray-500',
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-white',
          icon: '○',
          iconColor: 'text-gray-400',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-md border-2 shadow-sm min-w-[200px]',
        'transition-all duration-200',
        styles.border,
        styles.bg,
        selected && 'shadow-md ring-2 ring-primary-400 ring-offset-2',
        isCurrent && 'progress-pulse'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-400 !border-0"
      />

      <div className="flex items-start gap-3">
        <div className={clsx('text-lg font-bold mt-0.5', styles.iconColor)}>
          {styles.icon}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm mb-1">
            {step.name}
          </h4>
          
          {step.description && (
            <p className="text-xs text-gray-600 mb-2">
              {step.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">
              #{step.order_index}
            </span>
            
            {step.started_at && (
              <span className="text-gray-500">
                • 開始: {new Date(step.started_at).toLocaleTimeString('ja-JP')}
              </span>
            )}
            
            {step.completed_at && (
              <span className="text-gray-500">
                • 完了: {new Date(step.completed_at).toLocaleTimeString('ja-JP')}
              </span>
            )}
          </div>

          {step.error && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
              {step.error}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-400 !border-0"
      />
    </div>
  );
});

StepNode.displayName = 'StepNode';

export default StepNode;