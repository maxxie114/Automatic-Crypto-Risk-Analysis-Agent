import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import riskAnalyzerRoutes from './riskAnalyzerEndpoint.js';
import searchRoutes from './searchEndpoint.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MCP_SERVER_URL = 'http://167.99.111.80:3001/mcp';

// Configure CORS to allow frontend origins
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://localhost:3000',
    /\.ngrok-free\.dev$/,  // Allow any ngrok domains
    /\.vercel\.app$/,      // Allow Vercel deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());

let mcpClient = null;

// HTTP-based MCP client wrapper for StreamableHTTPServerTransport
class HttpMcpClient {
  constructor(url) {
    this.url = url;
    this.requestId = 0;
  }

  async sendRequest(method, params = {}) {
    this.requestId++;
    
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId,
      method,
      params
    };

    console.log(`MCP Request [${this.requestId}]: ${method}`, JSON.stringify(params).substring(0, 100));

    // Add 30 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        console.error(`MCP HTTP Error [${this.requestId}]:`, response.status, text);
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }

      // Parse SSE stream
      const text = await response.text();
      const lines = text.split('\n');
      let result = null;

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            if (data.error) {
              console.error(`MCP Error [${this.requestId}]:`, data.error);
              throw new Error(data.error.message || 'MCP request failed');
            }
            
            // Look for the response with matching ID
            if (data.id === this.requestId) {
              result = data.result;
            }
          } catch (parseError) {
            console.warn(`Failed to parse SSE line: ${line}`);
          }
        }
      }

      if (result === null) {
        console.error(`MCP No Response [${this.requestId}]: Full response:`, text.substring(0, 500));
        throw new Error('No valid response received from MCP server. The server may be down or unresponsive.');
      }

      console.log(`MCP Success [${this.requestId}]`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(`MCP Timeout [${this.requestId}]: Request took longer than 30 seconds`);
        throw new Error('MCP server request timed out after 30 seconds');
      }
      throw error;
    }
  }

  async callTool({ name, arguments: args }) {
    return await this.sendRequest('tools/call', {
      name,
      arguments: args
    });
  }

  async listTools() {
    return await this.sendRequest('tools/list', {});
  }

  async close() {
    // No-op for HTTP client
  }
}

async function initializeMCPClient() {
  try {
    mcpClient = new HttpMcpClient(MCP_SERVER_URL);
    
    console.log(`Connecting to MCP HTTP server at ${MCP_SERVER_URL}`);
    
    // Initialize the connection
    await mcpClient.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'crypto-risk-backend',
        version: '1.0.0'
      }
    });
    
    console.log('MCP connection initialized');
    
    const tools = await mcpClient.listTools();
    console.log('Available MCP tools:', tools.tools.map(t => t.name));
    console.log('MCP HTTP server connected successfully');

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
