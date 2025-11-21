#!/usr/bin/env python3
"""
AI Blog Generator using Google Gemini API
Creates comprehensive blog posts from cryptocurrency research data
"""

import google.generativeai as genai
import os
from typing import Dict, List, Optional
import json
from datetime import datetime

class AIBlogGenerator:
    """AI-powered blog generator using Google Gemini API"""
    
    def __init__(self, api_key: str = None):
        """Initialize the AI blog generator with Gemini API"""
        self.api_key = api_key or os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("Google Gemini API key is required. Set GOOGLE_API_KEY environment variable.")
        
        genai.configure(api_key=self.api_key)
        # List available models and use the first available one
        available_models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        if available_models:
            model_name = available_models[0].name
            print(f"Using model: {model_name}")
            self.model = genai.GenerativeModel(model_name)
        else:
            # Fallback to common model names
            self.model = genai.GenerativeModel('gemini-pro')
        
    def create_blog_post(self, coin_data: Dict, blog_style: str = "analytical") -> Dict:
        """
        Create a comprehensive blog post from coin research data
        
        Args:
            coin_data: Dictionary containing all research data
            blog_style: Style of blog post (analytical, technical, beginner-friendly, news)
            
        Returns:
            Dictionary containing blog post title, content, and metadata
        """
        coin_name = coin_data.get('coin_name', 'Unknown Coin')
        
        # Prepare the prompt based on available data
        prompt = self._create_blog_prompt(coin_data, blog_style)
        
        try:
            # Generate the blog content
            response = self.model.generate_content(prompt)
            blog_content = response.text
            
            # Create structured blog post
            blog_post = {
                "title": f"{coin_name} Analysis: Complete Research Report {datetime.now().strftime('%B %Y')}",
                "content": blog_content,
                "coin_name": coin_name,
                "timestamp": datetime.now().isoformat(),
                "style": blog_style,
                "word_count": len(blog_content.split()),
                "sections": self._extract_sections(blog_content),
                "key_insights": self._extract_key_insights(coin_data)
            }
            
            return blog_post
            
        except Exception as e:
            return {
                "error": f"Failed to generate blog post: {str(e)}",
                "title": f"{coin_name} Analysis",
                "content": self._create_fallback_content(coin_data),
                "timestamp": datetime.now().isoformat()
            }
    
    def _create_blog_prompt(self, coin_data: Dict, style: str) -> str:
        """Create a detailed prompt for the AI based on research data"""
        
        # Extract key data points
        dex_data = coin_data.get('dex_screener', {})
        coingecko_data = coin_data.get('coingecko', {})
        news_data = coin_data.get('news', [])
        social_data = coin_data.get('social_media', [])
        web_data = coin_data.get('web_analysis', [])
        
        # Build data summary
        data_summary = self._build_data_summary(dex_data, coingecko_data, news_data, social_data, web_data)
        
        # Style-specific instructions
        style_instructions = {
            "analytical": "Write an analytical blog post with data-driven insights, market analysis, and investment considerations. Focus on facts and trends.",
            "technical": "Write a technical blog post focusing on blockchain technology, tokenomics, and technical aspects of the project.",
            "beginner-friendly": "Write an easy-to-understand blog post for cryptocurrency beginners. Explain complex concepts in simple terms.",
            "news": "Write a news-style blog post covering recent developments, market movements, and current events related to this coin."
        }
        
        prompt = f"""
        Create a comprehensive blog post about {coin_data.get('coin_name', 'this cryptocurrency')} based on the following research data:

        {data_summary}

        {style_instructions.get(style, style_instructions['analytical'])}

        Requirements:
        - Write in a professional, engaging tone
        - Include specific data points and metrics
        - Provide actionable insights for readers
        - Structure with clear headings and sections
        - Include both positive aspects and potential risks
        - Write at least 800 words
        - Use markdown formatting

        Blog Post:
        """
        
        return prompt.strip()
    
    def _build_data_summary(self, dex_data: Dict, coingecko_data: Dict, 
                          news_data: List, social_data: List, web_data: List) -> str:
        """Build a comprehensive summary of all research data"""
        
        summary_parts = []
        
        # Market Data Summary
        if "best_pair" in dex_data:
            pair = dex_data["best_pair"]
            summary_parts.append(f"""
MARKET DATA:
- Current Price: ${pair.get('price_usd', 'N/A')}
- 24h Change: {pair.get('price_change_24h', 'N/A')}%
- 24h Volume: ${pair.get('volume_24h', 'N/A')}
- Liquidity: ${pair.get('liquidity_usd', 'N/A')}
- Blockchain: {pair.get('chain', 'N/A')}
- Exchange: {pair.get('dex', 'N/A')}
""")
        
        # CoinGecko Data Summary
        if "coin_data" in coingecko_data:
            coin = coingecko_data["coin_data"]
            summary_parts.append(f"""
COIN INFORMATION:
- Name: {coin.get('name', 'N/A')}
- Symbol: {coin.get('symbol', 'N/A')}
- Market Cap Rank: #{coin.get('market_cap_rank', 'N/A')}
""")
        
        # News Summary
        if news_data and len(news_data) > 0:
            summary_parts.append(f"""
RECENT NEWS ({len(news_data)} articles found):
""" + "\n".join([f"- {news.get('title', 'N/A')}" for news in news_data[:3]]) + "\n" + 
"""More news articles covering market developments and project updates.""")
        
        # Social Media Summary
        if social_data and len(social_data) > 0:
            summary_parts.append(f"""
SOCIAL MEDIA ACTIVITY ({len(social_data)} mentions found):
Active discussions on cryptocurrency forums and social platforms.
""")
        
        # Web Analysis Summary
        if web_data and len(web_data) > 0:
            summary_parts.append(f"""
WEB ANALYSIS ({len(web_data)} sources found):
Multiple analytical articles and price predictions available from various crypto sources.
""")
        
        return "\n".join(summary_parts) if summary_parts else "Limited data available for analysis."
    
    def _extract_sections(self, content: str) -> List[Dict]:
        """Extract structured sections from the blog content"""
        sections = []
        lines = content.split('\n')
        current_section = {"title": "Introduction", "content": ""}
        
        for line in lines:
            if line.startswith('#'):
                if current_section["content"]:
                    sections.append(current_section)
                current_section = {"title": line.strip('#').strip(), "content": ""}
            else:
                current_section["content"] += line + "\n"
        
        if current_section["content"]:
            sections.append(current_section)
        
        return sections
    
    def _extract_key_insights(self, coin_data: Dict) -> List[str]:
        """Extract key insights from the research data"""
        insights = []
        
        # Price insights
        dex_data = coin_data.get('dex_screener', {})
        if "best_pair" in dex_data:
            pair = dex_data["best_pair"]
            price_change = pair.get('price_change_24h', 0)
            if price_change:
                change_val = float(price_change) if price_change != "N/A" else 0
                if change_val > 5:
                    insights.append(f"Strong positive momentum with +{change_val}% 24h gain")
                elif change_val < -5:
                    insights.append(f"Significant decline with {change_val}% 24h loss")
                else:
                    insights.append(f"Stable price movement with {change_val}% 24h change")
        
        # Volume insights
        volume = pair.get('volume_24h', 0) if "best_pair" in dex_data else 0
        if volume and float(volume) > 1000000:
            insights.append("High trading volume indicates strong market interest")
        
        # Market cap insights
        coingecko_data = coin_data.get('coingecko', {})
        if "coin_data" in coingecko_data:
            rank = coingecko_data["coin_data"].get('market_cap_rank')
            if rank and rank <= 100:
                insights.append("Top 100 cryptocurrency by market capitalization")
        
        # News insights
        news_data = coin_data.get('news', [])
        if len(news_data) > 3:
            insights.append(f"Active media coverage with {len(news_data)} recent articles")
        
        return insights if insights else ["Comprehensive research data available for analysis"]
    
    def _create_fallback_content(self, coin_data: Dict) -> str:
        """Create fallback content if AI generation fails"""
        coin_name = coin_data.get('coin_name', 'Unknown Coin')
        summary = coin_data.get('summary', 'Limited data available')
        
        return f"""
# {coin_name} Research Report

## Summary
{summary}

## Research Data Overview
This report is based on comprehensive research including:
- Market data from DEX Screener
- Coin information from CoinGecko  
- Recent news and developments
- Social media sentiment analysis
- Web-based analytical insights

## Data Sources
The analysis combines multiple data sources to provide a holistic view of {coin_name}'s current market position and potential outlook.

*Note: This is a research-based report using available market data and should not be considered as financial advice.*
"""
    
    def create_twitter_thread(self, coin_data: Dict) -> List[str]:
        """Create a Twitter thread summarizing the research"""
        insights = self._extract_key_insights(coin_data)
        coin_name = coin_data.get('coin_name', 'Unknown Coin')
        
        # Create tweet-sized summaries
        tweets = [
            f"🧵 Thread: {coin_name} Research Summary\n\nHere's what the data tells us about this cryptocurrency:\n\n1/",
        ]
        
        # Add insights as individual tweets
        for i, insight in enumerate(insights, 2):
            tweets.append(f"{i}/{len(insights) + 1} {insight}")
        
        # Add final tweet
        tweets.append(f"{len(insights) + 2}/{len(insights) + 2} 📊 Full research report available with comprehensive analysis of market data, news, and social sentiment. DYOR! 🚀")
        
        return tweets
    
    def create_newsletter_summary(self, coin_data: Dict) -> Dict:
        """Create a newsletter-style summary"""
        blog_post = self.create_blog_post(coin_data, style="news")
        
        newsletter = {
            "subject": f"{coin_data.get('coin_name', 'Crypto')} Market Update - Research Report",
            "preview_text": f"Latest analysis and insights on {coin_data.get('coin_name', 'this cryptocurrency')}",
            "content": blog_post.get('content', 'Content generation failed'),
            "key_points": self._extract_key_insights(coin_data),
            "timestamp": blog_post.get('timestamp', datetime.now().isoformat())
        }
        
        return newsletter

