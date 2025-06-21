# アーキテクチャ設計書

## システム概要

ワークフロー可視化システムは、Claude Codeが作業進捗を動的に管理・可視化するためのMCPサーバーベースのシステムです。

### 主要コンポーネント

- **フロントエンド**: React + TypeScript + React Flow
- **MCPサーバー**: Model Context Protocolサーバー
- **WebSocket**: リアルタイム通信（Socket.io）
- **データベース**: SQLite（永続化層）

## アーキテクチャ概観

```
┌─────────────────────────────────────────────────────────────────┐
│                         クライアント層                            │
│  ┌─────────────┐  ┌─────────────┐                            │
│  │   Browser   │  │Claude Code  │                            │
│  │  (React)    │  │   Client    │                            │
│  └──────┬──────┘  └──────┬──────┘                            │
│         │                 │                                     │
└─────────┼─────────────────┼─────────────────────────────────────┘
          │ HTTPS/WSS       │ MCP
┌─────────┼─────────────────┼─────────────────────────────────────┐
│         ▼                 ▼                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  API Server │  │ MCP Server  │  │  WebSocket  │          │
│  │   (Express) │  │             │  │   Server    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                 │                 │                   │
│                     アプリケーション層                           │
│  ┌─────────────────────────────────────────┐                  │
│  │          ワークフローエンジン              │                  │
│  └─────────────────────────────────────────┘                  │
│                                                                │
│                      データ層                                   │
│  ┌─────────────┐                                              │
│  │   SQLite    │                                              │
│  │  (永続化)    │                                              │
│  └─────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Docker構成

### コンテナ分離方針

**ローカル環境で実行:**
- フロントエンド開発サーバー（Vite）
- Node.js開発ツール（npm, yarn等）
- ビルドツール
- 開発用CLIツール

**Docker環境で実行:**
- MCPサーバー
- SQLiteデータベース（Volume管理）
- WebSocketサーバー
- 将来的な追加サービス（Redis、監視ツール等）

### docker-compose.yml構成

```yaml
version: '3.8'

services:
  mcp-server:
    build: ./mcp-server
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./mcp-server/src:/app/src
    environment:
      - NODE_ENV=development
      - DATABASE_PATH=/app/data/workflow.db
    depends_on:
      - db-init

  websocket-server:
    build: ./websocket-server
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development

  db-init:
    build: ./database
    volumes:
      - ./data:/data
    command: /app/init-db.sh

volumes:
  data:
```

### 開発時の通信フロー

1. **フロントエンド（ローカル:5173）** → **MCPサーバー（Docker:3001）**
2. **Claude Code** → **MCPサーバー（Docker:3001）**
3. **フロントエンド** ↔ **WebSocketサーバー（Docker:3002）**

## コンポーネント設計

### フロントエンド構造

```
frontend/src/
├── components/
│   ├── workflow/        # ワークフロー関連
│   │   ├── Canvas/     # キャンバスコンポーネント
│   │   ├── Nodes/      # ノードコンポーネント
│   │   └── Controls/   # コントロールパネル
│   └── ui/             # 汎用UIコンポーネント
├── hooks/              # カスタムフック
├── stores/             # 状態管理（Zustand）
├── services/           # APIクライアント
└── types/              # TypeScript型定義
```

### MCPサーバー構造

```
mcp-server/src/
├── server.ts           # エントリーポイント
├── tools/              # MCPツール定義
│   ├── help.ts         # ヘルプツール
│   ├── task-tools.ts   # タスク管理ツール
│   └── workflow-tools.ts # ワークフロー管理ツール
├── services/           # ビジネスロジック
├── database/           # データベース関連
└── types/              # TypeScript型定義
```

## データモデル

### 主要テーブル

1. **task_types** - タスクタイプ定義
2. **tasks** - タスク管理
3. **task_workflows** - タスク固有のワークフロー
4. **workflow_steps** - ステップ定義
5. **task_steps** - ステップ実行記録
6. **workflow_modifications** - 変更履歴

詳細は[データベース設計](./database.md)を参照。

## 通信プロトコル

### WebSocket通信

リアルタイム更新のためのイベント：
- `task_created` - タスク作成通知
- `progress_updated` - 進捗更新
- `workflow_modified` - ワークフロー変更
- `step_completed` - ステップ完了

### MCP通信

主要ツール：
- `get_help` - ヘルプ情報取得
- `create_task` - タスク作成
- `update_task_progress` - 進捗更新
- `add_workflow_step` - ステップ追加

詳細は[API仕様](../api/api-spec.md)を参照。

## セキュリティ設計

個人利用のため、認証機能は実装しません。ローカル環境での使用を前提とします。

### 入力検証

Zodスキーマによる検証を全てのAPIエンドポイントとMCPツールで実装：

```typescript
const TaskCreateSchema = z.object({
  title: z.string().min(1).max(255),
  task_type: z.enum(['feature-planning', 'issue-resolution', ...]),
  metadata: z.record(z.any()).optional()
});
```

## パフォーマンス目標

| メトリクス | 目標値 |
|-----------|--------|
| 初期ロード時間 | < 3秒 |
| API応答時間 | < 200ms |
| ノード数上限 | 1000個 |

## 拡張ポイント

1. **カスタムノードタイプ** - プラグインとして追加可能
2. **新しいタスクタイプ** - データベースに追加するだけ
3. **ワークフローテンプレート** - カスタムワークフローの保存と再利用
