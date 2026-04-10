#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fetch from 'node-fetch';

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_API = 'https://api.figma.com/v1';

const server = new Server({
  name: 'figma-mcp-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_figma_file',
      description: 'Get Figma file data',
      inputSchema: {
        type: 'object',
        properties: {
          fileKey: { type: 'string', description: 'Figma file key' }
        },
        required: ['fileKey']
      }
    },
    {
      name: 'get_figma_images',
      description: 'Export images from Figma',
      inputSchema: {
        type: 'object',
        properties: {
          fileKey: { type: 'string', description: 'Figma file key' },
          ids: { type: 'string', description: 'Node IDs comma-separated' }
        },
        required: ['fileKey', 'ids']
      }
    }
  ]
}));

import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_ACCESS_TOKEN not set');
  }

  if (name === 'get_figma_file') {
    const response = await fetch(`${FIGMA_API}/files/${args.fileKey}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
      agent
    });
    const data = await response.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }

  if (name === 'get_figma_images') {
    const response = await fetch(`${FIGMA_API}/images/${args.fileKey}?ids=${args.ids}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
      agent
    });
    const data = await response.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
