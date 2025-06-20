# MCP使用ガイド

このディレクトリには、Claude CodeがワークフローVisualizerのMCPサーバーを利用するためのドキュメントが含まれています。

## ドキュメント一覧

1. **[Getting Started](./getting-started.md)** - MCP利用の基本的な流れ
2. **[ツールリファレンス](./tool-reference.md)** - 利用可能な全MCPツールの詳細
3. **[システム使用ガイド](./system-usage.md)** - タスクタイプ別の詳細な使用方法

## クイックスタート

```typescript
// 1. MCPに接続
/mcp

// 2. ヘルプを確認
await get_help({ topic: "quick-start" })

// 3. タスクを作成
const task = await create_task({
  title: "新機能の実装",
  task_type: "feature-planning"
});

// 4. 進捗を更新
await update_task_progress({
  task_id: task.task_id,
  current_step: "research",
  status: "completed"
});
```

詳細は各ドキュメントを参照してください。
