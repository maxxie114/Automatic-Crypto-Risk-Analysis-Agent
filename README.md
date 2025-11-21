# 🚀 Meme Coin Research API

A comprehensive AI-powered cryptocurrency research and blog generation API that provides real-time market data, social metrics, and AI-generated content for meme coins and cryptocurrencies.

## ✨ Features

### Core Research Capabilities
- **Multi-Source Data Collection**: Combines data from DEX Screener, CoinGecko, and web search
- **Real-Time Market Data**: Current prices, 24h changes, volume, and liquidity
- **Market Analysis**: Market cap rankings and trading pair information
- **Social Metrics**: Community engagement and sentiment analysis
- **News Aggregation**: Recent news and developments from web search

### AI-Powered Content Generation
- **Blog Post Generation**: AI-generated comprehensive blog posts using Google Gemini API
- **Multiple Content Styles**: Analytical, technical, beginner-friendly, and news formats
- **Twitter Thread Creation**: Generate engaging Twitter threads from research data
- **Newsletter Content**: Create newsletter-style summaries
- **Structured Content**: Well-formatted markdown with sections and key insights

### API Features
- **RESTful API**: FastAPI-based with comprehensive endpoints
- **Real-Time Processing**: Async background tasks for long-running operations
- **Error Handling**: Robust error handling with detailed error messages
- **Health Monitoring**: Health check and status endpoints
- **Interactive Documentation**: Auto-generated Swagger UI and ReDoc documentation

## 🛠️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI API   │────│  Coin Agent     │────│  AI Blog        │
│   Endpoints     │    │  (Research)     │    │  Generator      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  DEX Screener   │    │  CoinGecko      │    │  Google Gemini  │
│  API            │    │  API            │    │  API            │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Files

#### `api.py` - FastAPI Application
- **FastAPI Server**: Main API application with comprehensive endpoints
- **Pydantic Models**: Request/response validation and serialization
- **Background Tasks**: Async processing for research operations
- **Error Handling**: Comprehensive exception handling
- **Environment Configuration**: Environment-based configuration management

#### `coin_agent.py` - Research Engine
- **MemeCoinAgent Class**: Core research and data aggregation engine
- **Multi-API Integration**: DEX Screener, CoinGecko, and web search
- **Data Processing**: Raw data cleaning and analysis
- **Research Methods**: Individual and comprehensive research capabilities
- **AI Integration**: Optional AI blog generation with Gemini API

#### `ai_blog_generator.py` - AI Content Engine
- **AIBlogGenerator Class**: Google Gemini API integration
- **Content Generation**: Blog posts, Twitter threads, newsletters
- **Style Templates**: Multiple writing styles and formats
- **Structured Output**: Markdown formatting with sections
- **Fallback Content**: Graceful degradation when AI unavailable

#### `app.py` - Streamlit Dashboard
- **Web Interface**: User-friendly Streamlit dashboard
- **Multi-Tab Interface**: Research, AI Blog, and other features
- **Real-Time Display**: Live data visualization and results
- **Export Functionality**: JSON and markdown export options
- **Interactive Testing**: Built-in testing and validation tools

## 🔧 API Endpoints

### Research Endpoints

#### `GET /research/coin/{coin_name}`
**Description**: Comprehensive research for a specific coin
**Response**: Complete analysis including market data, social metrics, and news

#### `GET /research/market-data/{coin_name}`
**Description**: Market data only (DEX Screener + CoinGecko)
**Response**: Price, volume, market cap, and trading data

#### `GET /research/social-metrics/{coin_name}`
**Description**: Social and community metrics
**Response**: Social engagement data and community statistics

#### `GET /research/news/{coin_name}`
**Description**: Recent news and developments
**Response**: Web search results and news articles

### AI Content Generation Endpoints

#### `POST /ai/generate-blog`
**Description**: Generate AI blog post from research data
**Request Body**: Research data and content preferences
**Response**: Generated blog post with metadata

