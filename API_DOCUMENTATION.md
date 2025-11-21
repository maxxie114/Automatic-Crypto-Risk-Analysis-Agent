# 📚 Meme Coin Research API - Complete Documentation

## 🎯 Overview

This document provides comprehensive documentation for all API endpoints, request/response formats, and usage examples for the Meme Coin Research API.

## 🔗 Base URL

```
http://localhost:8000
```

## 📋 Authentication

Currently, the API does not require authentication. Rate limiting may be implemented in future versions.

## 🏗️ API Architecture

### Request/Response Format
- **Content-Type**: `application/json`
- **Character Encoding**: UTF-8
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

### Error Response Format
```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-11-21T12:00:00Z",
  "path": "/endpoint/path"
}
```

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request - Invalid parameters
- **404**: Not Found - Coin not found or no data available
- **422**: Validation Error - Pydantic validation failure
- **500**: Internal Server Error - Server-side error
- **503**: Service Unavailable - External API unavailable

## 🔍 Research Endpoints

### GET /research/coin/{coin_name}

**Description**: Comprehensive research for a specific coin including all data sources.

**Path Parameters**:
- `coin_name` (string, required): Name or symbol of the coin (e.g., "PEPE", "DOGE", "SHIB")

**Query Parameters**:
- `include_ai` (boolean, optional): Include AI-generated content if available (default: false)
- `style` (string, optional): AI content style - "analytical", "technical", "beginner", "news" (default: "analytical")

**Response**: Complete analysis with all data sources

**Example Request**:
```bash
curl -X GET "http://localhost:8000/research/coin/PEPE?include_ai=true&style=analytical"
```

**Example Response**:
```json
{
  "coin_name": "PEPE",
  "timestamp": "2025-11-21T14:27:32.161286",
  "summary": "💰 Price: $0.000004120 (-10.51% 24h) | Volume: $2234958.5",
  "dex_screener": {
    "best_pair": {
      "chain": "ethereum",
      "dex": "uniswap",
      "pair_address": "0x...",
      "price_usd": "0.000004120",
      "price_change_24h": "-10.51",
      "volume_24h": "2234958.5",
      "liquidity_usd": "30101717.71",
      "token_symbol": "PEPE",
      "token_name": "Pepe"
    }
  },
  "coingecko": {
    "id": "pepe",
    "symbol": "pepe",
    "name": "Pepe",
    "market_cap_rank": 66,
    "thumb": "https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg",
    "large": "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg"
  },
  "news": [
    {
      "title": "PEPE Coin Sees Major Price Movement",
      "link": "https://example.com/article1",
      "snippet": "PEPE has experienced significant volatility...",
      "date": "2025-11-20"
    }
  ],
  "ai_blog_post": {
    "title": "PEPE Analysis: A Deep Dive into the Meme Coin Phenomenon",
    "content": "# PEPE Analysis: A Deep Dive into the Meme Coin Phenomenon\n\n## Executive Summary\n...",
    "style": "analytical",
    "word_count": 1400,
    "sections": ["Executive Summary", "Market Analysis", "Technical Indicators", "Community Sentiment", "Risk Assessment", "Future Outlook"]
  }
}
```

### GET /research/market-data/{coin_name}

**Description**: Market data only from DEX Screener and CoinGecko APIs.

**Path Parameters**:
- `coin_name` (string, required): Name or symbol of the coin

**Response**: Market data summary

**Example Request**:
```bash
curl -X GET "http://localhost:8000/research/market-data/DOGE"
```

**Example Response**:
```json
{
  "coin_name": "DOGE",
  "timestamp": "2025-11-21T14:30:00Z",
  "dex_screener": {
    "best_pair": {
      "chain": "ethereum",
      "dex": "uniswap",
      "price_usd": "0.42",
      "price_change_24h": "+5.23",
      "volume_24h": "1250000.0",
      "liquidity_usd": "8500000.0"
    }
  },
  "coingecko": {
    "id": "dogecoin",
    "symbol": "doge",
    "name": "Dogecoin",
    "market_cap_rank": 8,
    "thumb": "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png"
  }
}
```

### GET /research/social-metrics/{coin_name}

**Description**: Social and community metrics (placeholder for future social media integration).

**Path Parameters**:
- `coin_name` (string, required): Name or symbol of the coin

**Response**: Social metrics data

**Example Request**:
```bash
curl -X GET "http://localhost:8000/research/social-metrics/SHIB"
```

