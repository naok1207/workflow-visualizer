import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useTaskStore } from '../../../stores/taskStore';
import { useWorkflowStore } from '../../../stores/workflowStore';

export default function ControlPanel() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { loadTasks } = useTaskStore();
  const { selectedWorkflow, clearWorkflow } = useWorkflowStore();

  const handleRefresh = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  const handleClearWorkflow = useCallback(() => {
    clearWorkflow();
  }, [clearWorkflow]);

  return (
    <div className="control-panel space-y-3">
      <div className="text-sm font-medium text-gray-700 mb-2">
        コントロール
      </div>

      <div className="space-y-2">
        <button
          onClick={handleRefresh}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
          title="タスクリストを更新"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          更新
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => zoomIn()}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
            title="ズームイン"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          
          <button
            onClick={() => zoomOut()}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
            title="ズームアウト"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <button
            onClick={handleFitView}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
            title="全体表示"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {selectedWorkflow && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">
              ワークフロー: {selectedWorkflow.name}
            </div>
            <div className="text-xs text-gray-500">
              ステータス: {
                selectedWorkflow.status === 'active' ? '実行中' :
                selectedWorkflow.status === 'completed' ? '完了' :
                'キャンセル'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}