#### `POST /ai/generate-twitter-thread`
**Description**: Generate Twitter thread from research data
**Request Body**: Research data and thread preferences
**Response**: Formatted Twitter thread content

#### `POST /ai/generate-newsletter`
**Description**: Generate newsletter content from research data
**Request Body**: Research data and newsletter preferences
**Response**: Newsletter-style summary content

### Utility Endpoints

#### `GET /health`
**Description**: Health check endpoint
**Response**: API status and system information

#### `GET /status`
**Description**: Detailed system status
**Response**: Component status and configuration info

#### `GET /docs`
**Description**: Interactive API documentation (Swagger UI)
**Response**: Auto-generated API documentation

#### `GET /redoc`
**Description**: Alternative API documentation (ReDoc)
**Response**: Alternative API documentation format

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager
- Google Gemini API key (optional, for AI features)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meme-coin-research-api
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Run the API server**
   ```bash
   python api.py
   ```

5. **Access the API**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

### Environment Configuration

Create a `.env` file with the following configuration:

```env
# Google Gemini API Key (required for AI features)
GOOGLE_API_KEY=your_gemini_api_key_here

# API Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
LOG_LEVEL=INFO

# Optional: Security settings
RATE_LIMIT=100
CORS_ORIGINS=*
```

### Optional: Streamlit Dashboard

For the web dashboard interface:

```bash
streamlit run app.py
```

Access the dashboard at: http://localhost:8501

## 📊 Data Sources

### DEX Screener API
```
GET https://api.dexscreener.com/latest/dex/search?q={coin_name}
```
Returns: Trading pairs, prices, volume, liquidity data

### CoinGecko API
```
GET https://api.coingecko.com/api/v3/search?query={coin_name}
```
Returns: Coin information, market cap rank, symbols, metadata

### Web Search (DuckDuckGo)
```
GET https://html.duckduckgo.com/html/?q={coin_name}+news
```
Returns: Recent news articles and web mentions

### Google Gemini API (Optional)
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```
Returns: AI-generated content based on research data

## 🔒 Security Features

### Environment Protection
- **Environment Variables**: All sensitive configuration in `.env` file
- **Git Ignore**: Comprehensive `.gitignore` prevents committing secrets
- **API Key Protection**: Gemini API key never exposed in code

### API Security
- **Input Validation**: Pydantic models validate all requests
- **Error Sanitization**: Detailed errors without exposing system details
- **Rate Limiting**: Configurable rate limiting (when implemented)
- **CORS Configuration**: Configurable CORS origins

### Data Security
- **No Data Storage**: No persistent storage of user data
- **HTTPS Only**: All external API calls use HTTPS
- **Certificate Validation**: SSL certificate verification enabled

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` to test endpoints:

1. **Health Check**: Test `/health` endpoint
2. **Coin Research**: Test `/research/coin/{coin_name}` with "PEPE"
3. **AI Generation**: Test `/ai/generate-blog` with sample research data

### Automated Testing
```bash
# Test API endpoints
curl -X GET "http://localhost:8000/health"

# Test coin research
curl -X GET "http://localhost:8000/research/coin/PEPE"

# Test AI blog generation (requires research data)
curl -X POST "http://localhost:8000/ai/generate-blog" \
  -H "Content-Type: application/json" \
  -d '{"research_data": {...}, "style": "analytical"}'
```

## 📈 Performance & Scaling

### Async Processing
- **Background Tasks**: Long-running operations use FastAPI background tasks
- **Concurrent Requests**: Async/await patterns for parallel processing
- **Non-blocking I/O**: External API calls use async libraries

### Caching Strategy
- **Response Caching**: Consider implementing Redis caching for frequent requests
- **API Response Caching**: Cache external API responses with TTL
- **Conditional Requests**: Use ETags for client-side caching

### Scaling Considerations
- **Horizontal Scaling**: Stateless design allows multiple instances
- **Load Balancing**: Compatible with standard load balancers
- **Container Ready**: Docker-compatible for containerized deployment

## 🐛 Error Handling

