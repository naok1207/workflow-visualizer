import { v4 as uuidv4 } from 'uuid';
import { 
  Workflow, 
  WorkflowStep, 
  WorkflowHistory,
  WorkflowStatus,
  StepStatus 
} from '@workflow-visualizer/shared';
import { getDatabase } from '../init.js';

export class WorkflowDAO {
  static createWorkflow(data: {
    task_id: string;
    name: string;
    steps: Array<{
      name: string;
      description?: string;
      order: number;
    }>;
  }): Workflow {
    const db = getDatabase();
    const workflowId = uuidv4();
    const now = new Date().toISOString();

    // Create workflow
    db.prepare(`
      INSERT INTO workflows (
        workflow_id, task_id, name, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      workflowId,
      data.task_id,
      data.name,
      'active' as WorkflowStatus,
      now,
      now
    );

    // Create steps
    const steps: WorkflowStep[] = [];
    const insertStepStmt = db.prepare(`
      INSERT INTO workflow_steps (
        step_id, workflow_id, name, description, order_index, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const stepData of data.steps) {
      const stepId = uuidv4();
      const step: WorkflowStep = {
        step_id: stepId,
        name: stepData.name,
        description: stepData.description,
        order_index: stepData.order,
        status: 'pending',
        result: undefined,
        error: undefined,
      };

      insertStepStmt.run(
        stepId,
        workflowId,
        stepData.name,
        stepData.description || null,
        stepData.order,
        'pending' as StepStatus,
        now,
        now
      );

      steps.push(step);
    }

    // Set first step as current
    if (steps.length > 0) {
      db.prepare(`
        UPDATE workflows SET current_step_id = ? WHERE workflow_id = ?
      `).run(steps[0].step_id, workflowId);
    }

    // Add history entry
    WorkflowDAO.addHistory(workflowId, 'created', {
      steps: steps.map(s => ({ id: s.step_id, name: s.name }))
    });

    return {
      workflow_id: workflowId,
      task_id: data.task_id,
      name: data.name,
      status: 'active',
      current_step_id: steps[0]?.step_id,
      created_at: now,
      updated_at: now,
      steps,
    };
  }

  static getWorkflow(workflowId: string): Workflow | null {
    const db = getDatabase();
    
    const workflowRow = db.prepare(`
      SELECT * FROM workflows WHERE workflow_id = ?
    `).get(workflowId) as any;

    if (!workflowRow) return null;

    const steps = db.prepare(`
      SELECT * FROM workflow_steps 
      WHERE workflow_id = ? 
      ORDER BY order_index
    `).all(workflowId) as any[];

    return {
      workflow_id: workflowRow.workflow_id,
      task_id: workflowRow.task_id,
      name: workflowRow.name,
      status: workflowRow.status,
      current_step_id: workflowRow.current_step_id,
      created_at: workflowRow.created_at,
      updated_at: workflowRow.updated_at,
      steps: steps.map(row => ({
        step_id: row.step_id,
        name: row.name,
        description: row.description,
        order_index: row.order_index,
        status: row.status,
        started_at: row.started_at,
        completed_at: row.completed_at,
        result: row.result ? JSON.parse(row.result) : undefined,
        error: row.error,
      })),
    };
  }

  static getWorkflowByTaskId(taskId: string): Workflow | null {
    const db = getDatabase();
    
    const workflowRow = db.prepare(`
      SELECT workflow_id FROM workflows WHERE task_id = ?
    `).get(taskId) as any;

    if (!workflowRow) return null;

    return WorkflowDAO.getWorkflow(workflowRow.workflow_id);
  }

  static updateStep(
    workflowId: string, 
    stepId: string, 
    updates: {
      status?: StepStatus;
      result?: Record<string, unknown>;
      error?: string;
    }
  ): void {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);

      if (updates.status === 'active') {
        fields.push('started_at = ?');
        values.push(new Date().toISOString());
      }

      if (['completed', 'failed', 'skipped'].includes(updates.status)) {
        fields.push('completed_at = ?');
        values.push(new Date().toISOString());
      }
    }

    if (updates.result !== undefined) {
      fields.push('result = ?');
      values.push(JSON.stringify(updates.result));
    }

    if (updates.error !== undefined) {
      fields.push('error = ?');
      values.push(updates.error);
    }

    if (fields.length === 0) return;

    values.push(stepId, workflowId);
    db.prepare(`
      UPDATE workflow_steps 
      SET ${fields.join(', ')} 
      WHERE step_id = ? AND workflow_id = ?
    `).run(...values);

