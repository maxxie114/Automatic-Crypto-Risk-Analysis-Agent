import requests
import json
import ssl
import certifi
from typing import Dict, List, Optional
from datetime import datetime
import asyncio
import aiohttp
from ddgs import DDGS
from ai_blog_generator import AIBlogGenerator

class MemeCoinAgent:
    def __init__(self, enable_ai=True):
        self.dex_screener_base = "https://api.dexscreener.com/latest/dex"
        self.coingecko_base = "https://api.coingecko.com/api/v3"
        
        
        # Initialize AI blog generator only if AI is enabled
        if enable_ai:
            try:
                self.blog_generator = AIBlogGenerator()  # Initialize AI blog generator
            except ValueError as e:
                if "Google Gemini API key" in str(e):
                    print("⚠️  Google Gemini API key not found. AI features will be disabled.")
                    self.blog_generator = None
                else:
                    raise
        else:
            self.blog_generator = None
        
    async def search_dex_screener(self, query: str) -> Dict:
        """Search DEX Screener for token information"""
        try:
            url = f"{self.dex_screener_base}/search?q={query}"
            ssl_context = ssl.create_default_context(cafile=certifi.where())
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, ssl=ssl_context) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_dex_data(data)
                    else:
                        return {"error": f"DEX Screener API error: {response.status}"}
        except Exception as e:
            return {"error": f"DEX Screener search failed: {str(e)}"}
    
    async def search_coingecko(self, query: str) -> Dict:
        """Search CoinGecko for token information"""
        try:
            url = f"{self.coingecko_base}/search?query={query}"
            ssl_context = ssl.create_default_context(cafile=certifi.where())
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, ssl=ssl_context) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_coingecko_data(data)
                    else:
                        return {"error": f"CoinGecko API error: {response.status}"}
        except Exception as e:
            return {"error": f"CoinGecko search failed: {str(e)}"}
    
    async def search_web_news(self, coin_name: str) -> List[Dict]:
        try:
            with DDGS() as ddgs:
                results: List[Dict] = []
                search_query = f"{coin_name} meme coin crypto news"
                for item in ddgs.text(search_query, max_results=5):
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("href", ""),
                        "snippet": item.get("body", "")[:200]
                    })
                return results
        except Exception as e:
            return [{"error": f"Web search failed: {str(e)}"}]
    
    async def search_social_media(self, coin_name: str, platform: str = "all") -> List[Dict]:
        try:
            queries = [
                f"site:reddit.com {coin_name} crypto",
                f"site:twitter.com {coin_name}",
                f"site:x.com {coin_name}",
                f"site:t.me {coin_name}",
                f"site:discord.com {coin_name} crypto",
                f"site:medium.com {coin_name} token"
            ]
            results: List[Dict] = []
            seen_links = set()
            with DDGS() as ddgs:
                for q in queries:
                    for item in ddgs.text(q, max_results=3, timelimit='w'):
                        link = item.get("href", "")
                        if link and link not in seen_links:
                            seen_links.add(link)
                            results.append({
                                "title": item.get("title", ""),
                                "link": link,
                                "snippet": item.get("body", "")[:200],
                                "source_query": q
                            })
            return results
        except Exception as e:
            return [{"error": f"Social search failed: {str(e)}"}]
    
    async def search_general_web(self, query: str, max_results: int = 5) -> List[Dict]:
        try:
            with DDGS() as ddgs:
                results: List[Dict] = []
                for item in ddgs.text(query, max_results=max_results):
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("href", ""),
                        "snippet": item.get("body", "")[:200]
                    })
                return results
        except Exception as e:
            return [{"error": f"Web search failed: {str(e)}"}]
    
    def _parse_dex_data(self, data: Dict) -> Dict:
        """Parse DEX Screener response"""
        if not data or "pairs" not in data:
            return {"error": "No data found"}
        
        pairs = data.get("pairs", [])
        if not pairs:
            return {"error": "No trading pairs found"}
        
        # Get the most liquid pair
        best_pair = max(pairs, key=lambda x: float(x.get("liquidity", {}).get("usd", 0)))
        
        return {
            "source": "DEX Screener",
            "pairs_found": len(pairs),
            "best_pair": {
                "pair_address": best_pair.get("pairAddress"),
                "base_token": best_pair.get("baseToken", {}),
                "quote_token": best_pair.get("quoteToken", {}),
                "price_usd": best_pair.get("priceUsd"),
                "volume_24h": best_pair.get("volume", {}).get("h24"),
                "liquidity_usd": best_pair.get("liquidity", {}).get("usd"),
                "price_change_24h": best_pair.get("priceChange", {}).get("h24"),
                "dex": best_pair.get("dexId"),
                "chain": best_pair.get("chainId")
            }
        }
    
    def _parse_coingecko_data(self, data: Dict) -> Dict:
        """Parse CoinGecko response"""
        if not data or "coins" not in data:
            return {"error": "No data found"}
        
        coins = data.get("coins", [])
        if not coins:
            return {"error": "No coins found"}
        
        # Get the first/best match
        coin = coins[0]
        
        return {
            "source": "CoinGecko",
            "coin_data": {
                "id": coin.get("id"),
                "name": coin.get("name"),
                "symbol": coin.get("symbol"),
                "market_cap_rank": coin.get("market_cap_rank"),
                "thumb": coin.get("thumb"),
                "large": coin.get("large")
            }
        }
    
    async def generate_ai_blog_post(self, coin_data: Dict, blog_style: str = "analytical") -> Dict:
        """Generate AI-powered blog post from research data"""
        if not self.blog_generator:
            return {
                "error": "AI blog generation is disabled. Set GOOGLE_API_KEY environment variable to enable.",
                "title": f"{coin_data.get('coin_name', 'Unknown')} Analysis",
                "content": "AI blog generation is currently unavailable. Please check the raw research data.",
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            blog_post = self.blog_generator.create_blog_post(coin_data, blog_style)
            return blog_post
        except Exception as e:
            return {
                "error": f"AI blog generation failed: {str(e)}",
                "title": f"{coin_data.get('coin_name', 'Unknown')} Analysis",
                "content": "AI blog generation is currently unavailable. Please check the raw research data.",
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_detailed_analysis(self, coin_name: str) -> Dict:
        """Get comprehensive analysis of a meme coin"""
        print(f"🔍 Researching {coin_name}...")
        
        # Run searches in parallel
        dex_task = self.search_dex_screener(coin_name)
        coingecko_task = self.search_coingecko(coin_name)
        news_task = self.search_web_news(coin_name)
        social_task = self.search_social_media(coin_name, "all")
        web_task = self.search_general_web(f"{coin_name} cryptocurrency analysis")
        
        # Wait for all searches to complete
        dex_result, coingecko_result, news_results, social_results, general_web_results = await asyncio.gather(
            dex_task, coingecko_task, news_task, social_task, web_task
        )
        
        # Compile results
        analysis = {
            "coin_name": coin_name,
            "timestamp": datetime.now().isoformat(),
            "dex_screener": dex_result,
            "coingecko": coingecko_result,
            "news": news_results[:3],  # Top 3 news items
            "social_media": social_results[:3],  # Top 3 social mentions
            "web_analysis": general_web_results[:3],  # Top 3 web analysis results
            "summary": self._generate_enhanced_summary(dex_result, coingecko_result, news_results, social_results, general_web_results)
        }
        
        # Generate AI blog post
        print(f"🤖 Generating AI blog post for {coin_name}...")
        blog_post = await self.generate_ai_blog_post(analysis, "analytical")
        analysis["ai_blog"] = blog_post
        
        return analysis
    
    def _generate_summary(self, dex_data: Dict, coingecko_data: Dict, news: List[Dict]) -> str:
        """Generate a brief summary of the findings"""
        summary_parts = []
        
        if "best_pair" in dex_data:
            pair = dex_data["best_pair"]
            price = pair.get("price_usd", "N/A")
            change = pair.get("price_change_24h", "N/A")
            volume = pair.get("volume_24h", "N/A")
            
            summary_parts.append(f"💰 Price: ${price} ({change}% 24h) | Volume: ${volume}")
        
        if "coin_data" in coingecko_data:
            coin = coingecko_data["coin_data"]
            name = coin.get("name", "")
            rank = coin.get("market_cap_rank", "N/A")
            
            summary_parts.append(f"📊 {name} | Market Cap Rank: #{rank}")
        
        if news and len(news) > 0 and "error" not in news[0]:
            recent_news = len([n for n in news if "error" not in n])
            summary_parts.append(f"📰 Found {recent_news} recent news items")
        
        return " | ".join(summary_parts) if summary_parts else "Limited data available"
    
    def _generate_enhanced_summary(self, dex_data: Dict, coingecko_data: Dict, news: List[Dict], social: List[Dict], web_analysis: List[Dict]) -> str:
        """Generate enhanced summary with MCP search results"""
        summary_parts = []
        
        # Market data
        if "best_pair" in dex_data:
            pair = dex_data["best_pair"]
            price = pair.get("price_usd", "N/A")
            change = pair.get("price_change_24h", "N/A")
            volume = pair.get("volume_24h", "N/A")
            
            summary_parts.append(f"💰 Price: ${price} ({change}% 24h) | Volume: ${volume}")
        
        # CoinGecko data
        if "coin_data" in coingecko_data:
            coin = coingecko_data["coin_data"]
            name = coin.get("name", "")
            rank = coin.get("market_cap_rank", "N/A")
            
            summary_parts.append(f"📊 {name} | Market Cap Rank: #{rank}")
        
        # News count
        if news and len(news) > 0 and "error" not in news[0]:
            recent_news = len([n for n in news if "error" not in n])
            summary_parts.append(f"📰 {recent_news} news items")
        
        # Social media count
        if social and len(social) > 0 and "error" not in social[0]:
            social_mentions = len([s for s in social if "error" not in s])
            summary_parts.append(f"👥 {social_mentions} social mentions")
        
        # Web analysis count
        if web_analysis and len(web_analysis) > 0 and "error" not in web_analysis[0]:
            web_results = len([w for w in web_analysis if "error" not in w])
            summary_parts.append(f"🌐 {web_results} web sources")
        
        return " | ".join(summary_parts) if summary_parts else "Limited data available"
