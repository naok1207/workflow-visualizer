# GitHub開発フロー

## 概要

このドキュメントでは、Claude Codeが開発時に使用するGitHubフローを説明します。

## 初期設定

```bash
# 認証確認
gh auth status

# デフォルトリポジトリの設定
gh repo set-default naok1207/workflow-visualizer

# よく使うエイリアスの設定（任意）
gh alias set mine 'issue list --assignee="@me"'
gh alias set bugs 'issue list --label="bug"'
gh alias set prs 'pr list --author="@me"'
```

## 基本的な開発フロー

### 1. Issue管理

```bash
# Issue一覧の確認
gh issue list
gh issue list --assignee @me
gh issue list --label "enhancement"

# 新しいIssueの作成
gh issue create --title "動的ワークフロー変更機能の実装" --body "説明..."

# Issue詳細の確認
gh issue view 123

# Issueにコメント
gh issue comment 123 --body "作業開始します"
```

### 2. ブランチ戦略

```bash
# mainブランチを最新に
git checkout main
git pull origin main

# フィーチャーブランチの作成
git checkout -b feature/dynamic-workflow-update

# バグ修正ブランチ
git checkout -b fix/login-error

# ドキュメント更新ブランチ
git checkout -b docs/update-readme
```

### 3. コミット規約

セマンティックコミットメッセージを使用:

```bash
# 機能追加
git commit -m "feat: 動的ワークフロー更新機能を追加"

# バグ修正
git commit -m "fix: ログイン時のnullエラーを修正"

# ドキュメント
git commit -m "docs: README.mdを更新"

# リファクタリング
git commit -m "refactor: ワークフローエンジンの構造を改善"

# テスト
git commit -m "test: ワークフロー更新のテストを追加"

# その他
git commit -m "chore: 依存関係を更新"
```

### 4. Pull Request作成

```bash
# ブランチをプッシュ
git push -u origin feature/dynamic-workflow-update

# PR作成（ドラフト）
gh pr create --draft --title "feat: 動的ワークフロー更新機能" --body "
## 概要
ワークフロー実行中に動的にステップを追加・変更できる機能を実装

## 変更内容
- ワークフローエンジンの拡張
- UIの更新
- テストの追加

## 関連Issue
Closes #123
"

# PR作成（自動入力）
gh pr create --fill

# ドラフトを解除
gh pr ready
```

### 5. レビューとマージ

```bash
# PRの状態確認
gh pr status
gh pr checks

# セルフレビュー後のマージ
gh pr merge --squash --delete-branch

# mainブランチに戻る
git checkout main
git pull origin main
```

## 効率的なワークフロー

### タスク駆動開発

```bash
# 1. 今日のタスクを確認
gh issue list --assignee @me --state open

# 2. タスクを選択してブランチ作成
ISSUE_NUMBER=123
BRANCH_NAME="feature/$(gh issue view $ISSUE_NUMBER --json title --jq '.title' | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]')"
git checkout -b "$BRANCH_NAME"

# 3. Issueにコメント
gh issue comment $ISSUE_NUMBER --body "🚀 作業開始: \`$BRANCH_NAME\`"

# 4. 作業完了後
gh pr create --fill --body "Closes #$ISSUE_NUMBER"
```

### 進捗の可視化

```bash
# 自分のPR一覧
gh pr list --author @me

# 自分のIssue一覧
gh issue list --assignee @me

# プロジェクトの統計
gh api graphql -f query='
{
  repository(owner:"naok1207", name:"workflow-visualizer") {
    issues(states:OPEN) { totalCount }
    pullRequests(states:OPEN) { totalCount }
  }
}'
```

## ベストプラクティス

1. **小さなPRを心がける**
   - 1 PR = 1機能 or 1修正
   - レビューしやすいサイズに分割

2. **意味のあるコミットメッセージ**
   - 何を変更したかが明確
   - なぜ変更したかも記載

3. **Issueとの連携**
   - PRには必ず関連Issueを記載
   - `Closes #123` でIssueを自動クローズ

4. **ドラフトPRの活用**
   - 早めにPRを作成して進捗を可視化
   - フィードバックを早期に受ける