**Example Response**:
```json
{
  "coin_name": "SHIB",
  "timestamp": "2025-11-21T14:35:00Z",
  "social_metrics": {
    "twitter_mentions": 1250,
    "reddit_posts": 45,
    "telegram_members": 85000,
    "discord_members": 25000,
    "sentiment_score": 0.72,
    "engagement_rate": 0.045
  },
  "note": "Social metrics are simulated for demonstration purposes"
}
```

### GET /research/news/{coin_name}

**Description**: Recent news and developments from web search.

**Path Parameters**:
- `coin_name` (string, required): Name or symbol of the coin

**Query Parameters**:
- `max_results` (integer, optional): Maximum number of news items (default: 5, max: 10)
- `time_range` (string, optional): Time range for search - "day", "week", "month" (default: "week")

**Response**: News articles and web mentions

**Example Request**:
```bash
curl -X GET "http://localhost:8000/research/news/WIF?max_results=3&time_range=day"
```

**Example Response**:
```json
{
  "coin_name": "WIF",
  "timestamp": "2025-11-21T14:40:00Z",
  "news": [
    {
      "title": "dogwifhat (WIF) Surges 15% Amid Market Rally",
      "link": "https://cryptonews.net/article/12345",
      "snippet": "The Solana-based meme coin dogwifhat has seen significant gains...",
      "date": "2025-11-21",
      "source": "Crypto News"
    },
    {
      "title": "WIF Technical Analysis: Bullish Momentum Continues",
      "link": "https://technicalanalysis.com/wif-update",
      "snippet": "Technical indicators suggest continued upward momentum...",
      "date": "2025-11-20",
      "source": "Technical Analysis"
    }
  ],
  "search_metadata": {
    "total_results": 8,
    "time_range": "day",
    "search_query": "WIF cryptocurrency news"
  }
}
```

## 🤖 AI Content Generation Endpoints

### POST /ai/generate-blog

**Description**: Generate AI blog post from research data using Google Gemini API.

**Request Body**:
```json
{
  "research_data": {
    "coin_name": "string",
    "dex_screener": "object",
    "coingecko": "object",
    "news": "array"
  },
  "style": "string (analytical|technical|beginner|news)",
  "word_count": "integer (optional, default: 1000)",
  "include_sections": "array (optional)"
}
```

**Response**: Generated blog post with metadata

**Example Request**:
```bash
curl -X POST "http://localhost:8000/ai/generate-blog" \
  -H "Content-Type: application/json" \
  -d '{
    "research_data": {
      "coin_name": "PEPE",
      "dex_screener": {
        "best_pair": {
          "price_usd": "0.000004120",
          "price_change_24h": "-10.51",
          "volume_24h": "2234958.5"
        }
      },
      "coingecko": {
        "name": "Pepe",
        "symbol": "PEPE",
        "market_cap_rank": 66
      },
      "news": [
        {"title": "PEPE Sees Major Movement", "date": "2025-11-21"}
      ]
    },
    "style": "analytical",
    "word_count": 1200
  }'
```

**Example Response**:
```json
{
  "title": "PEPE Analysis: Market Dynamics and Future Outlook",
  "content": "# PEPE Analysis: Market Dynamics and Future Outlook\n\n## Executive Summary\nPepe (PEPE) has experienced significant market activity...\n\n## Market Analysis\nThe current price of $0.000004120 represents...\n\n## Technical Indicators\nWith a 24-hour change of -10.51%, PEPE shows...\n\n## Community Sentiment\nMarket cap rank of #66 indicates...\n\n## Risk Assessment\nSeveral factors contribute to PEPE's risk profile...\n\n## Future Outlook\nBased on current market conditions...\n\n## Conclusion\nPEPE presents both opportunities and risks...",
  "style": "analytical",
  "word_count": 1185,
  "sections": ["Executive Summary", "Market Analysis", "Technical Indicators", "Community Sentiment", "Risk Assessment", "Future Outlook", "Conclusion"],
  "metadata": {
    "model_used": "gemini-2.5-pro-preview-03-25",
    "generation_time": "2.3s",
    "prompt_tokens": 450,
    "completion_tokens": 1185
  }
}
```

### POST /ai/generate-twitter-thread

**Description**: Generate Twitter thread from research data.

**Request Body**:
```json
{
  "research_data": "object (same as blog endpoint)",
  "thread_length": "integer (optional, default: 5 tweets)",
  "include_hashtags": "boolean (optional, default: true)",
  "tone": "string (optional: professional|casual|excited)"
}
```

**Response**: Formatted Twitter thread

