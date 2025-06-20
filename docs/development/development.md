# 開発ガイド

## 開発環境セットアップ

### 必要なツール
- Node.js v18.0.0以上
- npm v10.0.0以上
- Git
- GitHub CLI（`gh`）

### 初期セットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/naok1207/workflow-visualizer.git
cd workflow-visualizer

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.example .env

# 4. データベースの初期化
npm run db:migrate

# 5. 開発サーバーの起動
npm run dev
```

## 開発コマンド

```bash
# 開発サーバー
npm run dev              # フロントエンド + バックエンド同時起動
npm run dev:frontend     # フロントエンドのみ
npm run dev:mcp         # MCPサーバーのみ

# テスト
npm run test            # 全テスト実行
npm run test:watch      # ウォッチモード
npm run test:e2e        # E2Eテスト

# ビルド
npm run build           # 全体ビルド

# 品質チェック
npm run lint            # ESLint
npm run typecheck       # TypeScript型チェック
npm run format          # Prettier
```

## 開発フロー

### 1. Issue作成とブランチ作成

```bash
# Issue作成
gh issue create --title "機能名"

# ブランチ作成
git checkout -b feature/機能名
```

### 2. 実装とコミット

```bash
# セマンティックコミット
git commit -m "feat: 機能説明"
git commit -m "fix: バグ修正"
git commit -m "docs: ドキュメント更新"
```

### 3. PR作成とマージ

```bash
# PR作成
gh pr create --fill --draft

# マージ
gh pr merge --squash --delete-branch
```

## トラブルシューティング

### ポート競合
```bash
# 使用中のポートを確認
lsof -i :5173
lsof -i :3001

# 別ポートで起動
PORT=5174 npm run dev:frontend
```

### データベースエラー
```bash
# データベースリセット
rm data/workflow.db
npm run db:migrate
```

### 型エラー
```bash
# 型チェック
npm run typecheck

# VSCodeでTS Server再起動
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## 参考リンク

- [GitHub開発フロー](./git-workflow.md)
- [アーキテクチャ](/ARCHITECTURE.md)
- [API仕様](../api/api-spec.md)
