# Crypto Risk Analysis Agent

An AI-powered intelligent agent system that automatically analyzes Solana token holder distributions and provides real-time risk assessments to protect investors from rugpulls, scams, and high-risk tokens.

[![Demo Video](https://img.youtube.com/vi/YlX7B-8asQY/maxresdefault.jpg)](https://www.youtube.com/watch?v=YlX7B-8asQY)

**🎥 [Watch Demo Video](https://www.youtube.com/watch?v=YlX7B-8asQY)**

## 🎯 Inspiration

The cryptocurrency space has seen explosive growth, but with it comes significant risk. Countless investors lose money to rugpulls, scam tokens, and highly concentrated holdings where a few wallets control the majority of supply. We witnessed friends and community members fall victim to these schemes, losing hard-earned money to projects with suspicious holder distributions that could have been detected with proper analysis.

**The problem:** Manual analysis of token holder distributions is time-consuming, requires blockchain expertise, and is nearly impossible to do at scale. By the time most investors discover warning signs, it's too late.

**Our vision:** Create an autonomous AI agent that continuously monitors token holder concentrations, analyzes wallet behaviors, and provides instant, actionable risk assessments—protecting investors before they get scammed.

## 💡 What it does

**Crypto Risk Analysis Agent** is a comprehensive risk intelligence platform that combines AI reasoning with blockchain data analysis to evaluate Solana tokens:

### Core Features:

1. **Autonomous Token Analysis**
   - Fetches top holder distributions for any SPL token
   - Calculates concentration metrics (top 3, 5, 10 holders)
   - Identifies exchange wallets, liquidity pools, and suspicious addresses
   - Generates risk scores based on holder patterns

2. **AI-Powered Risk Assessment**
   - Uses Claude Opus 4 to provide human-like reasoning about risk factors
   - Analyzes holder concentration, liquidity presence, and manipulation risks
   - Delivers clear investment recommendations with actionable insights
   - Explains complex blockchain data in plain English

3. **Multi-Source Wallet Intelligence**
   - **Helius API**: Analyzes token holder accounts and ownership data
   - **Moralis API**: Deep-dives into individual wallet portfolios, NFT holdings, and activity patterns
   - Detects burner wallets, developer wallets, and established traders
   - Identifies red flags like single-token holders or minimal activity

4. **Real-Time Dashboard**
   - Live monitoring of analyzed tokens and risk levels
   - Agent activity logs showing autonomous decision-making
   - Visual risk indicators (Critical/High/Medium/Low)
   - Historical analysis tracking and trend detection

5. **Model Context Protocol (MCP) Server**
   - Exposes blockchain analysis tools as MCP-compatible APIs
   - Enables AI agents to autonomously query blockchain data
   - Supports integration with Claude Desktop, AI workflows, and custom agents
   - Docker-ready deployment for cloud hosting

### Risk Detection Capabilities:

- ⚠️ **High Concentration Risk**: Top 10 holders control >70% of supply
- 🚨 **Whale Dominance**: Single wallets holding disproportionate amounts
- 🔍 **Suspicious Patterns**: New wallets with single-token holdings
- 💧 **Liquidity Issues**: Lack of exchange/pool addresses in top holders
- 🎭 **Burner Wallets**: Wallets with minimal SOL balance and activity
- ✅ **Positive Signals**: Established wallets, exchange presence, good distribution

## 🛠️ How we built it

### Architecture

**Frontend (Next.js + React + Tailwind CSS)**
- Modern, responsive dashboard with real-time updates
- Server-side rendering for performance
- Elegant UI with Lucide icons and custom components
- Deployed and optimized for production

**Backend (Node.js + Express)**
- RESTful API endpoints for token risk analysis
- Integration with MCP client for tool orchestration
- Real-time data processing and caching
- Error handling and rate limiting

**AI Layer (Anthropic Claude Opus 4)**
- Advanced reasoning about token holder distributions
- Context-aware risk assessment with natural language explanations
- Structured prompts for consistent, professional analysis
- Integration via Anthropic SDK

**MCP Server (Model Context Protocol)**
- Custom-built tools for blockchain data access:
  - `find_account_info`: Analyzes token holder concentration (Helius)
  - `analyze_wallet_risk`: Evaluates individual wallet risk profiles (Moralis)
  - `get_wallet_portfolio`: Fetches complete wallet holdings (Moralis)
  - `search_tokens`: Searches tokens on DexScreener
- Supports HTTP, SSE, and stdio transports
- Dockerized for easy deployment to cloud platforms

**Data Layer (Sanity CMS)**
- Headless CMS for storing risk reports and analysis history
- Real-time data sync with frontend
- Structured schemas for coins, risk assessments, and agent logs
- Content API for querying and filtering

**Blockchain Integration**
- **Helius RPC**: Solana mainnet access for token account queries
- **Moralis API**: Multi-chain wallet and portfolio data
- Rate-limited API calls with retry logic
- Efficient data parsing and transformation

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, ES6 modules
- **AI**: Anthropic Claude Opus 4, Google Gemini, Model Context Protocol (MCP)
- **Blockchain**: Helius API, Moralis API, Solana Web3.js, TRM Labs
- **Database**: Sanity CMS (headless)
- **DevOps**: Docker, DigitalOcean, bash deployment scripts
- **APIs & Tools**: Postman, RESTful architecture, JSON-RPC 2.0

### Integrations

- **Moralis API**: Solana wallet analysis, portfolio tracking, NFT data
- **TRM Labs**: Blockchain intelligence and compliance
- **Sanity CMS**: Headless content management and data storage
- **Postman**: API testing, documentation, and workflow automation
- **Anthropic Claude**: AI-powered risk reasoning and analysis
- **Google Gemini**: Additional AI model for enhanced insights

## 🚧 Challenges we ran into

### 1. **Rate Limiting Nightmares**
Helius API's `getTokenLargestAccounts` method triggered aggressive rate limiting when analyzing tokens with many holders (like BONK). We couldn't simply reduce the number of accounts—the API queries all accounts internally regardless.

**Solution:** Implemented sequential processing with 500ms delays between requests, error detection for rate limit responses, and graceful degradation. Added retry logic and fallback strategies for production reliability.

### 2. **MCP Protocol Learning Curve**
Model Context Protocol was new to all of us. Understanding tool schemas, transport layers (HTTP vs SSE vs stdio), and integration patterns took significant research and experimentation.

**Solution:** Built incrementally—started with simple tools, tested extensively with Postman, then integrated with Claude Desktop. Created comprehensive examples and documentation for future developers.

### 3. **Docker Health Checks Failing**
Initial Dockerfile didn't expose ports or run the server in HTTP mode, causing DigitalOcean to repeatedly kill containers due to failed health checks.

**Solution:** Rewrote Dockerfile to use `--streamable-http` flag by default, added `EXPOSE 3001`, installed curl for health checks, and implemented proper `HEALTHCHECK` directive.

### 4. **AI Reasoning Quality**
Getting Claude to provide consistent, actionable risk assessments (not generic advice) required extensive prompt engineering.

**Solution:** Developed structured prompts with specific sections (Holder Distribution, Red Flags, Liquidity, Market Manipulation, Recommendations). Provided concrete data points and metrics to ground the AI's reasoning in facts.

### 5. **Multi-API Data Aggregation**
Combining data from Helius (token accounts), Moralis (wallet portfolios), and DexScreener (token metadata) with different formats and rate limits was complex.

**Solution:** Created abstraction layers with consistent error handling, implemented parallel fetching where possible, and built robust parsing logic for various response structures.

## 🏆 Accomplishments that we're proud of

✨ **Built a Production-Ready AI Agent System**: Not just a prototype—fully deployed, containerized, and operational with real blockchain data.

🧠 **Advanced AI Reasoning Integration**: Successfully leveraged Claude Opus 4 to provide human-expert-level analysis of complex blockchain data that goes beyond simple metrics.

🔗 **Model Context Protocol Implementation**: One of the early adopters to build a complete MCP server with multiple blockchain analysis tools, complete with documentation and deployment scripts.

🎨 **Beautiful, Intuitive Dashboard**: Created a professional-grade UI that makes complex risk data accessible to non-technical users while providing depth for power users.

🚀 **Real-World Impact**: Analyzed actual tokens like BONK with 93+ trillion supply and 20+ holders, providing actionable insights that could prevent real investment losses.

📊 **Multi-Source Intelligence**: Integrated three major blockchain data providers (Helius, Moralis, DexScreener) into a cohesive analysis pipeline.

🐳 **DevOps Excellence**: Wrote automated deployment scripts, Dockerfiles with proper health checks, and environment variable management for seamless cloud deployment.

## 📚 What we learned

### Technical Skills

- **Model Context Protocol (MCP)**: Deep understanding of tool schemas, transport layers, and AI agent integration patterns
- **Blockchain Data Analysis**: Learned intricacies of SPL token accounts, holder distributions, and on-chain data structures
- **AI Prompt Engineering**: Mastered techniques for getting consistent, high-quality reasoning from LLMs with structured prompts
- **Rate Limit Management**: Strategies for working within API constraints while maintaining functionality
- **Docker Optimization**: Health checks, multi-stage builds, and production-ready containerization

### Product Insights

- **User Education is Key**: Risk analysis is only valuable if users understand it—we need to explain WHY a token is risky, not just assign a score
- **Speed Matters**: Users want instant assessments; we optimized for sub-5-second analysis despite multiple API calls
- **Trust Through Transparency**: Showing raw data, methodology, and AI reasoning builds confidence in our assessments

### AI Agent Development

- **Tool Design Philosophy**: Good MCP tools should be single-purpose, well-documented, and return structured data
- **Context is Everything**: LLMs produce better analysis when given rich context (holder types, concentration metrics, historical patterns)
- **Autonomous Decision Making**: AI agents can make sophisticated investment risk decisions when given proper tools and reasoning frameworks

### Blockchain Ecosystem

- **Data Fragmentation**: No single API provides complete token intelligence—aggregation is essential
- **Solana's Complexity**: SPL token architecture (mint addresses, token accounts, associated accounts) requires careful handling
- **DeFi Patterns**: Learned to identify exchange wallets, liquidity pools, and common holding patterns that indicate legitimacy

## 🚀 What's next for Crypto Risk Analysis Agent

### Short-Term Roadmap (Next 3 Months)

**1. Multi-Chain Expansion**
- Add Ethereum, Base, and Polygon support
- Cross-chain portfolio risk analysis
- Unified risk scoring across networks

**2. Advanced Risk Models**
- Machine learning models trained on historical rugpull data
- Predictive analytics for emerging risks
- Smart contract vulnerability scanning integration

**3. Real-Time Alerts**
- Webhook notifications for high-risk token launches
- Twitter bot for instant community warnings
- Telegram/Discord integration for project alerts

**4. Community Features**
- User-submitted token analyses
- Reputation system for wallet addresses
- Collaborative risk flagging

### Medium-Term Vision (6-12 Months)

**5. Autonomous Agent Swarm**
- Multiple specialized agents (Contract Auditor, Liquidity Hunter, Social Sentiment Analyzer)
- Agent collaboration and consensus-building
- Distributed analysis across token networks

**6. Developer Platform**
- Public API for risk scores
- Embeddable widgets for DEX platforms
- SDK for integrating risk analysis into wallets

**7. Portfolio Protection**
- Automated wallet monitoring
- Pre-transaction risk checks (browser extension)
- Smart wallet integration with auto-reject for high-risk tokens

**8. Advanced Analytics**
- Historical trend analysis and pattern detection
- Comparative analysis across similar tokens
- Risk forecasting and probability models

### Long-Term Goals (12+ Months)

**9. Regulatory Compliance Tools**
- KYC/AML integration for institutional use
- Compliance reporting and audit trails
- Regulatory risk indicators

**10. Insurance Integration**
- Partner with DeFi insurance protocols
- Risk-based premium calculations
- Automated claim filing for rugpulls

**11. Decentralized Intelligence Network**
- On-chain risk oracle for smart contracts
- Token-gated access to premium analysis
- DAO governance for risk methodology

**12. AI Model Marketplace**
- Allow community to train and contribute risk models
- Competing AI agents with performance tracking
- Incentivize high-accuracy predictions

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **GitHub**: https://github.com/maxxie114/Automatic-Crypto-Risk-Analysis-Agent
- **MCP Server**: [Deployment URL]
- **API Documentation**: [Coming Soon]
- **Postman Collection**: https://www.postman.com/spaceflight-geologist-27511879/notebook/xLYmRK3RjV6o/usdt-search-notebook

## 👥 Team

Built with passion during the hackathon by developers committed to making crypto safer for everyone.

---

**⚠️ Disclaimer**: This tool provides risk analysis for informational purposes only. Always do your own research (DYOR) before investing. Not financial advice.
