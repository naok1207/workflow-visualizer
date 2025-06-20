# MCP利用ガイド - Getting Started

## 概要

このガイドでは、Claude CodeがワークフローVisiualizerのMCPサーバーを利用する方法を説明します。

## 初回接続時のフロー

### ステップ1: MCPサーバーへの接続

```typescript
// MCPコマンドで接続
/mcp
```

これにより利用可能なツール一覧が表示されますが、**詳細な使い方はまだ分かりません**。

### ステップ2: ヘルプ情報の取得

```typescript
// システム情報の確認
await get_system_info()

// クイックスタートガイドの取得
await get_help({ topic: "quick-start" })

// 利用可能なタスクタイプの確認
await get_help({ topic: "task-types" })
```

### ステップ3: 現在の状態確認

```typescript
// アクティブなタスクを確認
const tasks = await list_active_tasks()

// 特定タスクの詳細確認
if (tasks.length > 0) {
  await get_task_status({ task_id: tasks[0].id })
}
```

## 基本的な使用パターン

### 新しい機能の開発

```typescript
// 1. タスク作成
const task = await create_task({
  title: "ユーザー認証機能の実装",
  task_type: "feature-planning"
});

// 2. リサーチフェーズの完了
await update_task_progress({
  task_id: task.task_id,
  current_step: "research",
  status: "completed",
  result: {
    summary: "JWT認証を採用",
    findings: ["セキュリティ面で優れている", "実装が容易"],
    references: ["https://jwt.io/"]
  }
});

// 3. 次のステップへ
await update_task_progress({
  task_id: task.task_id,
  current_step: "ideation",
  status: "in_progress"
});
```

### Issue解決

```typescript
// 1. Issue解決タスクの作成
const bugTask = await create_task({
  title: "ログイン画面のバグ修正 #123",
  task_type: "issue-resolution",
  metadata: {
    issue_number: 123,
    priority: "high"
  }
});

// 2. 分析結果の記録
await update_task_progress({
  task_id: bugTask.task_id,
  current_step: "analysis",
  status: "completed",
  result: {
    root_cause: "非同期処理のタイミング問題",
    affected_files: ["src/auth/login.tsx"],
    solution: "Promise.allを使用して同期を取る"
  }
});
```

### カスタムワークフロー

```typescript
// 1. カスタムワークフローの定義
const customTask = await create_task({
  title: "パフォーマンス最適化調査",
  task_type: "custom",
  initial_workflow: {
    steps: [
      { id: "profile", name: "現状のプロファイリング" },
      { id: "analyze", name: "ボトルネック分析" },
      { id: "optimize", name: "最適化実装" },
      { id: "verify", name: "改善確認" }
    ]
  }
});

// 2. 動的にステップを追加
await add_workflow_step({
  task_id: customTask.task_id,
  after_step: "analyze",
  new_step: {
    id: "research",
    name: "最適化手法の調査",
    type: "research"
  }
});
```

## トラブルシューティング

### Q: MCPに接続できない
A: MCPサーバーが起動していることを確認してください。

### Q: タスクIDを忘れた
A: `list_active_tasks()` で現在のタスクを確認できます。

### Q: ワークフローを変更したい
A: `add_workflow_step()` や `fork_workflow()` を使用します。

## 次のステップ

- [ツールリファレンス](./tool-reference.md) - 全ツールの詳細
- [実践例](./examples.md) - 具体的な使用例
- [ベストプラクティス](./best-practices.md) - 効率的な使い方
