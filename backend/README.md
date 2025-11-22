# Crypto Risk Analysis Backend

Backend API server that integrates with MCP Postman tools to analyze cryptocurrency risks.

## Files Structure

- **[server.js](backend/server.js)** - Main Express server with MCP client initialization
- **[searchEndpoint.js](backend/searchEndpoint.js)** - Search endpoint for finding crypto collections
- **[riskAnalyzerEndpoint.js](backend/riskAnalyzerEndpoint.js)** - Risk analysis endpoint for evaluating crypto assets

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and MCP connection status.

### Search Endpoint

#### Search Collections
```
POST /api/search
Content-Type: application/json

{
  "query": "bitcoin",
  "searchType": "all"
}
```

#### Get Specific Collection
```
GET /api/search/:collectionId
```

### Risk Analyzer Endpoint

#### Analyze Crypto Risk
```
POST /api/risk-analyzer/analyze
Content-Type: application/json

{
  "cryptoSymbol": "BTC",
  "collectionId": "optional-collection-id",
  "requestName": "optional-request-name"
}
```

Returns risk analysis with:
- Risk level (LOW, MEDIUM, HIGH)
- Risk score (0-100)
- Risk factors identified
- Recommendations

#### Get Token Risk Data
```
GET /api/risk-analyzer/:tokenId
```

Fetches and analyzes risk data for a specific token by its ID.

## MCP Integration

The server automatically connects to the MCP Postman server on startup. Available MCP tools:
- `search_collections` - Search Postman collections
- `get_collection` - Get specific collection details
- `send_request` - Execute Postman API requests

## Example Usage

### Search for Crypto Data
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "ethereum", "searchType": "all"}'
```

### Analyze Crypto Risk
```bash
curl -X POST http://localhost:3001/api/risk-analyzer/analyze \
  -H "Content-Type: application/json" \
  -d '{"cryptoSymbol": "ETH"}'
```

### Get Token Risk by ID
```bash
curl http://localhost:3001/api/risk-analyzer/BTC
```

## Requirements

- Node.js >= 18.0.0
- NPM or Yarn
- MCP Postman server accessible via npx
