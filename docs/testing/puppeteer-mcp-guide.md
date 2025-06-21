# Puppeteer MCP自動検証ガイド

## 概要

Puppeteer MCPを利用して、Claude Code自身がアプリケーションの動作を検証し、エラーを自動検出・修正する仕組みです。

## 導入手順

### 1. Puppeteer MCPの設定

```bash
# MCP設定ファイルに追加
# ~/.config/claude/mcp_settings.json または該当する設定ファイル

{
  "puppeteer": {
    "enabled": true,
    "headless": false,  # デバッグ時はfalseを推奨
    "viewport": {
      "width": 1280,
      "height": 720
    },
    "defaultTimeout": 30000
  }
}
```

### 2. 検証スクリプトの配置

```bash
# 検証スクリプト用ディレクトリ作成
mkdir -p puppeteer-tests/
mkdir -p puppeteer-tests/scenarios/
mkdir -p puppeteer-tests/fixes/
```

## 自動検証フロー

### 1. 基本的な検証の実行

```typescript
// Claude Codeでの実行例
await puppeteer_launch({
  headless: false,
  viewport: { width: 1280, height: 720 }
});

// フロントエンドにアクセス
await puppeteer_navigate({ url: "http://localhost:5173" });

// コンソールエラーの監視開始
await puppeteer_evaluate({
  javascript: `
    window.__errors = [];
    window.__originalError = console.error;
    console.error = function(...args) {
      window.__errors.push({
        type: 'error',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      window.__originalError.apply(console, args);
    };
  `
});
```

### 2. MCPツールの検証

```typescript
// MCPサーバーとの接続確認
const mcpStatus = await get_system_info();
console.log("MCP Server Status:", mcpStatus);

// タスク作成のテスト
const testTask = await create_task({
  title: "テスト: ユーザー認証機能",
  task_type: "feature-planning"
});

// UIでの表示確認
await puppeteer_wait_for_selector({
  selector: `[data-task-id="${testTask.task_id}"]`,
  timeout: 5000
});
```

### 3. エラー検出と自動修正

```typescript
// エラーログの取得
const errors = await puppeteer_evaluate({
  javascript: "window.__errors || []"
});

if (errors.length > 0) {
  console.log(`検出されたエラー: ${errors.length}件`);
  
  // エラーの分析
  for (const error of errors) {
    console.log(`- ${error.type}: ${error.message}`);
    
    // エラーパターンに基づく自動修正
    if (error.message.includes("Cannot read property")) {
      await analyzeAndFixNullPointerError(error);
    } else if (error.message.includes("Network request failed")) {
      await analyzeAndFixNetworkError(error);
    }
  }
}
```

### 4. 修正とPR作成

```typescript
async function createFixPR(fixes: Fix[]) {
  // 新しいブランチ作成
  const branchName = `fix/auto-detected-errors-${Date.now()}`;
  await exec(`git checkout -b ${branchName}`);
  
  // 修正の適用
  for (const fix of fixes) {
    await filesystem.write_file({
      path: fix.filePath,
      content: fix.newContent
    });
  }
  
  // コミット
  await exec(`git add -A`);
  await exec(`git commit -m "fix: 自動検出されたエラーの修正\n\n${fixes.map(f => `- ${f.description}`).join('\n')}"`);
  
  // PR作成
  await exec(`gh pr create --title "自動検出エラーの修正" --body "Puppeteer MCPによって検出・修正されたエラー"`);
}
```

## 検証シナリオ

### 1. 基本的なワークフロー操作

```typescript
// scenarios/basic-workflow.ts
export async function testBasicWorkflow() {
  // 1. タスク作成
  const task = await create_task({
    title: "テストタスク",
    task_type: "feature-planning"
  });
  
  // 2. UI確認
  await puppeteer_navigate({ url: "http://localhost:5173" });
  await puppeteer_wait_for_selector({ selector: ".workflow-canvas" });
  
  // 3. ノードの存在確認
  const nodes = await puppeteer_evaluate({
    javascript: `
      const nodes = document.querySelectorAll('.react-flow__node');
      return Array.from(nodes).map(n => ({
        id: n.getAttribute('data-id'),
        type: n.getAttribute('data-type')
      }));
    `
  });
  
  // 4. 進捗更新
  await update_task_progress({
    task_id: task.task_id,
    current_step: "research",
    status: "completed"
  });
  
  // 5. UI更新の確認
  await puppeteer_wait_for_selector({
    selector: '[data-step-status="completed"]'
  });
}
```

### 2. エラーハンドリング検証

```typescript
// scenarios/error-handling.ts
export async function testErrorHandling() {
  // 1. 無効なタスクタイプでエラーを誘発
  try {
    await create_task({
      title: "エラーテスト",
      task_type: "invalid-type" as any
    });
  } catch (error) {
    console.log("期待されるエラー:", error);
  }
  
  // 2. UIのエラー表示確認
  await puppeteer_wait_for_selector({
    selector: '.error-notification',
    timeout: 3000
  });
  
  // 3. エラーメッセージの検証
  const errorMessage = await puppeteer_evaluate({
    javascript: `document.querySelector('.error-notification')?.textContent`
  });
  
  if (!errorMessage.includes("無効なタスクタイプ")) {
    // エラーメッセージの修正が必要
    await fixErrorMessage();
  }
}
```

## 自動修正パターン

### 1. Null/Undefined参照エラー

```typescript
// fixes/null-pointer-fix.ts
export async function fixNullPointerError(error: ErrorInfo) {
  const match = error.message.match(/Cannot read property '(\w+)' of (null|undefined)/);
  if (!match) return;
  
  const property = match[1];
  const filePath = extractFilePathFromError(error);
  
  // ファイルの読み込み
  const content = await filesystem.read_file({ path: filePath });
  
  // オプショナルチェイニングの追加
  const fixed = content.replace(
    new RegExp(`\\.${property}(?![?])`, 'g'),
    `?.${property}`
  );
  
  return {
    filePath,
    newContent: fixed,
    description: `Null参照エラーの修正: ${property}にオプショナルチェイニングを追加`
  };
}
```

### 2. ネットワークエラー

```typescript
// fixes/network-error-fix.ts
export async function fixNetworkError(error: ErrorInfo) {
  if (!error.message.includes("Failed to fetch")) return;
  
  // エラーハンドリングの追加
  const fixes = [];
  
  // API呼び出し箇所の特定と修正
  const apiFiles = await filesystem.search_files({
    path: "./frontend/src",
    pattern: "*.ts",
    excludePatterns: ["*.test.ts"]
  });
  
  for (const file of apiFiles) {
    const content = await filesystem.read_file({ path: file });
    if (content.includes("fetch(") && !content.includes("try {")) {
      const fixed = addTryCatchToFetch(content);
      fixes.push({
        filePath: file,
        newContent: fixed,
        description: `${file}: fetch呼び出しにエラーハンドリングを追加`
      });
    }
  }
  
  return fixes;
}
```

## 実行スケジュール

### 開発中の継続的検証

```typescript
// 定期的な検証の実行
async function runContinuousValidation() {
  while (true) {
    console.log("=== 自動検証開始 ===");
    
    // 1. 基本的な動作確認
    await testBasicWorkflow();
    
    // 2. エラーハンドリング確認
    await testErrorHandling();
    
    // 3. パフォーマンス測定
    await measurePerformance();
    
    // 4. 検出されたエラーの修正
    const fixes = await collectAndAnalyzeErrors();
    if (fixes.length > 0) {
      await createFixPR(fixes);
    }
    
    console.log("=== 自動検証完了 ===");
    
    // 10分待機
    await new Promise(resolve => setTimeout(resolve, 600000));
  }
}
```

## トラブルシューティング

### Puppeteerが起動しない

```bash
# 必要な依存関係の確認
ldd $(which chromium) | grep "not found"

# 権限の確認
ls -la ~/.config/claude/
```

### セレクタが見つからない

```typescript
// デバッグモードで実行
await puppeteer_screenshot({ path: "debug-screenshot.png" });

// ページのHTMLを確認
const html = await puppeteer_evaluate({
  javascript: "document.documentElement.outerHTML"
});
console.log(html);
```

### タイムアウトエラー

```typescript
// タイムアウト時間の調整
await puppeteer_wait_for_selector({
  selector: ".slow-loading-element",
  timeout: 60000  // 60秒に延長
});
```

## ベストプラクティス

1. **段階的な検証**
   - まず手動で動作確認
   - 次に自動検証スクリプトを作成
   - 最後に自動修正ロジックを実装

2. **エラーの分類**
   - 致命的エラー: 即座に修正PR作成
   - 警告レベル: Issue作成して後で対応
   - 情報レベル: ログに記録のみ

3. **修正の安全性**
   - 自動修正は保守的に実装
   - 大きな変更は人間のレビューを必須に
   - テストが通ることを確認してからPR作成

4. **継続的改善**
   - 検証シナリオを定期的に更新
   - 新しいエラーパターンを学習
   - 修正の成功率を測定
