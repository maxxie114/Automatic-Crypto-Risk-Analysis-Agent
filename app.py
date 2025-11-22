import streamlit as st
import asyncio
from coin_agent import MemeCoinAgent
import json
from dotenv import load_dotenv
import streamlit.components.v1 as components
load_dotenv(override=True)

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

if False and not search_button:
    components.html(
        """
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Coin Analysis — Bright Theme</title>
  <style>
    :root { --bg:#f5f7fa; --panel:#ffffff; --muted:#64748b; --text:#0f172a; --brand:#22c55e; --accent:#2563eb; --card:#ffffff; --chip:#e2e8f0; --border:#cbd5e1; --shadow:0 4px 10px rgba(0,0,0,0.1); --radius:10px; }
    * { box-sizing:border-box; } html,body { height:100%; margin:0; }
    body { padding:24px; background:linear-gradient(180deg,#f8fafc,#e2e8f0); color:var(--text); font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,\"Helvetica Neue\",Arial; }
    h1,h2,h3 { margin:0 0 .5rem; line-height:1.2; } a { color:var(--accent); text-decoration:none; } a:hover { text-decoration:underline; }
    .container { max-width:1100px; margin:0 auto; }
    .search-bar { display:flex; gap:10px; align-items:center; padding-bottom:16px; margin-bottom:20px; }
    .search-bar .field { flex:1; position:relative; }
    .search-bar input[type=\"text\"] { width:100%; height:2.75rem; padding:0 14px 0 40px; border-radius:999px; border:1px solid var(--border); background:#fff; color:var(--text); font-size:16px; box-shadow:inset 0 1px 2px rgba(0,0,0,0.05); }
    .search-bar .icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:.6; }
    .search-bar button { height:2.55rem; padding:0 18px; font-weight:600; border-radius:999px; border:none; background:linear-gradient(180deg,#38bdf8,#2563eb); color:#fff; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.3); }
    .search-bar button:hover { filter:brightness(1.1); }
    .summary { background:var(--card); border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow); padding:18px; }
    .summary .row { display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; }
    .chip { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; background:var(--chip); border:1px solid var(--border); font-size:.92rem; color:var(--text); }
    .grid { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; margin-top:16px; }
    .card { grid-column:span 12; background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:16px; box-shadow:var(--shadow); }
    .muted { color:var(--muted); }
    @media (min-width:900px) { .card.span-4 { grid-column:span 4; } .card.span-6 { grid-column:span 6; } .card.span-8 { grid-column:span 8; } }
    .list { display:grid; gap:10px; margin:8px 0 0; } .list-item { padding:12px; border-radius:8px; background:#f8fafc; border:1px solid var(--border); } .list-item h4 { margin:0 0 .25rem; font-size:1rem; }
    .kv { display:grid; grid-template-columns:140px 1fr; gap:8px; margin-top:10px; } .kv div { padding:6px 10px; border-radius:8px; background:#f1f5f9; border:1px solid var(--border); }
  </style>
  </head>
  <body>
    <div class=\"container\">
      <div class=\"search-bar\">
        <div class=\"field\"><span class=\"icon\">🔎</span><input type=\"text\" placeholder=\"Enter coin name (e.g., PEPE)\" aria-label=\"Coin name\" /></div>
        <button type=\"button\">Analyse</button>
      </div>
      <section class=\"summary\"> <h2>Summary</h2>
        <div class=\"row\">
          <span class=\"chip\">💰 Price: $0.000004147</span>
          <span class=\"chip\">24h: -8.08%</span>
          <span class=\"chip\">Volume: $2,554,619.12</span>
          <span class=\"chip\">📊 Pepe</span>
          <span class=\"chip\">Rank: #66</span>
          <span class=\"chip\">📰 5 news items</span>
          <span class=\"chip\">👥 16 social mentions</span>
          <span class=\"chip\">🌐 5 web sources</span>
        </div>
      </section>
      <div class=\"grid\">
        <section class=\"card span-6\"><h3>💰 Market Data</h3>
          <div class=\"kv\"><div>Price USD</div><div>$0.000004147</div><div>24h Change</div><div>-8.08%</div><div>24h Volume</div><div>$2,554,619.12</div></div>
        </section>
        <section class=\"card span-6\"><h3>🔍 Trading Details</h3>
          <div class=\"kv\"><div>Blockchain</div><div>ethereum</div><div>DEX</div><div>uniswap</div><div>Liquidity</div><div>$30,326,942.81</div><div>Pairs Found</div><div>30</div></div>
        </section>
        <section class=\"card span-12\"><h3>📰 News</h3>
          <div class=\"list\">
            <article class=\"list-item\"><h4>Pepe (footballer, born 1983) — Wikipedia</h4><p class=\"muted\">Born and raised in Brazil, Pepe moved to Portugal to sign with Marítimo... (example content)</p></article>
            <article class=\"list-item\"><h4>PEPE Price Prediction: Is Pepe Headed for a Deeper Crash?</h4><p class=\"muted\">3 days ago — Pepe’s price outlook has taken a sharp hit... (example content)</p></article>
            <article class=\"list-item\"><h4>Pepe Is Back and the Revival Is Already Everywhere — MSN</h4><p class=\"muted\">3 days ago — This video marks the unexpected return of Pepe... (example content)</p></article>
          </div>
        </section>
        <section class=\"card span-4\"><h3>👥 Social Media</h3>
          <div class=\"list\"><div class=\"list-item\">💬 PEPE site homepage has a frog... <span class=\"muted\">(source unknown)</span></div><div class=\"list-item\">💬 The PEPE airdrop just went live! <span class=\"muted\">(source unknown)</span></div><div class=\"list-item\">💬 reddit.com/domain/crypto-news-flash.com/top</div></div>
        </section>
        <section class=\"card span-12\"><h3>🌐 Web Analysis</h3><p class=\"muted\">Summaries of 5 web sources would appear here.</p></section>
        <section class=\"card span-12\"><h3>📝 AI Blog</h3><p class=\"muted\">Auto-generated blog section placeholder.</p></section>
      </div>
    </div>
  </body>
</html>
""",
        height=1400,
        scrolling=True,
    )

