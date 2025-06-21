import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { 
  TaskCreatedEvent, 
  ProgressUpdatedEvent, 
  WorkflowModifiedEvent,
  ListActiveTasksResponse,
  GetTaskStatusResponse,
  Task,
  Workflow 
} from '@workflow-visualizer/shared';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Mock data store (本番環境では実際のデータベースを使用)
const mockTasks: Map<string, Task> = new Map();
const mockWorkflows: Map<string, Workflow> = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    connected_clients: io.sockets.sockets.size,
    timestamp: new Date().toISOString(),
  });
});

// API: アクティブタスク一覧
app.get('/api/tasks/active', (req, res) => {
  const tasks = Array.from(mockTasks.values()).filter(
    task => task.status === 'active' || task.status === 'pending'
  );
  
  const response: ListActiveTasksResponse = {
    tasks,
    total_count: tasks.length,
  };
  
  res.json(response);
});

// API: タスクステータス取得
app.get('/api/tasks/:taskId/status', (req, res) => {
  const { taskId } = req.params;
  const { include_workflow, include_history } = req.query;
  
  const task = mockTasks.get(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const response: GetTaskStatusResponse = { task };
  
  if (include_workflow === 'true' && task.workflow_id) {
    const workflow = mockWorkflows.get(task.workflow_id);
    if (workflow) {
      response.workflow = workflow;
    }
  }
  
  if (include_history === 'true') {
    response.history = []; // モックでは履歴は空
  }
  
  res.json(response);
});

// API: タスクのワークフロー取得
app.get('/api/tasks/:taskId/workflow', (req, res) => {
  const { taskId } = req.params;
  
  const task = mockTasks.get(taskId);
  if (!task || !task.workflow_id) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  const workflow = mockWorkflows.get(task.workflow_id);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json(workflow);
});

// API: ワークフロー取得
app.get('/api/workflows/:workflowId', (req, res) => {
  const { workflowId } = req.params;
  
  const workflow = mockWorkflows.get(workflowId);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json(workflow);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room based on task_id
  socket.on('join_task', (taskId: string) => {
    socket.join(`task:${taskId}`);
    console.log(`Client ${socket.id} joined task:${taskId}`);
  });

  // Leave a task room
  socket.on('leave_task', (taskId: string) => {
    socket.leave(`task:${taskId}`);
    console.log(`Client ${socket.id} left task:${taskId}`);
  });

  // Handle task created event
  socket.on('task_created', (event: TaskCreatedEvent) => {
    console.log('Task created event:', event.data.task_id);
    
    // モックデータに追加
    mockTasks.set(event.data.task_id, event.data);
    
    // Broadcast to all connected clients
    io.emit('task_created', event);
    
    // Also emit to specific task room
    io.to(`task:${event.data.task_id}`).emit('task_created', event);
  });

  // Handle progress updated event
  socket.on('progress_updated', (event: ProgressUpdatedEvent) => {
    console.log('Progress updated event:', event.data.task_id);
    
    // Broadcast to all connected clients
    io.emit('progress_updated', event);
    
    // Also emit to specific task room
    io.to(`task:${event.data.task_id}`).emit('progress_updated', event);
  });

  // Handle workflow modified event
  socket.on('workflow_modified', (event: WorkflowModifiedEvent) => {
    console.log('Workflow modified event:', event.data.task_id);
    
    // モックデータに追加/更新
    if (event.data.workflow) {
      mockWorkflows.set(event.data.workflow.workflow_id, event.data.workflow);
    }
    
    // Broadcast to all connected clients
    io.emit('workflow_modified', event);
    
    // Also emit to specific task room
    io.to(`task:${event.data.task_id}`).emit('workflow_modified', event);
  });

  // Handle workflow created event (追加)
  socket.on('workflow_created', (data: { task_id: string; workflow: Workflow }) => {
    console.log('Workflow created:', data.workflow.workflow_id);
    
    // モックデータに追加
    mockWorkflows.set(data.workflow.workflow_id, data.workflow);
    
    // タスクのworkflow_idを更新
    const task = mockTasks.get(data.task_id);
    if (task) {
      task.workflow_id = data.workflow.workflow_id;
      mockTasks.set(data.task_id, task);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});