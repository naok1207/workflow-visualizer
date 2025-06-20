# クイックスタート - 60秒で動作確認

## Claude Codeでの最速利用方法

```typescript
// 1. MCPに接続
/mcp

// 2. ヘルプを確認
await get_help({ topic: "quick-start" })

// 3. タスクを作成して進捗更新
const task = await create_task({
  title: "テスト機能",
  task_type: "feature-planning"
});

await update_task_progress({
  task_id: task.task_id,
  current_step: "research",
  status: "completed",
  result: { summary: "調査完了" }
});

// 4. 状態確認
await get_task_status({ task_id: task.task_id })
```

これで基本的な動作が確認できます！

## 開発環境の最速セットアップ

```bash
# 1. クローン
git clone https://github.com/naok1207/workflow-visualizer.git
cd workflow-visualizer

# 2. 依存関係インストール
npm install

# 3. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:5173 を開くと可視化UIが表示されます。

## 次のステップ

詳細は以下を参照：
- [MCP利用ガイド](docs/mcp-usage/getting-started.md)
- [開発ガイド](docs/development/)
- [タスク一覧](todo.md)
