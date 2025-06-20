# Puppeteer MCPによる自己テストガイド

## 概要

Puppeteer MCPを使用することで、Claude Codeは自身が実装した機能を自動的にテストし、エラーを発見して修正することができます。

## Puppeteer MCPのセットアップ

### 1. MCPサーバーの設定

`~/.config/claude/claude_desktop_config.json` に以下を追加：

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {
        "PUPPETEER_HEADLESS": "false"
      }
    }
  }
}
```

### 2. 接続確認

```typescript
// Claude Codeで実行
/mcp

// Puppeteer MCPが表示されることを確認
// 利用可能なツールを確認
await puppeteer_navigate({ url: "http://localhost:5173" })
```

## 自己テストの実装パターン

### 基本的なテストフロー

```typescript
// 1. アプリケーションを起動
await puppeteer_navigate({ url: "http://localhost:5173" })

// 2. ページの読み込みを待機
await puppeteer_wait({ selector: "#root", timeout: 5000 })

// 3. コンソールエラーの監視を開始
const consoleLogs = await puppeteer_evaluate({
  script: `
    window.consoleErrors = [];
    console.error = (function(originalError) {
      return function(...args) {
        window.consoleErrors.push(args.join(' '));
        originalError.apply(console, args);
      };
    })(console.error);
  `
})

// 4. 基本的な操作テスト
await puppeteer_click({ selector: ".create-task-button" })
await puppeteer_wait({ selector: ".task-form", timeout: 3000 })

// 5. フォーム入力テスト
await puppeteer_fill({ 
  selector: "#task-title", 
  value: "テストタスク" 
})
await puppeteer_select({ 
  selector: "#task-type", 
  value: "feature-planning" 
})

// 6. 送信とレスポンス確認
await puppeteer_click({ selector: ".submit-button" })
await puppeteer_wait({ selector: ".task-created-notification", timeout: 5000 })

// 7. エラーチェック
const errors = await puppeteer_evaluate({
  script: "window.consoleErrors || []"
})

if (errors.length > 0) {
  console.log("発見されたエラー:", errors)
  // エラーの自動修正フローを開始
}
```

### ワークフロー可視化システム特有のテスト

#### React Flowのテスト

```typescript
// ノードの作成テスト
await puppeteer_evaluate({
  script: `
    const event = new MouseEvent('click', {
      clientX: 400,
      clientY: 300,
      bubbles: true
    });
    document.querySelector('.react-flow__pane').dispatchEvent(event);
  `
})

// ノードが