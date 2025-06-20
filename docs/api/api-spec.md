# API仕様書

## 概要

ワークフロー可視化システムのREST APIおよびWebSocket API仕様書です。

- **ベースURL**: `http://localhost:3001/api`
- **WebSocket URL**: `ws://localhost:3001`
- **認証**: JWT Bearer Token（将来実装）
- **レート制限**: 100リクエスト/分（将来実装）

## 共通仕様

### リクエストヘッダー

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token> (将来実装)
```

### レスポンス形式

#### 成功レスポンス

```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力データが無効です",
    "details": {
      // エラーの詳細情報
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### エラーコード

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| `VALIDATION_ERROR` | 400 | 入力検証エラー |
| `UNAUTHORIZED` | 401 | 認証エラー |
| `FORBIDDEN` | 403 | 権限エラー |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `CONFLICT` | 409 | リソースの競合 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

## REST API エンドポイント

### ワークフロー管理

#### ワークフロー作成

```http
POST /api/workflows
```

**リクエストボディ**:
```json
{
  "name": "サンプルワークフロー",
  "description": "ワークフローの説明",
  "definition": {
    "nodes": [
      {
        "id": "node-1",
        "type": "start",
        "position": { "x": 100, "y": 100 },
        "data": { "label": "開始" }
      },
      {
        "id": "node-2",
        "type": "task",
        "position": { "x": 300, "y": 100 },
        "data": {
          "label": "タスク実行",
          "taskType": "http_request",
          "config": {
            "url": "https://api.example.com/data",
            "method": "GET"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2"
      }
    ]
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "wf_abc123",
    "name": "サンプルワークフロー",
    "description": "ワークフローの説明",
    "definition": { /* ... */ },
    "version": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### ワークフロー一覧取得

```http
GET /api/workflows?page=1&limit=20&search=test&sort=createdAt:desc
```

**クエリパラメータ**:
- `page` (number): ページ番号（デフォルト: 1）
- `limit` (number): 1ページあたりの件数（デフォルト: 20、最大: 100）
- `search` (string): 検索キーワード
- `sort` (string): ソート条件（`field:asc` or `field:desc`）
- `status` (string): フィルター条件（active, archived）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "wf_abc123",
        "name": "サンプルワークフロー",
        "description": "ワークフローの説明",
        "nodeCount": 5,
        "lastExecutedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### ワークフロー詳細取得

```http
GET /api/workflows/:id
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "wf_abc123",
    "name": "サンプルワークフロー",
    "description": "ワークフローの説明",
    "definition": {
      "nodes": [ /* ... */ ],
      "edges": [ /* ... */ ]
    },
    "version": 1,
    "executionCount": 42,
    "lastExecutedAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### ワークフロー更新

```http
PUT /api/workflows/:id
```

**リクエストボディ**:
```json
{
  "name": "更新されたワークフロー",
  "description": "更新された説明",
  "definition": {
    "nodes": [ /* ... */ ],
    "edges": [ /* ... */ ]
  }
}
```

**レスポンス**: ワークフロー詳細と同じ

#### ワークフロー削除

```http
DELETE /api/workflows/:id
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": "ワークフローが削除されました"
  }
}
```

### ワークフロー実行

#### 実行開始

```http
POST /api/workflows/:id/execute
```

**リクエストボディ**:
```json
{
  "parameters": {
    "inputData": "サンプルデータ",
    "timeout": 3600
  },
  "mode": "normal", // normal | debug | dry-run
  "webhookUrl": "https://example.com/webhook"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "executionId": "exec_xyz789",
    "workflowId": "wf_abc123",
    "status": "running",
    "mode": "normal",
    "startedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 実行状態取得

```http
GET /api/executions/:id
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "exec_xyz789",
    "workflowId": "wf_abc123",
    "status": "running", // pending | running | paused | completed | failed | cancelled
    "progress": {
      "total": 10,
      "completed": 3,
      "percentage": 30
    },
    "currentNode": {
      "id": "node-2",
      "name": "タスク実行",
      "status": "running"
    },
    "parameters": { /* ... */ },
    "result": null,
    "error": null,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "completedAt": null,
    "duration": 120000 // ミリ秒
  }
}
```

#### 実行履歴取得

```http
GET /api/executions?workflowId=wf_abc123&status=completed&page=1&limit=20
```

**クエリパラメータ**:
- `workflowId` (string): ワークフローID
- `status` (string): ステータスフィルター
- `startDate` (string): 開始日（ISO 8601形式）
- `endDate` (string): 終了日（ISO 8601形式）
- `page`, `limit`, `sort`: ページネーション

**レスポンス**: 実行一覧（ページネーション付き）

#### 実行制御

##### 一時停止

```http
POST /api/executions/:id/pause
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": "実行が一時停止されました",
    "executionId": "exec_xyz789",
    "status": "paused"
  }
}
```

##### 再開

```http
POST /api/executions/:id/resume
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": "実行が再開されました",
    "executionId": "exec_xyz789",
    "status": "running"
  }
}
```

##### 停止

```http
POST /api/executions/:id/stop
```

**リクエストボディ**:
```json
{
  "force": false,
  "reason": "ユーザーによる手動停止"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": "実行が停止されました",
    "executionId": "exec_xyz789",
    "status": "cancelled"
  }
}
```

#### 実行ログ取得

```http
GET /api/executions/:id/logs?level=info&limit=100
```

**クエリパラメータ**:
- `level` (string): ログレベル（debug | info | warn | error）
- `nodeId` (string): 特定ノードのログのみ
- `limit` (number): 取得件数
- `offset` (number): オフセット

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "level": "info",
        "nodeId": "node-2",
        "message": "HTTPリクエストを送信しています",
        "metadata": {
          "url": "https://api.example.com/data",
          "method": "GET"
        }
      }
    ],
    "hasMore": true,
    "total": 500
  }
}
```