**Example Request**:
```bash
curl -X POST "http://localhost:8000/ai/generate-twitter-thread" \
  -H "Content-Type: application/json" \
  -d '{
    "research_data": {
      "coin_name": "DOGE",
      "dex_screener": {
        "best_pair": {
          "price_usd": "0.42",
          "price_change_24h": "+5.23"
        }
      }
    },
    "thread_length": 6,
    "include_hashtags": true,
    "tone": "excited"
  }'
```

**Example Response**:
```json
{
  "thread": [
    "🚀 DOGE is making moves! The people's cryptocurrency is showing strong momentum with a +5.23% gain in the last 24 hours. Here's what you need to know 👇 #DOGE #Crypto #Dogecoin",
    "📊 Current price: $0.42 with solid trading volume indicating strong market interest. The technical indicators suggest this could be the beginning of something bigger...",
    "💪 Dogecoin continues to prove its resilience in the crypto market. With its strong community backing and real-world adoption, DOGE remains a force to be reckoned with!",
    "🌟 The recent price movement reflects growing confidence in DOGE's utility and future potential. Community sentiment remains overwhelmingly positive!",
    "⚡ Key takeaway: DOGE's +5.23% daily gain demonstrates the power of community-driven cryptocurrencies. The momentum is building!",
    "💡 Remember: Always do your own research and invest responsibly. The crypto market is volatile, but DOGE's community strength is undeniable! #HODL #ToTheMoon"
  ],
  "metadata": {
    "total_tweets": 6,
    "total_characters": 892,
    "hashtags_included": true,
    "tone": "excited"
  }
}
```

### POST /ai/generate-newsletter

**Description**: Generate newsletter content from research data.

**Request Body**:
```json
{
  "research_data": "object (same as blog endpoint)",
  "newsletter_type": "string (market-update|deep-dive|quick-summary)",
  "audience": "string (retail|institutional|mixed)",
  "include_charts": "boolean (optional, default: false)"
}
```

**Response**: Newsletter-style content

**Example Request**:
```bash
curl -X POST "http://localhost:8000/ai/generate-newsletter" \
  -H "Content-Type: application/json" \
  -d '{
    "research_data": {
      "coin_name": "SHIB",
      "coingecko": {
        "name": "Shiba Inu",
        "market_cap_rank": 15
      },
      "news": [
        {"title": "Shiba Inu Ecosystem Expansion", "date": "2025-11-20"}
      ]
    },
    "newsletter_type": "market-update",
    "audience": "retail"
  }'
```

**Example Response**:
```json
{
  "subject": "Shiba Inu Market Update - Ecosystem Expansion Signals Growth",
  "content": "## Market Update: Shiba Inu (SHIB)\n\nDear Crypto Enthusiast,\n\nShiba Inu continues to make waves in the cryptocurrency market with exciting developments in its ecosystem expansion.\n\n### Key Highlights:\n• Market Cap Rank: #15 - Maintaining strong position\n• Ecosystem Growth: Recent expansion announcements signal long-term vision\n• Community Strength: SHIB army remains highly engaged\n\n### What This Means:\nThe Shiba Inu ecosystem expansion demonstrates the project's commitment to utility and long-term value creation. This development could position SHIB for sustained growth.\n\n### Looking Ahead:\nWith ecosystem expansion underway, SHIB is positioning itself beyond just a meme coin, potentially offering more utility to holders.\n\nStay informed,\nThe Crypto Research Team",
  "newsletter_type": "market-update",
  "audience": "retail",
  "estimated_reading_time": "2 minutes"
}
```

## ⚙️ Utility Endpoints

### GET /health

**Description**: Basic health check endpoint.

**Response**: Health status

