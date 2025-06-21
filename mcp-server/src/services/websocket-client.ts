import { io, Socket } from 'socket.io-client';
import { 
  Task, 
  WorkflowStep, 
  Workflow,
  TaskCreatedEvent,
  ProgressUpdatedEvent,
  WorkflowModifiedEvent 
} from '@workflow-visualizer/shared';

let socket: Socket | null = null;

export function initWebSocketClient(): void {
  const wsUrl = process.env.WEBSOCKET_URL || 'http://localhost:3001';
  
  socket = io(wsUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.error('WebSocket connected to:', wsUrl);
  });

  socket.on('disconnect', () => {
    console.error('WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

export async function emitTaskEvent(task: Task): Promise<void> {
  if (!socket?.connected) {
    console.error('WebSocket not connected, skipping task event');
    return;
  }

  const event: TaskCreatedEvent = {
    type: 'task_created',
    data: task,
  };

  socket.emit('task_created', event);
}

export async function emitProgressEvent(data: {
  task_id: string;
  progress_percentage: number;
  current_step?: WorkflowStep;
}): Promise<void> {
  if (!socket?.connected) {
    console.error('WebSocket not connected, skipping progress event');
    return;
  }

  const event: ProgressUpdatedEvent = {
    type: 'progress_updated',
    data,
  };

  socket.emit('progress_updated', event);
}

export async function emitWorkflowEvent(data: {
  task_id: string;
  workflow: Workflow;
  action: string;
}): Promise<void> {
  if (!socket?.connected) {
    console.error('WebSocket not connected, skipping workflow event');
    return;
  }

  const event: WorkflowModifiedEvent = {
    type: 'workflow_modified',
    data,
  };

  socket.emit('workflow_modified', event);
}

export async function emitWorkflowCreated(taskId: string, workflow: Workflow): Promise<void> {
  if (!socket?.connected) {
    console.error('WebSocket not connected, skipping workflow created event');
    return;
  }

  socket.emit('workflow_created', {
    task_id: taskId,
    workflow,
  });
}

export function closeWebSocketClient(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
}