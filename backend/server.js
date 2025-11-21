import ngrok from '@ngrok/ngrok';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import riskAnalyzerRoutes from './riskAnalyzerEndpoint.js';
import searchRoutes from './searchEndpoint.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MCP_SERVER_URL = 'http://167.99.111.80:3001/mcp';

app.use(cors());
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

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    // Parse SSE stream
    const text = await response.text();
    const lines = text.split('\n');
    let result = null;

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        
        if (data.error) {
          throw new Error(data.error.message || 'MCP request failed');
        }
        
        // Look for the response with matching ID
        if (data.id === this.requestId) {
          result = data.result;
        }
      }
    }

    if (result === null) {
      throw new Error('No valid response received from MCP server');
    }

    return result;
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

let cloudflaredProcess = null;

async function startServer() {
  try {
    await initializeMCPClient();

    app.listen(PORT, async () => {
      console.log(`Server running on http://localhost:${PORT}`);
      
      // Start ngrok tunnel for fixed URL
      try {
        const ngrokAuthToken = process.env.NGROK_AUTH_TOKEN;
        
        const listener = await ngrok.forward({
          addr: PORT,
          authtoken: ngrokAuthToken,
        });
        
        const url = listener.url();
        
        console.log('\n🌐 Public URL (ngrok - fixed URL):');
        console.log(`   ${url}`);
        console.log(`\n📍 Endpoints:`);
        console.log(`   Health check: ${url}/health`);
        console.log(`   Search API: ${url}/api/search`);
        console.log(`   Risk Analyzer API: ${url}/api/risk-analyzer/:tokenId`);
        
        if (!ngrokAuthToken || ngrokAuthToken === 'your_token_here') {
          console.log('\n💡 Tip: Add NGROK_AUTH_TOKEN to .env for a permanent fixed URL');
          console.log('   Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken\n');
        } else {
          console.log('\n✅ Using authenticated ngrok - this URL will persist!\n');
        }
        
      } catch (ngrokError) {
        console.error('Failed to start ngrok tunnel:', ngrokError.message);
        console.log('Server still accessible locally at http://localhost:' + PORT);
      }
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
  if (cloudflaredProcess) {
    cloudflaredProcess.kill();
  }
  try {
    await ngrok.disconnect();
  } catch (e) {
    // Ignore disconnect errors
  }
  process.exit(0);
});

startServer();
