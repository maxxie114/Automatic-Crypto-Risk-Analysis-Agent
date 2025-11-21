# 🔐 Security & Environment Configuration Guide

## 🚨 CRITICAL: Protect Your API Keys

Your `.env` file contains sensitive API keys that must be kept private. **Never commit this file to git!**

## ✅ What's Already Protected

### 1. `.gitignore` File
Your `.gitignore` file already excludes:
- `.env` and all environment files
- API keys and secrets
- Log files
- Cache files
- Temporary files

### 2. Environment Variables Structure
Your `.env.example` file shows all available configuration options:
- Google Gemini API key
- Server configuration
- Security settings
- Logging configuration
- Optional production settings

## 🔑 API Key Security Best Practices

### 1. Google Gemini API Key
```bash
# Your .env file should contain:
GOOGLE_API_KEY=your_actual_api_key_here
```

**How to get your Gemini API key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### 2. Never Share These Files
- `.env` - Contains your actual API keys
- `*.key` - Private key files
- `*.pem` - Certificate files
- `credentials.json` - Service account files

### 3. Use Environment-Specific Files
```bash
.env.development     # Development environment
.env.production      # Production environment (never commit)
.env.staging         # Staging environment (never commit)
```

## 🚀 Deployment Security Checklist

### Before Deployment
- [ ] Remove all `.env` files from git history
- [ ] Set up environment variables on your hosting platform
- [ ] Use strong API secret keys
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable logging and monitoring

### Environment Variables by Platform

#### Vercel Deployment
```bash
# Set environment variables in Vercel dashboard:
GOOGLE_API_KEY=your_gemini_api_key
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
```

#### Heroku Deployment
```bash
# Set environment variables using Heroku CLI:
heroku config:set GOOGLE_API_KEY=your_gemini_api_key
heroku config:set PORT=8000
heroku config:set HOST=0.0.0.0
heroku config:set ENVIRONMENT=production
```

#### Docker Deployment
```dockerfile
# Use environment variables in Dockerfile
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}
ENV PORT=8000
ENV HOST=0.0.0.0
ENV ENVIRONMENT=production
```

## 🔒 Additional Security Measures

### 1. Rate Limiting (Production)
```python
# Install rate limiting package
pip install slowapi

# Add to your API
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply rate limiting to endpoints
@app.post("/research/coin")
@limiter.limit("10/minute")
async def research_coin(request: CoinResearchRequest):
    # Your endpoint logic
```

### 2. API Key Authentication (Optional)
```python
# Add API key authentication for sensitive endpoints
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

API_KEY = os.getenv("API_SECRET_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(status_code=403, detail="Invalid API Key")

@app.post("/admin/endpoint")
async def admin_endpoint(api_key: str = Security(get_api_key)):
    # Protected endpoint logic
```

### 3. CORS Configuration
```python
# Configure CORS properly for production
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins only
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 🚨 Emergency Response

### If API Keys Are Exposed
1. **Immediately revoke the exposed API key**
2. **Generate a new API key**
3. **Update your environment variables**
4. **Check for unauthorized usage**
5. **Monitor your API usage logs**

### Monitoring API Usage
```python
# Add logging to track API usage
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    
    return response
```

## 📊 Environment Variable Reference

### Required Variables
```bash
GOOGLE_API_KEY=your_gemini_api_key    # For AI features
PORT=8000                               # Server port
HOST=0.0.0.0                           # Server host
```

### Optional Variables
```bash
ENVIRONMENT=development                # development/production
LOG_LEVEL=INFO                          # DEBUG/INFO/WARNING/ERROR
RATE_LIMIT_REQUESTS_PER_MINUTE=60       # Rate limiting
API_SECRET_KEY=your_secret_key         # For authentication
JWT_SECRET_KEY=your_jwt_secret         # For JWT tokens
```

## 🔧 Quick Security Setup

### 1. Run the setup script:
```bash
python3 setup.py
```

### 2. Edit your .env file:
```bash
nano .env
# Add your API keys
```

### 3. Test your configuration:
```bash
curl http://localhost:8000/health
```

### 4. Verify AI features:
```bash
curl -X POST "http://localhost:8000/research/coin" \
  -H "Content-Type: application/json" \
  -d '{"coin_name": "PEPE", "include_ai_blog": true}'
```

## 📞 Support

If you have security concerns:
1. Check the API logs for suspicious activity
2. Review your API key usage in Google Cloud Console
3. Update to the latest version of all dependencies
4. Consider using a Web Application Firewall (WAF) for production

Remember: **Security is an ongoing process, not a one-time setup!** 🔒