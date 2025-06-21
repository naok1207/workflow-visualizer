#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { helpTool, systemInfoTool } from './tools/help.js';
import { 
  createTaskTool, 
  updateTaskProgressTool, 
  getTaskStatusTool, 
  listActiveTasksTool 
} from './tools/task-tools.js';
import {
  addWorkflowStepTool,
  modifyWorkflowTool,
  forkWorkflowTool,
  getWorkflowHistoryTool
} from './tools/workflow-tools.js';
import { setupDatabase } from './database/init.js';
import { initWebSocketClient } from './services/websocket-client.js';

const server = new Server(
  {
    name: 'workflow-visualizer-mcp',
    version: '1.0.0',
    capabilities: {
      tools: {},
    },
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツールの登録
const tools = [
  helpTool,
  systemInfoTool,
  createTaskTool,
  updateTaskProgressTool,
  getTaskStatusTool,
  listActiveTasksTool,
  addWorkflowStepTool,
  modifyWorkflowTool,
  forkWorkflowTool,
  getWorkflowHistoryTool,
];

// 各ツールを登録
tools.forEach(tool => {
  server.setRequestHandler(tool.handler);
});

// ツール一覧を提供
server.setRequestHandler({
  method: 'tools/list',
  handler: async () => ({
    tools: tools.map(t => t.definition),
  }),
});

async function main() {
  try {
    console.error('Initializing database...');
    await setupDatabase();
    console.error('Database initialized successfully');

    console.error('Initializing WebSocket client...');
    initWebSocketClient();
    console.error('WebSocket client initialized');

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch(console.error);