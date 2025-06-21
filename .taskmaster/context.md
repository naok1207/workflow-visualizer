# プロジェクトコンテキスト

## プロジェクト概要
**名称**: ワークフロー可視化システム  
**目的**: Claude Codeが任意のプロジェクトで作業する際の進捗を動的に管理・可視化する  
**開発者**: 個人（Claude Code支援）  
**開始日**: 2024-06-18  

## 技術スタック
- **Frontend**: React, TypeScript, React Flow, Zustand
- **Backend**: Node.js, MCP Server
- **Database**: SQLite (Better-SQLite3)
- **Real-time**: WebSocket (Socket.io)
- **Build**: Vite
- **Test**: Vitest, Playwright
- **Infrastructure**: Docker, Docker Compose

## 環境構築方針
- **ローカル環境**: Node.js系ツール、フロントエンド開発サーバー
- **Docker環境**: MCPサーバー、SQLite、WebSocketサーバー

## 主要機能
1. **動的ワークフロー管理**
   - タスクタイプ別のデフォルトワークフロー
   - 実行中のワークフロー変更
   - ステップの追加・削除・変更

2. **可視化機能**
   - React Flowによるノードベース表示
   - リアルタイム進捗更新
   - ワークフロー履歴表示

3. **MCP統合**
   - Claude Code向けツール提供
   - ヘルプシステム内蔵
   - 自動進捗記録

## 現在の状態
- フェーズ: 計画完了・実装準備中
- 次のタスク: 初期セットアップ（P-0）
- ブロッカー: なし

## 重要な決定事項
1. React Flowを採用（豊富な機能とドキュメント）
2. Zustandで状態管理（シンプルで学習コストが低い）
3. MCPヘルプツールを最優先実装（使いやすさ重視）
4. 個人開発のため過度な自動化は避ける

## 開発ルール
- セマンティックコミットメッセージ
- 機能単位でのブランチ作成
- ドキュメント同時更新
- テスト駆動開発（可能な限り）

## よく使うコマンド
```bash
# 開発開始
docker-compose up -d      # Dockerコンテナ起動
npm run dev:frontend      # フロントエンド開発サーバー

# Docker管理
docker-compose logs -f    # ログ確認
docker-compose restart    # 再起動
docker-compose down       # 停止

# 新しいIssue
gh issue create --title "タイトル"

# PR作成
gh pr create --fill --draft

# タスク確認
gh issue list --assignee @me
```

## 参考リンク
- [React Flow](https://reactflow.dev)
- [MCP仕様](https://modelcontextprotocol.io)
- プロジェクトリポジトリ: https://github.com/naok1207/workflow-visualizer
