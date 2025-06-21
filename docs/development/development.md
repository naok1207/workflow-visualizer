# 開発ガイド

## 開発環境セットアップ

### 必要なツール
- Node.js v18.0.0以上（ローカル環境）
- npm v10.0.0以上
- Docker Desktop
- Docker Compose v2.0.0以上
- Git
- GitHub CLI（`gh`）

### 初期セットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/naok1207/workflow-visualizer.git
cd workflow-visualizer

# 2. 依存関係のインストール（ローカル）
npm install

# 3. 環境変数の設定
cp .env.example .env

# 4. Dockerコンテナの起動（MCPサーバー、DB等）
docker-compose up -d

# 5. フロントエンド開発サーバーの起動（ローカル）
npm run dev:frontend
```

### Docker環境の管理

```bash
# コンテナの起動
docker-compose up -d

# コンテナの停止
docker-compose down

# コンテナの再起動
docker-compose restart

# ログの確認
docker-compose logs -f mcp-server
docker-compose logs -f websocket-server

# データを含めて完全削除
docker-compose down -v

# イメージの再ビルド
docker-compose build --no-cache
```

## 開発コマンド

```bash
# 開発サーバー
npm run dev              # フロントエンド（ローカル） + Dockerコンテナ起動
npm run dev:frontend     # フロントエンドのみ（ローカル）
npm run dev:docker       # Dockerコンテナのみ起動

# Docker内のMCPサーバーの開発
npm run docker:mcp-dev   # ホットリロード付きでMCPサーバー起動
npm run docker:mcp-build # MCPサーバーのイメージビルド

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

# データベース操作
npm run db:migrate      # マイグレーション実行
npm run db:reset        # DBリセット
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

## Puppeteer MCPを使った自動検証

### Puppeteer MCPのセットアップ

#### 1. Claude DesktopでのMCP設定

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
// または該当する設定ファイルに追加

{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    // 既存の設定...
  }
}
```

#### 2. 設定の確認

```bash
# Claude Desktopを再起動
# macOS: Cmd+QでClaudeを終了して再起動
# Windows/Linux: システムトレイから終了して再起動
```

#### 3. MCP接続の確認

Claude Codeで以下を実行：

```typescript
// MCPサーバー一覧の確認
/mcp

// Puppeteer MCPが利用可能か確認
// 「puppeteer」がリストに表示されることを確認
```

### 自動検証の実行

#### 1. 基本的な検証スクリプト

```bash
# 検証スクリプト用ディレクトリの作成
mkdir -p puppeteer-tests/scenarios
mkdir -p puppeteer-tests/fixes
mkdir -p puppeteer-tests/reports
```

#### 2. Claude Codeでの実行手順

```typescript
// 1. フロントエンドが起動していることを確認
// npm run dev:frontend

// 2. 自動検証を開始
// Claude Codeで以下のプロンプトを実行：
"ワークフロー可視化システムの自動検証を実行してください。
Puppeteer MCPを使用して、以下を確認してください：
1. フロントエンドが正しく表示される
2. MCPツールが正しく動作する
3. コンソールエラーがない
エラーを発見した場合は、修正してPRを作成してください。"
```

#### 3. 定期的な自動検証

```bash
# cronジョブとして設定する場合の例
# (注意: Claude Codeを自動実行するには追加の設定が必要)

# 毎日1回実行
0 2 * * * /usr/local/bin/run-claude-validation.sh
```

### トラブルシューティング

#### Puppeteer MCPが利用できない

```bash
# MCP設定ファイルの場所を確認
# macOS
ls ~/Library/Application\ Support/Claude/

# Windows
dir %APPDATA%\Claude

# Linux
ls ~/.config/claude/
```

#### ブラウザが起動しない

```typescript
// headlessモードで試す
await puppeteer_launch({
  headless: true,  // trueに変更
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

#### タイムアウトエラー

```typescript
// タイムアウトを増やす
await puppeteer_wait_for_selector({
  selector: '.slow-element',
  timeout: 60000  // 60秒
});
```

### ベストプラクティス

1. **段階的なテスト**
   - まず手動で動作確認
   - 次にClaude Codeでシンプルな検証
   - 最後に自動修正まで実装

2. **エラーの記録**
   - すべてのエラーを`puppeteer-tests/reports/`に保存
   - スクリーンショットを含める
   - 修正の成功率を追跡

3. **PRの品質**
   - 明確なコミットメッセージ
   - 修正前後のスクリーンショット
   - テスト結果の添付

## トラブルシューティング

### Docker関連の問題

#### Dockerコンテナが起動しない
```bash
# Docker Desktopが起動しているか確認
docker version

# コンテナの状態確認
docker-compose ps

# エラーログの確認
docker-compose logs --tail=50
```

#### ファイルの同期がされない
```bash
# Volumeを再マウント
docker-compose down
docker-compose up -d
```

#### データベース接続エラー
```bash
# DBコンテナに入って確認
docker exec -it workflow-visualizer-db-1 sh
# SQLiteが正しく動作しているか確認
sqlite3 /data/workflow.db ".tables"
```

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
