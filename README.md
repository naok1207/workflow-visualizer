# ワークフロー可視化システム

## 📋 概要

任意のプロジェクトでClaude Codeが作業する際の進捗を動的に管理・可視化するMCPサーバーベースのシステムです。

### ✨ 主な機能

- 🎯 **動的ワークフロー管理** - タスクタイプに応じた柔軟なワークフロー
- 🤖 **Claude Code統合** - MCPツールによる自動進捗更新
- 🔄 **リアルタイム可視化** - WebSocketによる即時反映
- 📊 **多様なタスクタイプ** - 新機能考案、Issue解決、ドキュメント更新など
- 🔀 **ワークフロー調整** - 実行中の動的なフロー変更

## 🚀 クイックスタート

### Claude Codeでの利用方法

```typescript
// 1. MCPサーバーに接続
/mcp

// 2. システム情報を確認
await get_system_info()

// 3. 新しいタスクを作成
const task = await create_task({
  title: "ユーザー認証機能の設計",
  task_type: "feature-planning"
});

// 4. 進捗を更新
await update_task_progress({
  task_id: task.task_id,
  current_step: "research",
  status: "completed",
  result: { findings: "..." }
});
```

詳細な使い方は [MCP利用ガイド](docs/mcp-usage/getting-started.md) を参照してください。

## 🛠️ 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/naok1207/workflow-visualizer.git
cd workflow-visualizer

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 📁 プロジェクト構造

```
workflow-visualizer/
├── frontend/          # Reactフロントエンド（可視化UI）
├── mcp-server/       # MCPサーバー（Claude Code連携）
├── shared/           # 共有型定義
└── docs/            # ドキュメント
```

## 📖 ドキュメント

- [MCP利用ガイド](docs/mcp-usage/) - Claude Codeでの使い方
- [アーキテクチャ設計](ARCHITECTURE.md)
- [API仕様](API_SPEC.md)
- [データベース設計](DATABASE_SCHEMA.md)
- [開発ガイド](docs/development/)

## 🎯 現在のタスク

[todo.md](todo.md) を参照してください。

## 🤝 開発フロー

[GitHub開発フロー](docs/development/git-workflow.md) を参照してください。

---

<p align="center">個人プロジェクト - Claude Codeによる開発</p>
