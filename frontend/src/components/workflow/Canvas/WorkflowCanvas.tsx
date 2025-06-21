import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  useReactFlow,
} from 'reactflow';
import { useWorkflowStore } from '../../../stores/workflowStore';
import TaskNode from '../Nodes/TaskNode';
import StepNode from '../Nodes/StepNode';

// カスタムノードタイプの定義
const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
  stepNode: StepNode,
};

export default function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedWorkflow,
  } = useWorkflowStore();

  const { fitView } = useReactFlow();

  // フィットビュー
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  if (!selectedWorkflow) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            タスクが選択されていません
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            左のリストからタスクを選択してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: false,
          style: {
            strokeWidth: 2,
            stroke: '#94a3b8',
          },
        }}
      >
        <Background 
          variant="dots" 
          gap={16} 
          size={1}
          color="#e2e8f0"
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          onFitView={handleFitView}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'taskNode') return '#3b82f6';
            if (node.type === 'stepNode') {
              const status = node.data?.step?.status;
              switch (status) {
                case 'completed': return '#10b981';
                case 'active': return '#f59e0b';
                case 'failed': return '#ef4444';
                default: return '#e5e7eb';
              }
            }
            return '#e5e7eb';
          }}
          nodeStrokeWidth={3}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}