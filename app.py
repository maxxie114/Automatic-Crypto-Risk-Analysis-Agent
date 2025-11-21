import streamlit as st
import asyncio
from coin_agent import MemeCoinAgent
import json

# Page configuration
st.set_page_config(
    page_title="🚀 Meme Coin Research Agent",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for better styling
st.markdown("""
<style>
.main {
    padding-top: 2rem;
}
.stButton>button {
    background-color: #1f77b4;
    color: white;
    border: none;
    padding: 0.5rem 2rem;
    border-radius: 0.5rem;
    font-weight: bold;
    transition: all 0.3s ease;
}
.stButton>button:hover {
    background-color: #45a049;
    transform: translateY(-2px);
}
.coin-card {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
    border-left: 4px solid #1f77b4;
}
.news-item {
    background-color: #ffffff;
    padding: 0.8rem;
    border-radius: 0.3rem;
    margin: 0.3rem 0;
    border: 1px solid #e0e0e0;
}
.error-message {
    background-color: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #c62828;
}
.success-message {
    background-color: #e8f5e8;
    color: #2e7d32;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #2e7d32;
}
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("# 🚀 Meme Coin Research Agent")
st.markdown("*Get comprehensive analysis of meme coins using free APIs*")
st.markdown("---")

# Initialize agent
@st.cache_resource
def get_agent():
    return MemeCoinAgent()

agent = get_agent()

# Search interface
col1, col2 = st.columns([3, 1])
with col1:
    coin_name = st.text_input(
        "Enter Meme Coin Name or Symbol:",
        placeholder="e.g., PEPE, DOGE, SHIB, WIF",
        help="Enter the name or symbol of the meme coin you want to research"
    )

with col2:
    st.write("")  # Spacing
    search_button = st.button("🔍 Research", type="primary")

if search_button and coin_name:
    with st.spinner(f"🔍 Researching {coin_name}..."):
        try:
            # Run the analysis
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            analysis = loop.run_until_complete(agent.get_detailed_analysis(coin_name))
            
            # Display summary
            st.success(f"✅ Analysis complete for {coin_name}!")
            
            # Summary card
            st.markdown("### 📊 Summary")
            st.markdown(f"<div class='success-message'>{analysis['summary']}</div>", unsafe_allow_html=True)
            
            # Create tabs for different sections
            tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(["💰 Market Data", "📈 DEX Screener", "🎯 CoinGecko", "📰 News", "👥 Social Media", "🌐 Web Analysis", "📝 AI Blog"])
            
            with tab1:
                st.markdown("### 💰 Market Overview")
                
                # Price and volume data
                if "best_pair" in analysis["dex_screener"]:
                    pair = analysis["dex_screener"]["best_pair"]
                    
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        price = pair.get("price_usd", "N/A")
                        st.metric("💰 Price USD", f"${price}" if price != "N/A" else "N/A")
                    
                    with col2:
                        change = pair.get("price_change_24h", "N/A")
                        if change != "N/A":
                            change_val = float(change) if change != "N/A" else 0
                            st.metric("📈 24h Change", f"{change}%", 
                                     delta=f"{change}%", 
                                     delta_color="normal" if change_val >= 0 else "inverse")
                        else:
                            st.metric("📈 24h Change", "N/A")
                    
                    with col3:
                        volume = pair.get("volume_24h", "N/A")
                        st.metric("📊 24h Volume", f"${volume}" if volume != "N/A" else "N/A")
                    
                    # Additional details
                    st.markdown("#### 🔍 Trading Details")
                    details_col1, details_col2 = st.columns(2)
                    
                    with details_col1:
                        st.write(f"**Blockchain:** {pair.get('chain', 'N/A')}")
                        st.write(f"**DEX:** {pair.get('dex', 'N/A')}")
                    
                    with details_col2:
                        liquidity = pair.get("liquidity_usd", "N/A")
                        st.write(f"**Liquidity:** ${liquidity}" if liquidity != "N/A" else "**Liquidity:** N/A")
                        st.write(f"**Pairs Found:** {analysis['dex_screener'].get('pairs_found', 0)}")
            
            with tab2:
                st.markdown("### 📈 DEX Screener Data")
                
                if "error" in analysis["dex_screener"]:
                    st.error(f"DEX Screener Error: {analysis['dex_screener']['error']}")
                else:
                    # Display raw data in expandable section
                    with st.expander("📋 View Raw DEX Screener Data"):
                        st.json(analysis["dex_screener"])
                    
                    # Token information
                    if "best_pair" in analysis["dex_screener"]:
                        pair = analysis["dex_screener"]["best_pair"]
                        base_token = pair.get("base_token", {})
                        
                        if base_token:
                            st.markdown("#### 🪙 Token Information")
                            st.write(f"**Name:** {base_token.get('name', 'N/A')}")
                            st.write(f"**Symbol:** {base_token.get('symbol', 'N/A')}")
                            st.write(f"**Address:** {base_token.get('address', 'N/A')}")
            
            with tab3:
                st.markdown("### 🎯 CoinGecko Data")
                
                if "error" in analysis["coingecko"]:
                    st.error(f"CoinGecko Error: {analysis['coingecko']['error']}")
                else:
                    # Display raw data in expandable section
                    with st.expander("📋 View Raw CoinGecko Data"):
                        st.json(analysis["coingecko"])
                    
                    # Coin information
                    if "coin_data" in analysis["coingecko"]:
                        coin = analysis["coingecko"]["coin_data"]
                        
                        st.markdown("#### 🪙 Coin Information")
                        st.write(f"**Name:** {coin.get('name', 'N/A')}")
                        st.write(f"**Symbol:** {coin.get('symbol', 'N/A')}")
                        st.write(f"**Market Cap Rank:** #{coin.get('market_cap_rank', 'N/A')}")
                        
                        if coin.get('thumb'):
                            st.image(coin['thumb'], width=50)
            
            with tab4:
                st.markdown("### 📰 Recent News")
                
                news_items = analysis["news"]
                if news_items and "error" not in news_items[0]:
                    for i, news in enumerate(news_items):
                        if "error" not in news:
                            st.markdown(f"#### 📄 {news.get('title', 'No Title')}")
                            st.write(news.get('snippet', 'No snippet available'))
                            if news.get('link'):
                                st.link_button("🔗 Read More", news['link'])
                            st.markdown("---")
                else:
                    st.warning("No recent news found for this coin.")
            
            with tab5:
                st.markdown("### 👥 Social Media Mentions")
                
                social_items = analysis.get("social_media", [])
                if social_items and "error" not in social_items[0]:
                    for i, social in enumerate(social_items):
                        if "error" not in social:
                            st.markdown(f"#### 💬 {social.get('title', 'No Title')}")
                            st.write(social.get('snippet', 'No snippet available'))
                            if social.get('link'):
                                st.link_button("🔗 View Source", social['link'])
                            st.caption(f"Source: {social.get('source', 'Unknown')}")
                            st.markdown("---")
                else:
                    st.warning("No social media mentions found for this coin.")
            
            with tab6:
                st.markdown("### 🌐 Web Analysis")
                
                web_items = analysis.get("web_analysis", [])
                if web_items and "error" not in web_items[0]:
                    for i, web in enumerate(web_items):
                        if "error" not in web:
                            st.markdown(f"#### 🌐 {web.get('title', 'No Title')}")
                            st.write(web.get('snippet', 'No snippet available'))
                            if web.get('link'):
                                st.link_button("🔗 Visit Site", web['link'])
                            st.caption(f"Source: {web.get('source', 'Unknown')}")
                            st.markdown("---")
                else:
                    st.warning("No web analysis results found for this coin.")
            
            with tab7:
                st.markdown("### 🤖 AI-Generated Blog Post")
                
                if "ai_blog" in analysis:
                    blog_data = analysis["ai_blog"]
                    
                    if "error" in blog_data:
                        st.error(f"AI Blog Generation Error: {blog_data['error']}")
                        st.info("Please check the raw research data in other tabs.")
                    else:
                        # Blog metadata
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("📝 Word Count", blog_data.get('word_count', 0))
                        with col2:
                            st.metric("📊 Style", blog_data.get('style', 'analytical').title())
                        with col3:
                            st.metric("🔗 Sections", len(blog_data.get('sections', [])))
                        
                        # Key insights
                        if blog_data.get('key_insights'):
                            st.markdown("#### 💡 Key Insights")
                            for insight in blog_data['key_insights']:
                                st.success(f"• {insight}")
                        
                        # Blog content
                        st.markdown("#### 📖 Blog Content")
                        st.markdown(blog_data.get('content', 'Content not available'))
                        
                        # Blog sections breakdown
                        if blog_data.get('sections'):
                            with st.expander("📋 View Blog Sections"):
                                for i, section in enumerate(blog_data['sections'], 1):
                                    st.markdown(f"**{i}. {section['title']}**")
                                    st.text(section['content'][:200] + "..." if len(section['content']) > 200 else section['content'])
                                    st.markdown("---")
                        
                        # Download blog as markdown
                        blog_content = f"# {blog_data['title']}\n\n{blog_data['content']}"
                        st.download_button(
                            label="📥 Download Blog Post (Markdown)",
                            data=blog_content,
                            file_name=f"{coin_name}_blog_post_{analysis['timestamp'][:10]}.md",
                            mime="text/markdown"
                        )
                        
                        # Additional AI content options
                        with st.expander("🚀 Generate Additional Content"):
                            if st.button("🐦 Create Twitter Thread"):
                                try:
                                    twitter_thread = agent.blog_generator.create_twitter_thread(analysis)
                                    st.markdown("#### 🐦 Twitter Thread")
                                    for i, tweet in enumerate(twitter_thread, 1):
                                        st.text_area(f"Tweet {i}", tweet, height=100, key=f"tweet_{i}")
                                except Exception as e:
                                    st.error(f"Twitter thread generation failed: {str(e)}")
                            
                            if st.button("📧 Create Newsletter Summary"):
                                try:
                                    newsletter = agent.blog_generator.create_newsletter_summary(analysis)
                                    st.markdown("#### 📧 Newsletter Summary")
                                    st.write(f"**Subject:** {newsletter['subject']}")
                                    st.write(f"**Preview:** {newsletter['preview_text']}")
                                    st.markdown("**Key Points:**")
                                    for point in newsletter['key_points']:
                                        st.success(f"• {point}")
                                except Exception as e:
                                    st.error(f"Newsletter generation failed: {str(e)}")
                else:
                    st.warning("AI blog post not available. Please ensure Gemini API is configured.")
            
            # Raw JSON download
            st.markdown("---")
            st.markdown("### 💾 Download Data")
            json_data = json.dumps(analysis, indent=2)
            st.download_button(
                label="📥 Download Full Analysis (JSON)",
                data=json_data,
                file_name=f"{coin_name}_analysis_{analysis['timestamp'][:10]}.json",
                mime="application/json"
            )
            
        except Exception as e:
            st.error(f"❌ Analysis failed: {str(e)}")
            st.info("Please try again with a different coin name or symbol.")

elif search_button and not coin_name:
    st.warning("⚠️ Please enter a coin name or symbol to research.")

# Sidebar with examples
with st.sidebar:
    st.markdown("### 🎯 Example Coins to Try")
    examples = ["PEPE", "DOGE", "SHIB", "WIF", "BONK", "FLOKI", "MEME"]
    
    for example in examples:
        if st.button(f"🔍 {example}"):
            st.session_state.coin_input = example
            # This won't automatically search, but shows the user what to type
            st.info(f"Type '{example}' in the main input and click Research!")
    
    st.markdown("---")
    st.markdown("### ℹ️ About")
    st.markdown("""
    This agent uses free APIs to research meme coins:
    - **DEX Screener**: Trading data and prices
    - **CoinGecko**: Coin information and rankings
    - **DuckDuckGo**: Recent news and developments
    
    **Note**: Data accuracy depends on API availability and coin popularity.
    """)

# Footer
st.markdown("---")
st.markdown("<div style='text-align: center; color: #666;'>Built with Streamlit | Data from free APIs</div>", unsafe_allow_html=True)