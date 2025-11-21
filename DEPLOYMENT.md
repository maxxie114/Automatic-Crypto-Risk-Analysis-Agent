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
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

- `GOOGLE_API_KEY` - Google Gemini API key (required for AI features)
- `PORT` - Server port (default: 8000)
- `HOST` - Server host (default: 0.0.0.0)
- `ENVIRONMENT` - Environment mode (development/production)

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