### Error Types
- **400 Bad Request**: Invalid input parameters
- **404 Not Found**: Coin not found or no data available
- **422 Validation Error**: Pydantic validation failures
- **500 Internal Server Error**: Server-side processing errors
- **503 Service Unavailable**: External API unavailable

### Error Response Format
```json
{
  "detail": "Detailed error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-11-21T12:00:00Z",
  "path": "/research/coin/INVALID"
}
```

## 📝 Logging & Monitoring

### Logging Levels
- **INFO**: General operation information
- **WARNING**: Non-critical issues and warnings
- **ERROR**: Critical errors and failures
- **DEBUG**: Detailed debugging information (development only)

### Health Monitoring
- **Health Endpoint**: `/health` for basic health checks
- **Status Endpoint**: `/status` for detailed system status
- **Component Status**: Individual component health reporting

## 🔧 Troubleshooting

### Common Issues

#### SSL Certificate Errors
```bash
pip install --upgrade certifi
```

#### Module Import Errors
```bash
pip install -r requirements.txt
```

#### API Key Issues
- Verify `GOOGLE_API_KEY` is set in `.env` file
- Check API key validity and quotas
- Ensure API key has proper permissions

#### Port Conflicts
```bash
# Check if port 8000 is in use
lsof -i :8000
# Kill existing process or change PORT in .env
```

#### Memory Issues
- Monitor memory usage during large research operations
- Consider implementing request timeouts
- Use streaming responses for large datasets

## 🚀 Deployment

### Local Development
```bash
python api.py
```

### Production Deployment
1. **Environment Variables**: Set production environment variables
2. **Process Manager**: Use systemd, PM2, or similar
3. **Reverse Proxy**: Use Nginx or Apache
4. **SSL/TLS**: Configure HTTPS with proper certificates
5. **Monitoring**: Set up logging and monitoring

### Docker Deployment (Future)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "api.py"]
```

### Cloud Deployment
- **Heroku**: Compatible with Heroku deployment
- **AWS**: EC2, ECS, or Lambda deployment
- **Google Cloud**: Compute Engine or Cloud Run
- **Azure**: App Service or Container Instances

## 📈 Future Enhancements

### Planned Features
- [ ] **Historical Data**: Price history and trend analysis
- [ ] **Sentiment Analysis**: Social media sentiment scoring
- [ ] **Portfolio Tracking**: Multi-coin portfolio analysis
- [ ] **Real-Time Alerts**: Price and news alerts
- [ ] **Advanced Analytics**: Risk assessment and scoring
- [ ] **Mobile App**: React Native mobile application
- [ ] **WebSocket API**: Real-time data streaming

### Performance Improvements
- [ ] **Redis Caching**: Implement Redis-based caching
- [ ] **Database Integration**: Persistent data storage
- [ ] **Background Jobs**: Celery for background processing
- [ ] **API Rate Limiting**: Advanced rate limiting with Redis
- [ ] **Response Compression**: Gzip compression for large responses

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Follow PEP 8 Python style guidelines
- Use type hints for function parameters and return values
- Add docstrings for all functions and classes
- Keep functions focused and under 50 lines when possible

### Testing
- Test all new endpoints manually
- Verify error handling works correctly
- Test with various coin names and edge cases
- Ensure AI features work when API key is available

## 📄 License

Open source - use freely for educational and research purposes.

## ⚠️ Disclaimer

**Important**: This tool is for research and educational purposes only. 

- **Not Financial Advice**: All data and analysis are for informational purposes only
- **Do Your Own Research**: Always conduct your own research before investing
- **Cryptocurrency Risk**: Cryptocurrency investments are highly volatile and risky
- **API Limitations**: Data accuracy depends on third-party APIs
- **AI Content**: AI-generated content should be verified for accuracy

---

**🚀 Ready to research some meme coins? Start with:**
```bash
curl -X GET "http://localhost:8000/research/coin/PEPE"
```

For support and questions, please check the documentation at `/docs` or submit an issue.