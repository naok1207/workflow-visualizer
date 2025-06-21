import { v4 as uuidv4 } from 'uuid';
import { Task, TaskType, TaskStatus } from '@workflow-visualizer/shared';
import { getDatabase } from '../init.js';

export class TaskDAO {
  static createTask(data: {
    title: string;
    description?: string;
    task_type: TaskType;
    metadata?: Record<string, unknown>;
  }): Task {
    const db = getDatabase();
    const taskId = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tasks (
        task_id, title, description, task_type, status,
        progress_percentage, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      taskId,
      data.title,
      data.description || null,
      data.task_type,
      'pending' as TaskStatus,
      0,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now,
      now
    );

    return {
      task_id: taskId,
      title: data.title,
      description: data.description,
      task_type: data.task_type,
      status: 'pending',
      progress_percentage: 0,
      workflow_id: '', // Will be set when workflow is created
      created_at: now,
      updated_at: now,
      metadata: data.metadata,
    };
  }

  static getTask(taskId: string): Task | null {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT * FROM tasks WHERE task_id = ?
    `).get(taskId) as any;

    if (!row) return null;

    return {
      task_id: row.task_id,
      title: row.title,
      description: row.description,
      task_type: row.task_type,
      status: row.status,
      progress_percentage: row.progress_percentage,
      workflow_id: row.workflow_id || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      started_at: row.started_at,
      completed_at: row.completed_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  static updateTask(taskId: string, updates: Partial<Task>): void {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);

      // Set started_at when status changes to active
      if (updates.status === 'active') {
        fields.push('started_at = ?');
        values.push(new Date().toISOString());
      }

      // Set completed_at when status changes to completed/failed/cancelled
      if (['completed', 'failed', 'cancelled'].includes(updates.status)) {
        fields.push('completed_at = ?');
        values.push(new Date().toISOString());
      }
    }

    if (updates.progress_percentage !== undefined) {
      fields.push('progress_percentage = ?');
      values.push(updates.progress_percentage);
    }

    if (updates.workflow_id !== undefined) {
      fields.push('workflow_id = ?');
      values.push(updates.workflow_id);
    }

    if (updates.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }

    if (fields.length === 0) return;

    values.push(taskId);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE task_id = ?`;
    db.prepare(sql).run(...values);
  }

  static listActiveTasks(options?: {
    task_type?: TaskType;
    limit?: number;
    offset?: number;
  }): { tasks: Task[]; total_count: number } {
    const db = getDatabase();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    let whereClause = "status IN ('pending', 'active')";
    const params: any[] = [];

    if (options?.task_type) {
      whereClause += ' AND task_type = ?';
      params.push(options.task_type);
    }

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM tasks WHERE ${whereClause}
    `);
    const { count } = countStmt.get(...params) as { count: number };

    // Get tasks
    params.push(limit, offset);
    const tasksStmt = db.prepare(`
      SELECT * FROM tasks 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = tasksStmt.all(...params) as any[];

    const tasks = rows.map(row => ({
      task_id: row.task_id,
      title: row.title,
      description: row.description,
      task_type: row.task_type,
      status: row.status,
      progress_percentage: row.progress_percentage,
      workflow_id: row.workflow_id || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      started_at: row.started_at,
      completed_at: row.completed_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));

    return { tasks, total_count: count };
  }

  static getTaskStats(): {
    active_tasks_count: number;
    completed_tasks_count: number;
  } {
    const db = getDatabase();
    
    const activeCount = db.prepare(`
      SELECT COUNT(*) as count FROM tasks WHERE status IN ('pending', 'active')
    `).get() as { count: number };

    const completedCount = db.prepare(`
      SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'
    `).get() as { count: number };

    return {
      active_tasks_count: activeCount.count,
      completed_tasks_count: completedCount.count,
    };
  }
}