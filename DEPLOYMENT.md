# Meme Coin Research API - Deployment Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Gemini API key
   ```

3. **Start the API**
   ```bash
   python deploy.py
   # Or directly with uvicorn:
   uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Core Research Endpoints

- `POST /research/coin` - Comprehensive coin research with optional AI blog
- `POST /research/market-data` - Get market data only
- `POST /research/social-metrics` - Get social media metrics
- `POST /research/whale-activity` - Get whale activity data
- `POST /research/news` - Get recent news

### AI Content Generation Endpoints

- `POST /ai/generate-blog` - Generate AI blog post
- `POST /ai/generate-twitter-thread` - Generate Twitter thread
- `POST /ai/generate-newsletter` - Generate newsletter summary

### Utility Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /coins/list` - List supported coins
- `GET /blog/styles` - Available blog styles

## Deployment Options

### Local Development
```bash
python deploy.py
```

### Production with Gunicorn
```bash
pip install gunicorn
pip install uvloop

gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment
```bash
# Build and run locally
docker build -t meme-coin-api .
docker run -d --name meme_coin_api -p 8000:8000 --env-file .env meme-coin-api
```

#### Compose
```yaml
version: "3.8"
services:
  api:
    build: .
    ports:
      - "${PORT:-8000}:8000"
    env_file:
      - .env
    environment:
      - HOST=0.0.0.0
      - PORT=${PORT:-8000}
      - ENVIRONMENT=${ENVIRONMENT:-production}
      - LOG_LEVEL=${LOG_LEVEL:-INFO}
    command: sh -c "uvicorn api:app --host ${HOST} --port ${PORT} --workers ${WORKERS:-2}"
    restart: unless-stopped
```

### DigitalOcean Droplet
```bash
# 1) On the droplet
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 2) Clone repository
git clone https://github.com/maxxie114/Automatic-Crypto-Risk-Analysis-Agent.git
cd Automatic-Crypto-Risk-Analysis-Agent
git checkout feature/api-docs-cleanup

# 3) Configure environment
cp .env.example .env
nano .env
# Set GOOGLE_API_KEY and any other variables

# 4) Start service with Compose
sudo docker compose up -d --build

# 5) Verify
curl http://localhost:8000/health
```

#### Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
sudo ufw status
```

#### Domain and HTTPS (Optional)
Use Nginx as a reverse proxy on port 80/443 and point to `http://localhost:8000`.

### Environment Variables

- `GOOGLE_API_KEY` - Google Gemini API key (required for AI features)
- `PORT` - Server port (default: 8000)
- `HOST` - Server host (default: 0.0.0.0)
- `ENVIRONMENT` - Environment mode (development/production)
- `LOG_LEVEL` - Logging level (default: INFO)
- `WORKERS` - Uvicorn workers (default: 2)

## API Usage Examples

### Basic Coin Research
```bash
curl -X POST "http://localhost:8000/research/coin" \
  -H "Content-Type: application/json" \
  -d '{"coin_name": "PEPE", "include_ai_blog": true, "blog_style": "analytical"}'
```

### Generate AI Blog from Research Data
```bash
curl -X POST "http://localhost:8000/ai/generate-blog" \
  -H "Content-Type: application/json" \
  -d '{
    "research_data": {"coin_name": "DOGE", "market_data": {...}},
    "style": "technical",
    "content_type": "blog"
  }'
```

### Get Market Data Only
```bash
curl -X POST "http://localhost:8000/research/market-data?coin_name=SHIB"
```

## Response Format

All endpoints return JSON responses with consistent structure:

```json
{
  "coin_name": "PEPE",
  "timestamp": "2024-01-21T12:00:00Z",
  "data": { ... }
}
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

Error responses include detailed messages:
```json
{
  "detail": "Coin name cannot be empty"
}
```

## Rate Limiting

For production deployment, consider adding rate limiting:
```bash
pip install slowapi
```

## Monitoring

Health check endpoint: `GET /health`

Monitor these metrics:
- API response times
- Error rates
- Gemini API usage
- External API call success rates

## Security Considerations

1. **API Key Management**: Store `GOOGLE_API_KEY` securely
2. **Rate Limiting**: Implement to prevent abuse
3. **Input Validation**: All inputs are validated and sanitized
4. **Error Messages**: Detailed but don't expose sensitive information

## Scaling

For high-traffic deployment:
1. Use a reverse proxy (Nginx)
2. Implement caching (Redis)
3. Use connection pooling
4. Monitor resource usage
5. Consider load balancing