import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultDbPath = path.join(__dirname, '../../../data/workflow.db');
export const DATABASE_PATH = process.env.DATABASE_PATH || defaultDbPath;

export async function initDatabase(): Promise<Database.Database> {
  // データディレクトリの確認と作成
  const dataDir = path.dirname(DATABASE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const db = new Database(DATABASE_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  db.exec(`
    -- タスクタイプマスタ
    CREATE TABLE IF NOT EXISTS task_types (
      type_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      default_workflow_template TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- タスクテーブル
    CREATE TABLE IF NOT EXISTS tasks (
      task_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      task_type TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'failed', 'cancelled')),
      progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
      workflow_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME,
      metadata TEXT, -- JSON
      FOREIGN KEY (task_type) REFERENCES task_types(type_id)
    );

    -- ワークフローテーブル
    CREATE TABLE IF NOT EXISTS workflows (
      workflow_id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
      current_step_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
    );

    -- ワークフローステップテーブル
    CREATE TABLE IF NOT EXISTS workflow_steps (
      step_id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'failed', 'skipped')),
      started_at DATETIME,
      completed_at DATETIME,
      result TEXT, -- JSON
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE
    );

    -- ワークフロー履歴テーブル
    CREATE TABLE IF NOT EXISTS workflow_history (
      history_id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('created', 'step_added', 'step_modified', 'step_removed', 'forked')),
      details TEXT NOT NULL, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE
    );

    -- インデックス
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);
    CREATE INDEX IF NOT EXISTS idx_workflows_task ON workflows(task_id);
    CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON workflow_steps(status);
    CREATE INDEX IF NOT EXISTS idx_workflow_history_workflow ON workflow_history(workflow_id);

    -- トリガー: updated_atの自動更新
    CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
    AFTER UPDATE ON tasks
    BEGIN
      UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE task_id = NEW.task_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_workflows_updated_at
    AFTER UPDATE ON workflows
    BEGIN
      UPDATE workflows SET updated_at = CURRENT_TIMESTAMP WHERE workflow_id = NEW.workflow_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_workflow_steps_updated_at
    AFTER UPDATE ON workflow_steps
    BEGIN
      UPDATE workflow_steps SET updated_at = CURRENT_TIMESTAMP WHERE step_id = NEW.step_id;
    END;
  `);

  // 初期データの投入
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO task_types (type_id, name, description, default_workflow_template)
    VALUES (?, ?, ?, ?)
  `);

  const taskTypes = [
    ['feature-planning', '新機能企画', '新しい機能の企画・設計を行うタスク', 'feature-planning-default'],
    ['issue-resolution', 'Issue解決', 'バグ修正やIssueの解決を行うタスク', 'issue-resolution-default'],
    ['documentation', 'ドキュメント更新', 'ドキュメントの作成・更新を行うタスク', 'documentation-default'],
    ['research', '調査・研究', '技術調査や研究を行うタスク', 'research-default'],
    ['refactoring', 'リファクタリング', 'コードの改善・最適化を行うタスク', 'refactoring-default'],
    ['custom', 'カスタム', 'ユーザー定義のカスタムタスク', 'custom-default']
  ];

  for (const taskType of taskTypes) {
    stmt.run(...taskType);
  }

  return db;
}

// シングルトンインスタンス
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

export async function setupDatabase(): Promise<void> {
  dbInstance = await initDatabase();
}