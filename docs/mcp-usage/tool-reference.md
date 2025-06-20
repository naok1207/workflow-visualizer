# MCPツールリファレンス

## 基本ツール

### get_help
システムの使い方を取得します。

```typescript
await get_help({
  topic: "quick-start" | "task-types" | "workflow-management" | "all"
})
```

**パラメータ:**
- `topic`: ヘルプトピック

**戻り値:** ヘルプテキスト

---

### get_system_info
システムの現在の状態と統計情報を取得します。

```typescript
await get_system_info()
```

**戻り値:**
```typescript
{
  version: string,
  active_tasks: number,
  completed_tasks: number,
  available_task_types: string[],
  current_context: object
}
```

---

## タスク管理ツール

### create_task
新しいタスクを作成します。

```typescript
await create_task({
  title: string,
  description?: string,
  task_type: "feature-planning" | "issue-resolution" | "documentation" | 
             "research" | "refactoring" | "custom",
  initial_workflow?: {
    steps: Array<{
      id: string,
      name: string,
      type?: string
    }>
  },
  metadata?: object
})
```

**パラメータ:**
- `title`: タスクのタイトル（必須）
- `description`: タスクの説明
- `task_type`: タスクタイプ（必須）
- `initial_workflow`: カスタムタスクの場合のワークフロー定義
- `metadata`: 追加のメタデータ

**戻り値:**
```typescript
{
  task_id: string,
  title: string,
  task_type: string,
  current_step: string,
  workflow: object
}
```

---

### update_task_progress
タスクの進捗を更新します。

```typescript
await update_task_progress({
  task_id: string,
  current_step: string,
  status: "in_progress" | "completed" | "failed" | "skipped",
  result?: object
})
```

**パラメータ:**
- `task_id`: タスクID（必須）
- `current_step`: 現在のステップID（必須）
- `status`: ステップの状態（必須）
- `result`: ステップの実行結果

**戻り値:**
```typescript
{
  success: boolean,
  next_step?: string,
  progress_percentage: number
}
```

---

### get_task_status
タスクの現在の状態を取得します。

```typescript
await get_task_status({
  task_id: string
})
```

**パラメータ:**
- `task_id`: タスクID（必須）

**戻り値:**
```typescript
{
  task_id: string,
  title: string,
  status: string,
  current_step: string,
  progress_percentage: number,
  workflow: object,
  history: Array<{
    step_id: string,
    status: string,
    started_at: string,
    completed_at?: string,
    result?: object
  }>
}
```

---

### list_active_tasks
アクティブなタスクの一覧を取得します。

```typescript
await list_active_tasks({
  filter?: {
    status?: "active" | "pending",
    task_type?: string
  }
})
```

**パラメータ:**
- `filter`: フィルター条件

**戻り値:**
```typescript
Array<{
  task_id: string,
  title: string,
  task_type: string,
  status: string,
  current_step: string,
  created_at: string,
  updated_at: string
}>
```

---

## ワークフロー管理ツール

### add_workflow_step
ワークフローに新しいステップを追加します。

```typescript
await add_workflow_step({
  task_id: string,
  after_step: string,
  new_step: {
    id: string,
    name: string,
    type?: string,
    config?: object
  }
})
```

**パラメータ:**
- `task_id`: タスクID（必須）
- `after_step`: 新しいステップを挿入する位置（必須）
- `new_step`: 新しいステップの定義（必須）

**戻り値:**
```typescript
{
  success: boolean,
  updated_workflow: object
}
```

---

### fork_workflow
ワークフローを分岐させて新しいバージョンを作成します。

```typescript
await fork_workflow({
  task_id: string,
  reason: string,
  modifications: Array<{
    type: "add_step" | "remove_step" | "modify_step",
    step_id?: string,
    after?: string,
    step?: object
  }>
})
```

**パラメータ:**
- `task_id`: タスクID（必須）
- `reason`: 分岐の理由（必須）
- `modifications`: ワークフローへの変更内容（必須）

**戻り値:**
```typescript
{
  success: boolean,
  new_workflow_version: number,
  updated_workflow: object
}
```

---

### get_examples
実際の使用例を取得します。

```typescript
await get_examples({
  scenario: "new-feature" | "bug-fix" | "documentation" | "custom-workflow"
})
```

**パラメータ:**
- `scenario`: シナリオタイプ（必須）

**戻り値:**
```typescript
{
  description: string,
  steps: Array<{
    command: string,
    params: object,
    expected_result: object,
    explanation: string
  }>
}
```

---

## タスクタイプ別デフォルトワークフロー

### feature-planning
1. `research` - リサーチ
2. `ideation` - アイデア整理
3. `proposal` - 提案書作成
4. `issue` - Issue作成

### issue-resolution
1. `analysis` - 分析
2. `design` - 設計
3. `implementation` - 実装
4. `testing` - テスト
5. `pr` - PR作成
6. `review` - レビュー

### documentation
1. `research` - 調査
2. `writing` - 執筆
3. `review` - レビュー
4. `publish` - 公開

### research
1. `gather` - 情報収集
2. `analyze` - 分析
3. `report` - レポート作成

### refactoring
1. `analysis` - 現状分析
2. `design` - 設計
3. `implementation` - 実装
4. `testing` - テスト
5. `measurement` - 性能測定

### custom
ユーザー定義のワークフロー