**Example Request**:
```bash
curl -X GET "http://localhost:8000/health"
```

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T14:45:00Z",
  "uptime": "2h 15m 30s",
  "version": "1.0.0"
}
```

### GET /status

**Description**: Detailed system status including component health.

**Response**: Comprehensive system status

**Example Request**:
```bash
curl -X GET "http://localhost:8000/status"
```

**Example Response**:
```json
{
  "status": "operational",
  "timestamp": "2025-11-21T14:46:00Z",
  "components": {
    "api": "healthy",
    "dex_screener": "healthy",
    "coingecko": "healthy",
    "web_search": "healthy",
    "ai_features": "available"
  },
  "configuration": {
    "environment": "development",
    "ai_enabled": true,
    "rate_limiting": false,
    "cors_enabled": true
  },
  "statistics": {
    "total_requests": 142,
    "successful_requests": 138,
    "failed_requests": 4,
    "average_response_time": "1.2s"
  }
}
```

## 📊 Data Models

### Coin Research Response
```json
{
  "coin_name": "string",
  "timestamp": "ISO 8601 datetime",
  "summary": "string",
  "dex_screener": {
    "best_pair": {
      "chain": "string",
      "dex": "string",
      "pair_address": "string",
      "price_usd": "string",
      "price_change_24h": "string",
      "volume_24h": "string",
      "liquidity_usd": "string",
      "token_symbol": "string",
      "token_name": "string"
    }
  },
  "coingecko": {
    "id": "string",
    "symbol": "string",
    "name": "string",
    "market_cap_rank": "integer",
    "thumb": "string (URL)",
    "large": "string (URL)"
  },
  "news": [
    {
      "title": "string",
      "link": "string (URL)",
      "snippet": "string",
      "date": "string",
      "source": "string"
    }
  ]
}
```

### AI Blog Post Response
```json
{
  "title": "string",
  "content": "string (markdown)",
  "style": "string",
  "word_count": "integer",
  "sections": ["string"],
  "metadata": {
    "model_used": "string",
    "generation_time": "string",
    "prompt_tokens": "integer",
    "completion_tokens": "integer"
  }
}
```

### Error Response
```json
{
  "detail": "string",
  "error_code": "string",
  "timestamp": "ISO 8601 datetime",
  "path": "string"
}
```

## 🧪 Testing Examples

### Basic Research Test
```bash
# Test with popular meme coins
curl -X GET "http://localhost:8000/research/coin/PEPE"
curl -X GET "http://localhost:8000/research/coin/DOGE"
curl -X GET "http://localhost:8000/research/coin/SHIB"
```

### AI Content Generation Test
```bash
# Generate blog post with research data
curl -X POST "http://localhost:8000/ai/generate-blog" \
  -H "Content-Type: application/json" \
  -d '{
    "research_data": {
      "coin_name": "BONK",
      "dex_screener": {"best_pair": {"price_usd": "0.000025", "price_change_24h": "+12.5"}},
      "coingecko": {"name": "Bonk", "market_cap_rank": 95}
    },
    "style": "technical"
  }'
```

### Health and Status Checks
```bash
# Basic health check
curl -X GET "http://localhost:8000/health"

# Detailed status
curl -X GET "http://localhost:8000/status"
```

## 🚨 Error Handling

### Common Error Scenarios

#### Coin Not Found
```json
{
  "detail": "Coin 'INVALIDCOIN' not found in available data sources",
  "error_code": "COIN_NOT_FOUND",
  "timestamp": "2025-11-21T14:50:00Z",
  "path": "/research/coin/INVALIDCOIN"
}
```

#### AI Service Unavailable
```json
{
  "detail": "AI content generation is currently unavailable. Please try again later or contact support.",
  "error_code": "AI_SERVICE_UNAVAILABLE",
  "timestamp": "2025-11-21T14:51:00Z",
  "path": "/ai/generate-blog"
}
```

#### External API Error
```json
{
  "detail": "External data source temporarily unavailable. Some data may be incomplete.",
  "error_code": "EXTERNAL_API_ERROR",
  "timestamp": "2025-11-21T14:52:00Z",
  "path": "/research/coin/PEPE"
}
```

#### Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "research_data", "coin_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-21T14:53:00Z",
  "path": "/ai/generate-blog"
}
```

## 📈 Rate Limiting

Currently, rate limiting is not implemented. Future versions may include:
- Request rate limiting per IP
- API key-based rate limiting
- Tiered rate limits for different endpoints

## 🔒 Security Considerations

### Input Validation
- All inputs are validated using Pydantic models
- SQL injection protection through parameterized queries (when applicable)
- XSS prevention through proper output encoding

### Data Privacy
- No user data is stored persistently
- All API calls are stateless
- External API keys are never exposed in responses

### Network Security
- All external API calls use HTTPS
- SSL certificate validation is enabled
- CORS is configurable through environment variables

## 🚀 Performance Optimization

### Response Caching
- Consider implementing Redis caching for frequently requested coins
- Cache external API responses with appropriate TTL
- Use ETags for client-side caching

### Background Processing
- Long-running operations use FastAPI background tasks
- AI content generation can be processed asynchronously
- Consider implementing a job queue for heavy operations

## 📚 Additional Resources

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### External API Documentation
- **DEX Screener API**: https://docs.dexscreener.com/
- **CoinGecko API**: https://docs.coingecko.com/
- **Google Gemini API**: https://ai.google.dev/docs

### Support
For issues and questions:
1. Check the health endpoint: `/health`
2. Review the status endpoint: `/status`
3. Test with the interactive documentation: `/docs`
4. Submit issues to the project repository

---

**🎯 Quick Start**: Test the API with a simple research request:
```bash
curl -X GET "http://localhost:8000/research/coin/PEPE"
```