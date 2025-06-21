import { ReactFlowProvider } from 'reactflow';
import { Toaster } from 'react-hot-toast';
import WorkflowCanvas from './components/workflow/Canvas/WorkflowCanvas';
import ControlPanel from './components/workflow/Controls/ControlPanel';
import TaskList from './components/ui/TaskList';
import Header from './components/ui/Header';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  // WebSocket接続を初期化
  useWebSocket();

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          {/* サイドバー: タスクリスト */}
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <TaskList />
          </aside>

          {/* メインエリア: ワークフローキャンバス */}
          <main className="flex-1 relative">
            <WorkflowCanvas />
            
            {/* フローティングコントロールパネル */}
            <div className="absolute top-4 right-4 z-10">
              <ControlPanel />
            </div>
          </main>
        </div>

        {/* トースト通知 */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default App;