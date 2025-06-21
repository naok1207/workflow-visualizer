import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  TaskCreatedEvent, 
  ProgressUpdatedEvent, 
  WorkflowModifiedEvent 
} from '@workflow-visualizer/shared';
import { useTaskStore } from '../stores/taskStore';
import { useWorkflowStore } from '../stores/workflowStore';

let socket: Socket | null = null;

export const useWebSocket = () => {
  const { addTask, updateTask, selectedTaskId } = useTaskStore();
  const { selectedWorkflow, updateStepStatus } = useWorkflowStore();

  useEffect(() => {
    // WebSocket接続を初期化
    const wsUrl = process.env.VITE_WS_URL || 'http://localhost:3001';
    socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // 接続イベント
    socket.on('connect', () => {
      console.log('WebSocket connected');
      toast.success('リアルタイム更新に接続しました');

      // 選択中のタスクがあればルームに参加
      if (selectedTaskId) {
        socket?.emit('join_task', selectedTaskId);
      }
    });

    // 切断イベント
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      toast.error('リアルタイム更新が切断されました');
    });

    // タスク作成イベント
    socket.on('task_created', (event: TaskCreatedEvent) => {
      console.log('Task created:', event.data.task_id);
      addTask(event.data);
      toast.success(`新しいタスク「${event.data.title}」が作成されました`);
    });

    // 進捗更新イベント
    socket.on('progress_updated', (event: ProgressUpdatedEvent) => {
      console.log('Progress updated:', event.data.task_id);
      updateTask(event.data.task_id, {
        progress_percentage: event.data.progress_percentage,
      });

      // 現在のステップを更新
      if (event.data.current_step && selectedWorkflow?.task_id === event.data.task_id) {
        updateStepStatus(event.data.current_step.step_id, event.data.current_step.status);
      }

      toast(`進捗: ${event.data.progress_percentage}%`, {
        icon: '📊',
      });
    });

    // ワークフロー変更イベント
    socket.on('workflow_modified', (event: WorkflowModifiedEvent) => {
      console.log('Workflow modified:', event.data.task_id);
      
      if (selectedWorkflow?.task_id === event.data.task_id) {
        // 選択中のワークフローが変更された場合は再読み込みを促す
        toast('ワークフローが変更されました', {
          icon: '🔄',
          duration: 5000,
        });
      }
    });

    // クリーンアップ
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  // 選択中のタスクが変更されたらルームを切り替え
  useEffect(() => {
    if (!socket?.connected) return;

    // 以前のルームから退出
    if (selectedTaskId) {
      socket.emit('leave_task', selectedTaskId);
    }

    // 新しいルームに参加
    if (selectedTaskId) {
      socket.emit('join_task', selectedTaskId);
    }
  }, [selectedTaskId]);

  return { socket };
};