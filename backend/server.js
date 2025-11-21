import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import riskAnalyzerRoutes from './riskAnalyzerEndpoint.js';
import searchRoutes from './searchEndpoint.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

let mcpClient = null;

async function initializeMCPClient() {
  try {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['../mcp_server/mcpServer.js'],
      env: process.env
    });

    mcpClient = new Client({
      name: 'crypto-risk-backend',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    console.log('MCP custom server connected successfully');

    const tools = await mcpClient.listTools();
    console.log('Available MCP tools:', tools.tools.map(t => t.name));

    return mcpClient;
  } catch (error) {
    console.error('Failed to initialize MCP client:', error);
    throw error;
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mcpConnected: mcpClient !== null,
    timestamp: new Date().toISOString()
  });
});

app.use('/api', (req, res, next) => {
  req.mcpClient = mcpClient;
  next();
});

app.use('/api/search', searchRoutes);
app.use('/api/risk-analyzer', riskAnalyzerRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

async function startServer() {
  try {
    await initializeMCPClient();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Search API: http://localhost:${PORT}/api/search`);
      console.log(`Risk Analyzer API: http://localhost:${PORT}/api/risk-analyzer/:tokenId`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

startServer();
