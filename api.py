from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import asyncio
import json
from datetime import datetime
import os
from dotenv import load_dotenv

from coin_agent import MemeCoinAgent
from ai_blog_generator import AIBlogGenerator

# Load environment variables from .env file
load_dotenv(override=True)

# Get configuration from environment variables
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

app = FastAPI(
    title="Meme Coin Research API",
    description="AI-powered cryptocurrency research and blog generation API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize agent with optional AI features
ai_available = True
try:
    # Set the Google API key from environment if available
    if GOOGLE_API_KEY and GOOGLE_API_KEY != "your_gemini_api_key_here":
        os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
        agent = MemeCoinAgent(enable_ai=True)
        if agent.blog_generator is None:
            print("⚠️  Google Gemini API key not found. AI features will be disabled.")
            print("To enable AI features, set GOOGLE_API_KEY environment variable.")
            ai_available = False
        else:
            print("✅ Google Gemini API key loaded. AI features are enabled.")
    else:
        print("⚠️  Google Gemini API key not configured. AI features will be disabled.")
        print("To enable AI features, set GOOGLE_API_KEY in your .env file.")
        agent = MemeCoinAgent(enable_ai=False)
        ai_available = False
except ValueError as e:
    if "Google Gemini API key" in str(e):
        print("⚠️  Google Gemini API key not found. AI features will be disabled.")
        print("To enable AI features, set GOOGLE_API_KEY environment variable.")
        # Create agent without AI features
        ai_available = False
        agent = MemeCoinAgent(enable_ai=False)
    else:
        raise

class CoinResearchRequest(BaseModel):
    coin_name: str = Field(..., description="Name of the cryptocurrency to research")
    include_ai_blog: bool = Field(True, description="Whether to generate AI blog post")
    blog_style: str = Field("analytical", description="Style of AI blog: analytical, technical, beginner, news")

class BlogGenerationRequest(BaseModel):
    research_data: Dict[str, Any] = Field(..., description="Research data to generate blog from")
    style: str = Field("analytical", description="Blog style: analytical, technical, beginner, news")
    content_type: str = Field("blog", description="Content type: blog, twitter, newsletter")

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    services: Dict[str, str]

@app.get("/", response_model=Dict[str, str])
async def root():
    return {
        "message": "Meme Coin Research API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        services={
            "api": "running",
            "agent": "initialized",
            "ai_blog": "available" if ai_available else "disabled"
        }
    )