## WebSocket API

### 接続

```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token' // 将来実装
  }
});
```

### イベント

#### クライアント → サーバー

##### 実行のサブスクライブ

```javascript
socket.emit('subscribe_execution', {
  executionId: 'exec_xyz789'
});
```

##### 実行のアンサブスクライブ

```javascript
socket.emit('unsubscribe_execution', {
  executionId: 'exec_xyz789'
});
```

##### ワークフローのサブスクライブ

```javascript
socket.emit('subscribe_workflow', {
  workflowId: 'wf_abc123'
});
```

#### サーバー → クライアント

##### 実行開始通知

```javascript
socket.on('execution_started', (data) => {
  console.log(data);
  // {
  //   executionId: 'exec_xyz789',
  //   workflowId: 'wf_abc123',
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // }
});
```

##### 実行進捗更新

```javascript
socket.on('execution_progress', (data) => {
  console.log(data);
  // {
  //   executionId: 'exec_xyz789',
  //   progress: {
  //     total: 10,
  //     completed: 5,
  //     percentage: 50
  //   },
  //   currentNode: {
  //     id: 'node-3',
  //     name: 'データ処理',
  //     status: 'running'
  //   }
  // }
});
```

##### ノード状態更新

```javascript
socket.on('node_status_changed', (data) => {
  console.log(data);
  // {
  //   executionId: 'exec_xyz789',
  //   nodeId: 'node-2',
  //   status: 'completed',
  //   result: { /* ... */ },
  //   duration: 5000
  // }
});
```

##### 実行完了通知

```javascript
socket.on('execution_completed', (data) => {
  console.log(data);
  // {
  //   executionId: 'exec_xyz789',
  //   status: 'completed',
  //   result: { /* ... */ },
  //   duration: 120000
  // }
});
```

##### エラー通知

```javascript
socket.on('execution_error', (data) => {
  console.log(data);
  // {
  //   executionId: 'exec_xyz789',
  //   nodeId: 'node-4',
  //   error: {
  //     code: 'TASK_FAILED',
  //     message: 'タスクの実行に失敗しました',
  //     details: { /* ... */ }
  //   }
  // }
});
```

### 接続管理

```javascript
// 接続イベント
socket.on('connect', () => {
  console.log('WebSocket接続確立');
});

// 切断イベント
socket.on('disconnect', (reason) => {
  console.log('WebSocket切断:', reason);
});

// 再接続イベント
socket.on('reconnect', (attemptNumber) => {
  console.log('WebSocket再接続成功:', attemptNumber);
});

// エラーイベント
socket.on('error', (error) => {
  console.error('WebSocketエラー:', error);
});
```

## MCP ツール仕様

### ワークフロー管理ツール

#### create_workflow

```typescript
{
  name: "create_workflow",
  description: "新しいワークフローを作成",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "ワークフロー名"
      },
      description: {
        type: "string",
        description: "ワークフローの説明"
      },
      definition: {
        type: "object",
        properties: {
          nodes: { type: "array" },
          edges: { type: "array" }
        }
      }
    },
    required: ["name", "definition"]
  }
}
```

#### execute_workflow

```typescript
{
  name: "execute_workflow",
  description: "ワークフローを実行",
  inputSchema: {
    type: "object",
    properties: {
      workflow_id: {
        type: "string",
        description: "実行するワークフローのID"
      },
      parameters: {
        type: "object",
        description: "実行パラメータ"
      },
      mode: {
        type: "string",
        enum: ["normal", "debug", "dry-run"],
        description: "実行モード"
      }
    },
    required: ["workflow_id"]
  }
}
```

#### get_workflow_status

```typescript
{
  name: "get_workflow_status",
  description: "ワークフロー実行状態を取得",
  inputSchema: {
    type: "object",
    properties: {
      execution_id: {
        type: "string",
        description: "実行ID"
      }
    },
    required: ["execution_id"]
  }
}
```

## サンプルコード

### cURL

```bash
# ワークフロー作成
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "サンプルワークフロー",
    "definition": {
      "nodes": [],
      "edges": []
    }
  }'

# ワークフロー実行
curl -X POST http://localhost:3001/api/workflows/wf_abc123/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "inputData": "test"
    }
  }'
```

### JavaScript/TypeScript

```typescript
// APIクライアント
class WorkflowAPI {
  private baseURL = 'http://localhost:3001/api';

  async createWorkflow(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await fetch(`${this.baseURL}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async executeWorkflow(
    workflowId: string,
    params: ExecuteWorkflowDto
  ): Promise<Execution> {
    const response = await fetch(
      `${this.baseURL}/workflows/${workflowId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}

// WebSocketクライアント
class WorkflowWebSocket {
  private socket: Socket;

  constructor() {
    this.socket = io('ws://localhost:3001');
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('execution_progress', (data) => {
      console.log('Progress update:', data);
    });
  }

  subscribeToExecution(executionId: string) {
    this.socket.emit('subscribe_execution', { executionId });
  }

  unsubscribeFromExecution(executionId: string) {
    this.socket.emit('unsubscribe_execution', { executionId });
  }
}
```
