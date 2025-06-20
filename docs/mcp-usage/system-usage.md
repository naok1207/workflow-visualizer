# システム使用ガイド（Claude Code向け）

## 概要

このガイドは、Claude Codeが任意のプロジェクトでワークフロー可視化システムを使用する方法を説明します。

## 基本的な使い方

### 1. タスクの作成

プロジェクトで新しい作業を開始する際、適切なタスクタイプを選択してタスクを作成します。

```typescript
// 例1: 新機能の企画
const task = await mcp.create_task({
  title: "ユーザーダッシュボード機能の企画",
  description: "管理者向けダッシュボードの要件定義と設計",
  task_type: "feature-planning"
});
// 自動的に以下のワークフローが設定されます：
// リサーチ → アイデア整理 → 提案書作成 → Issue作成

// 例2: バグ修正
const task = await mcp.create_task({
  title: "ログイン画面でのエラー修正",
  description: "特定条件下でログインが失敗する問題の修正",
  task_type: "issue-resolution"
});
// 自動的に以下のワークフローが設定されます：
// 分析 → 設計 → 実装 → テスト → PR作成 → レビュー

// 例3: カスタムワークフロー
const task = await mcp.create_task({
  title: "パフォーマンス改善調査",
  task_type: "custom",
  initial_workflow: {
    steps: [
      { id: "measure-current", name: "現状測定" },
      { id: "identify-bottlenecks", name: "ボトルネック特定" },
      { id: "research-solutions", name: "解決策調査" },
      { id: "implement-poc", name: "POC実装" },
      { id: "measure-improvement", name: "改善測定" },
      { id: "document", name: "ドキュメント化" }
    ]
  }
});
```

### 2. 進捗の更新

各ステップを完了したら、進捗を更新します。

```typescript
// ステップ完了
await mcp.update_task_progress({
  task_id: task.task_id,
  current_step: "research",
  status: "completed",
  result: {
    summary: "既存のダッシュボードソリューションを5つ調査",
    key_findings: ["...", "..."],
    recommendation: "React + Chart.jsの組み合わせを推奨"
  }
});

// ステップ失敗（自動的に適切なリカバリーフローが提案される）
await mcp.update_task_progress({
  task_id: task.task_id,
  current_step: "testing",
  status: "failed",
  result: {
    error: "統合テストで予期しないエラーが発生",
    details: "..."
  }
});
```

### 3. 動的なワークフロー調整

実行中に必要に応じてワークフローを調整できます。

```typescript
// 新しいステップの追加
await mcp.add_workflow_step({
  task_id: task.task_id,
  after_step: "implementation",
  new_step: {
    id: "security-review",
    name: "セキュリティレビュー",
    type: "review"
  }
});

// ワークフローの分岐
await mcp.fork_workflow({
  task_id: task.task_id,
  reason: "テストで重大な設計上の問題が発見されたため",
  modifications: [
    {
      type: "add_step",
      after: "testing",
      step: { id: "redesign", name: "再設計" }
    },
    {
      type: "add_step",
      after: "redesign",
      step: { id: "reimplementation", name: "再実装" }
    }
  ]
});
```

### 4. タスクの確認

現在のタスク状態を確認します。

```typescript
// 特定タスクの状態確認
const status = await mcp.get_task_status({
  task_id: task.task_id
});
console.log(`現在のステップ: ${status.current_step}`);
console.log(`進捗: ${status.progress_percentage}%`);

// アクティブなタスク一覧
const activeTasks = await mcp.list_active_tasks({
  filter: {
    status: "active"
  }
});
```

## タスクタイプ別ガイド

### feature-planning（新機能企画）