@app.post("/research/coin")
async def research_coin(request: CoinResearchRequest):
    try:
        coin_name = request.coin_name.strip()
        
        if not coin_name:
            raise HTTPException(status_code=400, detail="Coin name cannot be empty")
        
        print(f"🔍 Starting research for {coin_name}...")
        
        # Run all research tasks concurrently
        tasks = [
            agent.search_dex_screener(coin_name),
            agent.search_coingecko(coin_name),
            agent.search_social_media(coin_name),
            agent.search_general_web(f"{coin_name} whale activity"),
            agent.search_web_news(coin_name),
            agent.search_general_web(f"{coin_name} reddit sentiment"),
            agent.search_general_web(f"{coin_name} twitter sentiment")
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        dex_data, coingecko_data, social_data, whale_data, news_data, reddit_data, twitter_data = results
        
        # Handle exceptions
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"⚠️ Task {i} failed: {result}")
                results[i] = {"error": str(result)}
        
        # Compile comprehensive analysis
        analysis = {
            "coin_name": coin_name,
            "timestamp": datetime.now().isoformat(),
            "market_data": dex_data if not isinstance(dex_data, Exception) else {"error": str(dex_data)},
            "coingecko_data": coingecko_data if not isinstance(coingecko_data, Exception) else {"error": str(coingecko_data)},
            "social_metrics": social_data if not isinstance(social_data, Exception) else {"error": str(social_data)},
            "whale_activity": whale_data if not isinstance(whale_data, Exception) else {"error": str(whale_data)},
            "recent_news": news_data if not isinstance(news_data, Exception) else {"error": str(news_data)},
            "reddit_sentiment": reddit_data if not isinstance(reddit_data, Exception) else {"error": str(reddit_data)},
            "twitter_sentiment": twitter_data if not isinstance(twitter_data, Exception) else {"error": str(twitter_data)}
        }
        
        # Generate AI blog if requested
        ai_blog = None
        if request.include_ai_blog:
            if not ai_available:
                analysis["ai_blog"] = {"error": "AI features are disabled. Set GOOGLE_API_KEY to enable."}
            else:
                try:
                    print(f"🤖 Generating AI blog post for {coin_name}...")
                    ai_blog = await agent.generate_ai_blog_post(analysis, request.blog_style)
                    analysis["ai_blog"] = ai_blog
                except Exception as e:
                    print(f"⚠️ AI blog generation failed: {e}")
                    analysis["ai_blog"] = {"error": f"AI blog generation failed: {str(e)}"}
        
        print(f"✅ Research completed for {coin_name}")
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@app.post("/research/market-data")
async def get_market_data(coin_name: str):
    try:
        if not coin_name.strip():
            raise HTTPException(status_code=400, detail="Coin name cannot be empty")
        
        result = await agent.search_dex_screener(coin_name.strip())
        return {
            "coin_name": coin_name.strip(),
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market data retrieval failed: {str(e)}")

@app.post("/research/social-metrics")
async def get_social_metrics(coin_name: str):
    try:
        if not coin_name.strip():
            raise HTTPException(status_code=400, detail="Coin name cannot be empty")
        
        result = await agent.search_social_media(coin_name.strip())
        return {
            "coin_name": coin_name.strip(),
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social metrics retrieval failed: {str(e)}")

@app.post("/research/whale-activity")
async def get_whale_activity(coin_name: str):
    try:
        if not coin_name.strip():
            raise HTTPException(status_code=400, detail="Coin name cannot be empty")
        
        result = await agent.search_general_web(f"{coin_name.strip()} whale activity")
        return {
            "coin_name": coin_name.strip(),
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whale activity retrieval failed: {str(e)}")

@app.post("/research/news")
async def get_news(coin_name: str):
    try:
        if not coin_name.strip():
            raise HTTPException(status_code=400, detail="Coin name cannot be empty")
        
        result = await agent.search_web_news(coin_name.strip())
        return {
            "coin_name": coin_name.strip(),
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News retrieval failed: {str(e)}")

@app.post("/ai/generate-blog")
async def generate_ai_blog(request: BlogGenerationRequest):
    try:
        if not ai_available:
            raise HTTPException(status_code=503, detail="AI features are disabled. Set GOOGLE_API_KEY to enable.")
        
        if not request.research_data:
            raise HTTPException(status_code=400, detail="Research data cannot be empty")
        
        if request.content_type not in ["blog", "twitter", "newsletter"]:
            raise HTTPException(status_code=400, detail="Invalid content type. Must be: blog, twitter, or newsletter")
        
        print(f"🤖 Generating AI {request.content_type} in {request.style} style...")
        
        # Use the agent's blog generator
        if request.content_type == "blog":
            result = await agent.generate_ai_blog_post(request.research_data, request.style)
        elif request.content_type == "twitter":
            result = await agent.generate_twitter_thread(request.research_data)
        else:  # newsletter
            result = await agent.generate_newsletter_summary(request.research_data)
        
        return {
            "content_type": request.content_type,
            "style": request.style,
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI content generation failed: {str(e)}")

@app.post("/ai/generate-twitter-thread")
async def generate_twitter_thread(research_data: Dict[str, Any]):
    try:
        if not ai_available:
            raise HTTPException(status_code=503, detail="AI features are disabled. Set GOOGLE_API_KEY to enable.")
        
        if not research_data:
            raise HTTPException(status_code=400, detail="Research data cannot be empty")
        
        result = await agent.generate_twitter_thread(research_data)
        return {
            "content_type": "twitter_thread",
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Twitter thread generation failed: {str(e)}")

@app.post("/ai/generate-newsletter")
async def generate_newsletter(research_data: Dict[str, Any]):
    try:
        if not ai_available:
            raise HTTPException(status_code=503, detail="AI features are disabled. Set GOOGLE_API_KEY to enable.")
        
        if not research_data:
            raise HTTPException(status_code=400, detail="Research data cannot be empty")
        
        result = await agent.generate_newsletter_summary(research_data)
        return {
            "content_type": "newsletter",
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Newsletter generation failed: {str(e)}")

@app.get("/coins/list")
async def get_supported_coins():
    """Get list of commonly researched meme coins"""
    return {
        "popular_meme_coins": [
            "PEPE", "DOGE", "SHIB", "WIF", "FLOKI", "BONK", "DOGE", "SAMO",
            "ELON", "HOGE", "SAFEMOON", "AKITA", "KISHU", "LEASH", "BONE"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/blog/styles")
async def get_blog_styles():
    """Get available blog styles"""
    return {
        "styles": [
            {"name": "analytical", "description": "In-depth analysis with charts and data"},
            {"name": "technical", "description": "Technical analysis for crypto enthusiasts"},
            {"name": "beginner", "description": "Easy-to-understand explanations for newcomers"},
            {"name": "news", "description": "News-style reporting with current events"}
        ]
    }

# Background task for comprehensive research
@app.post("/research/async")
async def research_coin_async(request: CoinResearchRequest, background_tasks: BackgroundTasks):
    """Start comprehensive research in background"""
    
    def save_results(results):
        filename = f"{request.coin_name.lower()}_research_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            print(f"💾 Results saved to {filename}")
        except Exception as e:
            print(f"⚠️ Failed to save results: {e}")
    
    # Start background research
    background_tasks.add_task(
        research_and_save, 
        request.coin_name, 
        request.include_ai_blog, 
        request.blog_style,
        save_results
    )
    
    return {
        "message": f"Research started for {request.coin_name}",
        "status": "processing",
        "timestamp": datetime.now().isoformat(),
        "check_status": f"/research/status/{request.coin_name.lower()}"
    }

async def research_and_save(coin_name: str, include_ai_blog: bool, blog_style: str, save_callback):
    """Background research function"""
    try:
        # Create research request
        request = CoinResearchRequest(
            coin_name=coin_name,
            include_ai_blog=include_ai_blog,
            blog_style=blog_style
        )
        
        # Perform research
        results = await research_coin(request)
        
        # Save results
        save_callback(results)
        
    except Exception as e:
        print(f"❌ Background research failed for {coin_name}: {e}")

if __name__ == "__main__":
    import uvicorn
    
    print(f"🚀 Starting Meme Coin Research API on {HOST}:{PORT}")
    print(f"📡 Environment: {ENVIRONMENT}")
    print(f"🤖 AI Features: {'Enabled' if ai_available else 'Disabled'}")
    print(f"📚 API Documentation: http://{HOST}:{PORT}/docs")
    print(f"📖 Alternative Docs: http://{HOST}:{PORT}/redoc")
    
    # Configure uvicorn logging
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
        },
        "root": {
            "level": LOG_LEVEL,
            "handlers": ["default"],
        },
    }
    
    uvicorn.run(
        app, 
        host=HOST, 
        port=PORT,
        log_level=LOG_LEVEL.lower(),
        log_config=log_config
    )