# Test function
if __name__ == "__main__":
    # Test with sample data
    test_data = {
        "coin_name": "PEPE",
        "summary": "💰 Price: $0.000004055 (-11.97% 24h) | Volume: $2350358.54 | 📊 Pepe | Market Cap Rank: #66 | 📰 5 news items | 👥 5 social mentions | 🌐 5 web sources",
        "dex_screener": {
            "best_pair": {
                "price_usd": "0.000004055",
                "price_change_24h": "-11.97",
                "volume_24h": "2350358.54",
                "liquidity_usd": "29850652.58",
                "chain": "ethereum",
                "dex": "uniswap"
            }
        },
        "coingecko": {
            "coin_data": {
                "name": "Pepe",
                "symbol": "PEPE",
                "market_cap_rank": 66
            }
        },
        "news": [
            {"title": "PEPE Price Prediction", "snippet": "Latest market analysis"},
            {"title": "Pepe Market Update", "snippet": "Recent developments"}
        ],
        "social_media": [
            {"title": "Twitter Discussion", "snippet": "Community sentiment"}
        ],
        "web_analysis": [
            {"title": "Technical Analysis", "snippet": "Price prediction"}
        ]
    }
    
    try:
        generator = AIBlogGenerator()
        blog_post = generator.create_blog_post(test_data, "analytical")
        print("📝 Generated Blog Post:")
        print(f"Title: {blog_post.get('title', 'No title')}")
        if 'error' in blog_post:
            print(f"❌ Error: {blog_post['error']}")
        else:
            print(f"Word Count: {blog_post.get('word_count', 0)}")
            print(f"Sections: {len(blog_post.get('sections', []))}")
            print(f"Key Insights: {blog_post.get('key_insights', [])}")
            print("\n" + "="*50 + "\n")
            print(blog_post.get('content', 'No content')[:500] + "...")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")