```typescript
// 1. リサーチフェーズ
await mcp.update_task_progress({
  task_id,
  current_step: "research",
  status: "completed",
  result: {
    competitive_analysis: "...",
    user_feedback: "...",
    technical_feasibility: "..."
  }
});

// 2. アイデア整理フェーズ
await mcp.update_task_progress({
  task_id,
  current_step: "ideation",
  status: "completed",
  result: {
    concepts: ["コンセプトA", "コンセプトB"],
    pros_cons: {...},
    selected_approach: "コンセプトA"
  }
});

// 3. 提案書作成フェーズ
await mcp.update_task_progress({
  task_id,
  current_step: "proposal",
  status: "completed",
  result: {
    proposal_document: "path/to/proposal.md",
    estimated_effort: "2 weeks",
    required_resources: [...]
  }
});

// 4. Issue作成フェーズ
await mcp.update_task_progress({
  task_id,
  current_step: "issue",
  status: "completed",
  result: {
    issue_url: "https://github.com/org/repo/issues/123",
    issue_number: 123
  }
});
```

### issue-resolution（Issue解決）

```typescript
// 1. 分析フェーズ
await mcp.update_task_progress({
  task_id,
  current_step: "analysis",
  status: "completed",
  result: {
    root_cause: "入力検証の不備",
    affected_components: ["LoginForm", "AuthService"],
    reproduction_steps: [...]
  }
});

// 2. 設計フェーズ
await mcp.update_task_progress({
  task_id,
  current_step: "design",
  status: "completed",
  result: {
    solution_approach: "入力検証の強化とエラーハンドリングの改善",
    changes_required: [...]
  }
});

// 以降、実装→テスト→PR作成→レビューと続く
```

### documentation（ドキュメント更新）

```typescript
// シンプルなワークフロー
// 調査 → 執筆 → レビュー → 公開

await mcp.update_task_progress({
  task_id,
  current_step: "writing",
  status: "completed",
  result: {
    updated_files: ["README.md", "docs/API.md"],
    word_count: 1500,
    sections_added: ["Installation", "Configuration"]
  }
});
```

## ベストプラクティス

1. **適切なタスクタイプの選択**
   - 作業内容に最も近いタスクタイプを選択
   - 不明な場合は`custom`を使用してカスタマイズ

2. **詳細な結果の記録**
   - 各ステップの結果は詳細に記録
   - 後で参照できるように構造化されたデータで保存

3. **動的な調整**
   - 予期しない状況では躊躇なくワークフローを調整
   - 調整理由を明確に記録

4. **並列実行の活用**
   - 独立したタスクは並列で実行
   - 依存関係を適切に管理

## トラブルシューティング

### ワークフローが進まない場合

```typescript
// 現在の状態を確認
const status = await mcp.get_task_status({ task_id });

// 必要に応じてスキップ
await mcp.update_task_progress({
  task_id,
  current_step: status.current_step,
  status: "skipped",
  result: { reason: "このステップは不要と判断" }
});
```

### エラーからの回復

```typescript
// エラー後の再試行
await mcp.update_task_progress({
  task_id,
  current_step: "testing",
  status: "completed",
  result: {
    retry_count: 2,
    final_status: "success"
  }
});
```

## 高度な使い方

### カスタムワークフローテンプレートの作成

```typescript
// 頻繁に使用するワークフローをテンプレート化
const template = await mcp.create_custom_workflow({
  name: "セキュリティ監査",
  steps: [
    { id: "scan", name: "脆弱性スキャン" },
    { id: "analyze", name: "結果分析" },
    { id: "prioritize", name: "優先順位付け" },
    { id: "fix", name: "修正実装" },
    { id: "verify", name: "修正確認" },
    { id: "report", name: "レポート作成" }
  ],
  transitions: [
    { from: "scan", to: "analyze" },
    { from: "analyze", to: "prioritize" },
    { from: "prioritize", to: "fix" },
    { from: "fix", to: "verify" },
    { from: "verify", to: "report" },
    { from: "verify", to: "fix", condition: "issues_found" }
  ]
});
```

これにより、Claude Codeは効率的にタスクを管理し、進捗を可視化できます。
