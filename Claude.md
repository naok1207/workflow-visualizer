# ワークフロー可視化システム - プロジェクトコンテキスト

## 🎯 プロジェクトの目的

このプロジェクトは、**Claude Codeが任意のプロジェクトで作業する際の進捗を動的に管理・可視化する**ためのMCPサーバーベースのシステムです。

### なぜこのシステムが必要か？

Claude Codeが複雑なプロジェクトで作業する際に：
- 現在どの作業フェーズにいるのか不明確
- 次に何をすべきか忘れてしまう
- 作業の進捗が可視化されていない
- エラー時のリカバリーフローが不明

これらの問題を解決し、Claude Codeの作業効率を大幅に向上させます。

## 🚀 主要機能

### 1. 動的ワークフロー管理
- **6つのタスクタイプ**（新機能企画、Issue解決、ドキュメント更新など）
- **実行中のワークフロー変更**（ステップの追加・削除・変更）
- **エラー時の自動リカバリーフロー**

### 2. MCP統合
- **ヘルプツール** - 使い方を即座に学習
- **タスク管理ツール** - 作成・更新・状態確認
- **ワークフロー操作ツール** - 動的な調整

### 3. リアルタイム可視化
- **React Flow**によるノードベースの表示
- **WebSocket**による即時更新
- **進捗パーセンテージ**の自動計算

## 📋 タスクタイプ

| タイプ | 用途 | デフォルトワークフロー |
|--------|------|------------------------|
| `feature-planning` | 新機能の企画 | リサーチ→アイデア整理→提案書作成→Issue作成 |
| `issue-resolution` | バグ修正・Issue解決 | 分析→設計→実装→テスト→PR作成→レビュー |
| `documentation` | ドキュメント更新 | 調査→執筆→レビュー→公開 |
| `research` | 調査・研究タスク | 情報収集→分析→レポート作成 |
| `refactoring` | コード改善 | 現状分析→設計→実装→テスト→性能測定 |
| `custom` | カスタムタスク | ユーザー定義のワークフロー |

## 🛠️ 技術スタック

- **Frontend**: React 18 + TypeScript + React Flow + Zustand
- **Backend**: Node.js + MCP Server + Socket.io
- **Database**: SQLite (Better-SQLite3)
- **Build**: Vite
- **Test**: Vitest + Playwright

## 📁 プロジェクト構造

```
workflow-visualizer/
├── frontend/          # React可視化UI
├── mcp-server/       # MCPサーバー実装
├── shared/           # 共有型定義
├── docs/            # ドキュメント
└── todo.md          # タスク管理
```

## 🎮 使用例

```typescript
// 1. 新機能開発の開始
const task = await create_task({
  title: "ユーザー認証機能の実装",
  task_type: "feature-planning"
});

// 2. リサーチ完了
await update_task_progress({
  task_id: task.task_id,
  current_step: "research",
  status: "completed",
  result: { 
    findings: "JWT認証が最適",
    references: ["https://jwt.io"]
  }
});

// 3. 動的にステップ追加（セキュリティレビューが必要と判明）
await add_workflow_step({
  task_id: task.task_id,
  after_step: "implementation",
  new_step: {
    id: "security-review",
    name: "セキュリティレビュー"
  }
});
```

## 🚦 開発状況

- **現在のフェーズ**: プロジェクト初期化前
- **次のタスク**: 基本的なプロジェクト構造の作成
- **優先事項**: MCPヘルプツールの実装

## 💡 設計思想

1. **Claude Codeファースト** - AI支援開発を前提とした設計
2. **シンプルさ重視** - 個人開発に最適化
3. **拡張性** - 将来的な機能追加を考慮
4. **可視性** - 全ての進捗を見える化

## 📝 重要な決定事項

1. **React Flow採用** - 豊富な機能とドキュメント
2. **SQLite選択** - セットアップ不要で個人開発に最適
3. **MCP統合** - Claude Codeとのシームレスな連携
4. **ヘルプツール優先** - 使い方を即座に学習可能

## 🔗 関連ドキュメント

### 基本ドキュメント
- [README.md](./README.md) - プロジェクト概要
- [QUICKSTART.md](./QUICKSTART.md) - 60秒で動作確認
- [ARCHITECTURE.md](./ARCHITECTURE.md) - システム設計
- [todo.md](./todo.md) - 現在のタスク一覧

### 詳細ドキュメント（docs/）

#### MCP使用ガイド
- [MCP Getting Started](./docs/mcp-usage/getting-started.md) - MCPの基本的な使い方
- [MCPツールリファレンス](./docs/mcp-usage/tool-reference.md) - 全ツールの詳細仕様
- [システム使用ガイド](./docs/mcp-usage/system-usage.md) - タスクタイプ別の詳細な使用方法

#### 開発ガイド
- [開発環境セットアップ](./docs/development/development.md) - 環境構築とコマンド一覧
- [GitHub開発フロー](./docs/development/git-workflow.md) - ghコマンドを使った開発手順

#### アーキテクチャ
- [データベース設計](./docs/architecture/database.md) - テーブル定義とスキーマ詳細
- [設計決定記録](./docs/architecture/adr/) - 技術選定の理由と背景

#### API仕様
- [API仕様書](./docs/api/api-spec.md) - REST/WebSocket/MCP APIの完全な仕様

### 開発用ドキュメント
- [INITIAL_PROMPT.md](./INITIAL_PROMPT.md) - 開発開始時のプロンプト集
- [PROMPT_HISTORY.md](./PROMPT_HISTORY.md) - プロンプト実行履歴
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - 開発進捗の記録