    // Update current step if completed
    if (updates.status === 'completed') {
      WorkflowDAO.moveToNextStep(workflowId, stepId);
    }
  }

  static addStep(
    workflowId: string,
    afterStepId: string | null,
    newStep: {
      id: string;
      name: string;
      description?: string;
    }
  ): WorkflowStep {
    const db = getDatabase();
    const now = new Date().toISOString();

    // Get current steps
    const steps = db.prepare(`
      SELECT step_id, order_index FROM workflow_steps 
      WHERE workflow_id = ? 
      ORDER BY order_index
    `).all(workflowId) as any[];

    let newOrder = 1;
    if (afterStepId) {
      const afterStep = steps.find(s => s.step_id === afterStepId);
      if (afterStep) {
        newOrder = afterStep.order_index + 1;
        
        // Shift subsequent steps
        db.prepare(`
          UPDATE workflow_steps 
          SET order_index = order_index + 1 
          WHERE workflow_id = ? AND order_index >= ?
        `).run(workflowId, newOrder);
      }
    } else if (steps.length > 0) {
      newOrder = steps[steps.length - 1].order_index + 1;
    }

    // Insert new step
    const stepId = newStep.id || uuidv4();
    db.prepare(`
      INSERT INTO workflow_steps (
        step_id, workflow_id, name, description, order_index,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      stepId,
      workflowId,
      newStep.name,
      newStep.description || null,
      newOrder,
      'pending' as StepStatus,
      now,
      now
    );

    // Add history
    WorkflowDAO.addHistory(workflowId, 'step_added', {
      step_id: stepId,
      step_name: newStep.name,
      after_step: afterStepId,
      order: newOrder,
    });

    return {
      step_id: stepId,
      name: newStep.name,
      description: newStep.description,
      order_index: newOrder,
      status: 'pending',
    };
  }

  static modifyStep(
    workflowId: string,
    stepId: string,
    updates: {
      name?: string;
      description?: string;
      order?: number;
    }
  ): void {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (updates.order !== undefined) {
      // Handle order change
      const currentStep = db.prepare(`
        SELECT order_index FROM workflow_steps 
        WHERE workflow_id = ? AND step_id = ?
      `).get(workflowId, stepId) as any;

      if (currentStep) {
        const oldOrder = currentStep.order_index;
        const newOrder = updates.order;

        if (oldOrder !== newOrder) {
          // Shift other steps
          if (newOrder > oldOrder) {
            db.prepare(`
              UPDATE workflow_steps 
              SET order_index = order_index - 1 
              WHERE workflow_id = ? AND order_index > ? AND order_index <= ?
            `).run(workflowId, oldOrder, newOrder);
          } else {
            db.prepare(`
              UPDATE workflow_steps 
              SET order_index = order_index + 1 
              WHERE workflow_id = ? AND order_index >= ? AND order_index < ?
            `).run(workflowId, newOrder, oldOrder);
          }

          fields.push('order_index = ?');
          values.push(newOrder);
        }
      }
    }

    if (fields.length === 0) return;

    values.push(stepId, workflowId);
    db.prepare(`
      UPDATE workflow_steps 
      SET ${fields.join(', ')} 
      WHERE step_id = ? AND workflow_id = ?
    `).run(...values);

    // Add history
    WorkflowDAO.addHistory(workflowId, 'step_modified', {
      step_id: stepId,
      updates,
    });
  }

  static addHistory(
    workflowId: string,
    action: WorkflowHistory['action'],
    details: Record<string, unknown>
  ): void {
    const db = getDatabase();
    const historyId = uuidv4();

    db.prepare(`
      INSERT INTO workflow_history (
        history_id, workflow_id, action, details, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      historyId,
      workflowId,
      action,
      JSON.stringify(details),
      new Date().toISOString()
    );
  }

  static getHistory(workflowId: string, limit = 50): WorkflowHistory[] {
    const db = getDatabase();
    
    const rows = db.prepare(`
      SELECT * FROM workflow_history 
      WHERE workflow_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(workflowId, limit) as any[];

    return rows.map(row => ({
      history_id: row.history_id,
      workflow_id: row.workflow_id,
      action: row.action,
      details: JSON.parse(row.details),
      created_at: row.created_at,
    }));
  }

  private static moveToNextStep(workflowId: string, currentStepId: string): void {
    const db = getDatabase();
    
    const currentStep = db.prepare(`
      SELECT order_index FROM workflow_steps 
      WHERE workflow_id = ? AND step_id = ?
    `).get(workflowId, currentStepId) as any;

    if (!currentStep) return;

    const nextStep = db.prepare(`
      SELECT step_id FROM workflow_steps 
      WHERE workflow_id = ? AND order_index = ?
    `).get(workflowId, currentStep.order_index + 1) as any;

    if (nextStep) {
      db.prepare(`
        UPDATE workflows 
        SET current_step_id = ? 
        WHERE workflow_id = ?
      `).run(nextStep.step_id, workflowId);
    } else {
      // All steps completed
      db.prepare(`
        UPDATE workflows 
        SET status = 'completed', current_step_id = NULL 
        WHERE workflow_id = ?
      `).run(workflowId);
    }
  }
}