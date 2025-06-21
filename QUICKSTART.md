# QUICKSTART - 60秒で動作確認

## 🚀 最速セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. データベース初期化
npm run init:db

# 3. Docker環境起動（MCPサーバーとWebSocketサーバー）
docker-compose -f docker-compose.dev.yml up -d

# 4. フロントエンド起動（別ターミナル）
npm run dev:frontend

# 5. ブラウザで確認
open http://localhost:5173
```

## 🎯 Claude Codeでの動作確認

### 1. MCPサーバーの設定

`~/.config/claude/claude_desktop_config.json` に以下を追加:

```json
{
  "mcpServers": {
    "workflow-visualizer": {
      "command": "node",
      "args": ["/path/to/workflow-visualizer/mcp-server/dist/server.js"],
      "env": {
        "DATABASE_PATH": "/path/to/workflow-visualizer/data/workflow.db",
        "WEBSOCKET_URL": "http://localhost:3001"
      }
    }
  }
}
```

### 2. Claude Codeで実行

```typescript
// ヘルプを確認
await get_help({ topic: "quick-start" })

// タスクを作成
const result = await create_task({
  title: "ユーザー認証機能の実装",
  task_type: "feature-planning",
  description: "JWTベースの認証システムを実装"
})

// アクティブタスクを確認
await list_active_tasks()

// 進捗を更新
await update_task_progress({
  task_id: result.task_id,
  current_step: "research",
  status: "completed",
  result: {
    findings: "JWT認証が最適",
    references: ["https://jwt.io"]
  }
})

// ステータス確認
await get_task_status({ 
  task_id: result.task_id,
  include_workflow: true 
})
```

### 3. ブラウザで確認

http://localhost:5173 を開いて:
- 左サイドバーにタスクが表示される
- タスクをクリックするとワークフローが可視化される
- 進捗更新がリアルタイムで反映される

## 🛠️ 開発コマンド

```bash
# 全サービス起動（開発モード）
npm run dev

# 個別起動
npm run dev:frontend    # フロントエンドのみ
npm run dev:mcp        # MCPサーバーのみ（ビルド後）
npm run dev:websocket  # WebSocketサーバーのみ

# ビルド
npm run build

# リンター & 型チェック
npm run lint
npm run typecheck
```

## 🔍 トラブルシューティング

### ポートエラー
```bash
# 使用中のポートを確認して終了
lsof -i :3001 && kill -9 $(lsof -t -i :3001)
lsof -i :5173 && kill -9 $(lsof -t -i :5173)
```

### データベースリセット
```bash
rm -rf data/workflow.db
npm run init:db
```

### Docker再起動
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
```

## 📱 使用例

### 新機能開発フロー
```typescript
// 1. 企画タスク作成
create_task({
  title: "ダッシュボード機能",
  task_type: "feature-planning"
})

// 2. ステップ追加
add_workflow_step({
  task_id: "...",
  after_step: "ideation",
  new_step: {
    id: "prototype",
    name: "プロトタイプ作成"
  }
})

// 3. 進捗更新
update_task_progress({
  task_id: "...",
  current_step: "research",
  status: "completed"
})
```

詳細は[システム使用ガイド](./docs/mcp-usage/system-usage.md)を参照してください。