if search_button and coin_name:
    with st.spinner(f"🔍 Researching {coin_name}..."):
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            analysis = loop.run_until_complete(agent.get_detailed_analysis(coin_name))
            st.success(f"✅ Analysis complete for {coin_name}!")
            st.markdown("### 📊 Summary")
            st.markdown(f"<div class='success-message'>{analysis['summary']}</div>", unsafe_allow_html=True)
            tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(["💰 Market Data", "📈 DEX Screener", "🎯 CoinGecko", "📰 News", "👥 Social Media", "🌐 Web Analysis", "📝 AI Blog"])
            with tab1:
                st.markdown("### 💰 Market Overview")
                if "best_pair" in analysis["dex_screener"]:
                    pair = analysis["dex_screener"]["best_pair"]
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        price = pair.get("price_usd", "N/A")
                        st.metric("💰 Price USD", f"${price}" if price != "N/A" else "N/A")
                    with col2:
                        change = pair.get("price_change_24h", "N/A")
                        if change != "N/A":
                            try:
                                change_val = float(change)
                            except Exception:
                                change_val = 0.0
                            st.metric("📈 24h Change", f"{change}%", delta=f"{change}%", delta_color="normal" if change_val >= 0 else "inverse")
                        else:
                            st.metric("📈 24h Change", "N/A")
                    with col3:
                        volume = pair.get("volume_24h", "N/A")
                        st.metric("📊 24h Volume", f"${volume}" if volume != "N/A" else "N/A")
                    st.markdown("#### 🔍 Trading Details")
                    details_col1, details_col2 = st.columns(2)
                    with details_col1:
                        st.write(f"**Blockchain:** {pair.get('chain', pair.get('chainId', 'N/A'))}")
                        st.write(f"**DEX:** {pair.get('dex', pair.get('dexId', 'N/A'))}")
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