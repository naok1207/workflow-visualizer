import { z } from 'zod';
import { 
  GetHelpRequest, 
  GetHelpResponse, 
  GetSystemInfoResponse 
} from '@workflow-visualizer/shared';
import { TaskDAO } from '../database/dao/task-dao.js';

// ヘルプコンテンツ
const helpContents: Record<string, GetHelpResponse> = {
  overview: {
    topic: 'overview',
    content: `# ワークフロー可視化システム

Claude Codeが任意のプロジェクトで作業する際の進捗を動的に管理・可視化するシステムです。

## 主要機能
- タスクの作成と管理
- ワークフローの動的変更
- リアルタイム進捗可視化
- エラー時の自動リカバリー

## 使い方
1. create_taskでタスクを作成
2. update_task_progressで進捗を更新
3. add_workflow_stepで必要に応じてステップを追加
4. フロントエンドでリアルタイムに進捗を確認`,
    examples: [
      'get_help(topic="quick-start")',
      'create_task(title="新機能開発", task_type="feature-planning")',
    ],
    related_topics: ['quick-start', 'task-types', 'workflow-management'],
  },
  'quick-start': {
    topic: 'quick-start',
    content: `# クイックスタート

## 1. タスクの作成
\`\`\`
create_task({
  title: "ユーザー認証機能の実装",
  task_type: "feature-planning"
})
\`\`\`

## 2. 進捗の更新
\`\`\`
update_task_progress({
  task_id: "task-123",
  current_step: "research",
  status: "completed",
  result: { findings: "JWT認証が最適" }
})
\`\`\`

## 3. ステップの追加
\`\`\`
add_workflow_step({
  task_id: "task-123",
  after_step: "implementation",
  new_step: {
    id: "security-review",
    name: "セキュリティレビュー"
  }
})
\`\`\``,
    examples: [
      'list_active_tasks()',
      'get_task_status(task_id="task-123", include_workflow=true)',
    ],
    related_topics: ['task-types', 'workflow-management'],
  },
  'task-types': {
    topic: 'task-types',
    content: `# タスクタイプ

## 利用可能なタスクタイプ

### feature-planning（新機能企画）
新機能の企画・設計を行うタスク
- デフォルトステップ: リサーチ → アイデア整理 → 提案書作成 → Issue作成

### issue-resolution（Issue解決）
バグ修正やIssueの解決を行うタスク
- デフォルトステップ: 問題分析 → 設計 → 実装 → テスト → PR作成 → レビュー

### documentation（ドキュメント更新）
ドキュメントの作成・更新を行うタスク
- デフォルトステップ: 調査 → 執筆 → レビュー → 公開

### research（調査・研究）
技術調査や研究を行うタスク
- デフォルトステップ: 情報収集 → 分析 → レポート作成

### refactoring（リファクタリング）
コードの改善・最適化を行うタスク
- デフォルトステップ: 現状分析 → 設計 → 実装 → テスト → 性能測定

### custom（カスタム）
ユーザー定義のカスタムタスク
- デフォルトステップ: ステップ1 → ステップ2 → ステップ3`,
    examples: [
      'create_task(title="バグ修正", task_type="issue-resolution")',
      'create_task(title="API設計", task_type="custom", workflow_template="api-design")',
    ],
    related_topics: ['workflow-management', 'quick-start'],
  },
  'workflow-management': {
    topic: 'workflow-management',
    content: `# ワークフロー管理

## 動的ワークフロー変更

### ステップの追加
実行中のワークフローに新しいステップを追加できます。
\`\`\`
add_workflow_step({
  task_id: "task-123",
  after_step: "design",
  new_step: {
    id: "prototype",
    name: "プロトタイプ作成",
    description: "UIプロトタイプの作成"
  }
})
\`\`\`

### ステップの変更
既存ステップの情報を更新できます。
\`\`\`
modify_workflow({
  task_id: "task-123",
  step_id: "implementation",
  updates: {
    name: "実装とユニットテスト",
    description: "実装とテストを同時進行"
  }
})
\`\`\`

### ワークフローの分岐
特定のステップから分岐を作成できます。
\`\`\`
fork_workflow({
  task_id: "task-123",
  from_step: "design",
  new_branch_name: "alternative-approach"
})
\`\`\``,
    examples: [
      'get_workflow_history(task_id="task-123", limit=10)',
      'modify_workflow(task_id="task-123", step_id="testing", updates={order: 3})',
    ],
    related_topics: ['task-types', 'quick-start'],
  },
  'api': {
    topic: 'api',
    content: `# API リファレンス

## タスク管理ツール
- create_task: タスクの作成
- update_task_progress: 進捗の更新
- get_task_status: ステータス確認
- list_active_tasks: アクティブタスク一覧

## ワークフロー管理ツール
- add_workflow_step: ステップ追加
- modify_workflow: ワークフロー変更
- fork_workflow: 分岐作成
- get_workflow_history: 履歴取得

## ヘルプツール
- get_help: ヘルプ情報取得
- get_system_info: システム情報確認

詳細は各ツールのドキュメントを参照してください。`,
    examples: [
      'get_help(topic="task-types")',
      'get_system_info()',
    ],
    related_topics: ['overview', 'quick-start'],
  },
};

// システム起動時刻
const systemStartTime = Date.now();

// ヘルプツール
export const helpTool = {
  definition: {
    name: 'get_help',
    description: 'ワークフロー可視化システムのヘルプ情報を取得',
    inputSchema: z.object({
      topic: z.enum(['overview', 'quick-start', 'task-types', 'workflow-management', 'api'])
        .optional()
        .describe('ヘルプトピック（省略時はoverview）'),
    }).describe('ヘルプ取得のパラメータ'),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'get_help') {
        return { error: 'Unknown tool' };
      }

      const args = request.params.arguments as GetHelpRequest;
      const topic = args.topic || 'overview';
      const response = helpContents[topic];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  },
};

// システム情報ツール
export const systemInfoTool = {
  definition: {
    name: 'get_system_info',
    description: 'システムの状態と統計情報を取得',
    inputSchema: z.object({}).describe('パラメータなし'),
  },
  handler: {
    method: 'tools/call',
    handler: async (request: any) => {
      if (request.params.name !== 'get_system_info') {
        return { error: 'Unknown tool' };
      }

      const uptime = Math.floor((Date.now() - systemStartTime) / 1000);

      // Get task stats
      let stats = { active_tasks_count: 0, completed_tasks_count: 0 };
      try {
        stats = TaskDAO.getTaskStats();
      } catch (error) {
        console.error('Failed to get task stats:', error);
      }

      const response: GetSystemInfoResponse = {
        version: '1.0.0',
        status: 'healthy',
        database_connected: true,
        websocket_connected: false, // TODO: WebSocket接続状態
        active_tasks_count: stats.active_tasks_count,
        completed_tasks_count: stats.completed_tasks_count,
        uptime_seconds: uptime,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  },
};