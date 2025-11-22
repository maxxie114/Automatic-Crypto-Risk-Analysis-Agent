const axios = require('axios');

class MoralisAnalyzer {
  constructor() {
    this.apiKey = process.env.MORALIS_API_KEY;
    this.baseUrl = 'https://solana-gateway.moralis.io';
    
    if (!this.apiKey) {
      console.warn('Warning: MORALIS_API_KEY not set in environment variables');
    }
  }

  /**
   * Get top token holders using Moralis API
   * Note: Moralis doesn't have a direct "top holders" endpoint for Solana
   * We'll use the wallet analyzer as fallback and enhance with Moralis data
   * @param {string} tokenAddress - SPL token mint address
   * @param {number} limit - Number of holders to fetch
   * @returns {Promise<Object>} Top holders data
   */
  async getTopHolders(tokenAddress, limit = 20) {
    try {
      console.log(`Fetching top ${limit} holders for token: ${tokenAddress}`);
      
      // Moralis Solana API doesn't have a direct holders endpoint
      // We need to use the existing walletAnalyzer to get holders
      const walletAnalyzer = require('./walletAnalyzer');
      const holdersData = await walletAnalyzer.getTokenHolders(tokenAddress, limit);
      
      if (!holdersData || !holdersData.holders) {
        throw new Error('No holders data available');
      }
      
      return holdersData.holders;
    } catch (error) {
      console.error('Error fetching top holders:', error.message);
      throw error;
    }
  }

  /**
   * Get wallet portfolio (all tokens held by a wallet)
   * @param {string} walletAddress - Solana wallet address
   * @returns {Promise<Object>} Wallet portfolio data
   */
  async getWalletPortfolio(walletAddress) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/account/mainnet/${walletAddress}/portfolio`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error.response?.data || error.message);
      // Return empty portfolio on error
      return { tokens: [], nfts: [], nativeBalance: { solana: '0' } };
    }
  }

  /**
   * Get wallet token balances
   * @param {string} walletAddress - Solana wallet address
   * @returns {Promise<Object>} Token balances
   */
  async getWalletTokens(walletAddress) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/account/mainnet/${walletAddress}/tokens`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching wallet tokens:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get wallet NFTs
   * @param {string} walletAddress - Solana wallet address
   * @returns {Promise<Object>} NFT holdings
   */
  async getWalletNFTs(walletAddress) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/account/mainnet/${walletAddress}/nft`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching wallet NFTs:', error.response?.data || error.message);
      return { nfts: [] };
    }
  }

  /**
   * Get SOL balance for a wallet
   * @param {string} walletAddress - Solana wallet address
   * @returns {Promise<Object>} SOL balance
   */
  async getWalletBalance(walletAddress) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/account/mainnet/${walletAddress}/balance`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error.response?.data || error.message);
      return { solana: '0' };
    }
  }

  /**
   * Analyze a single wallet for risk indicators
   * @param {string} walletAddress - Wallet address to analyze
   * @param {string} tokenAddress - Token address for context
   * @returns {Promise<Object>} Risk analysis
   */
  async analyzeWalletRisk(walletAddress, tokenAddress) {
    try {
      console.log(`Analyzing wallet: ${walletAddress}`);
      
      // Fetch wallet data in parallel (with fallbacks)
      const [tokens, nfts, balance] = await Promise.all([
        this.getWalletTokens(walletAddress),
        this.getWalletNFTs(walletAddress),
        this.getWalletBalance(walletAddress)
      ]);

      // Calculate risk indicators
      const tokenCount = Array.isArray(tokens) ? tokens.length : 0;
      const nftCount = nfts?.nfts?.length || 0;
      const solBalance = parseFloat(balance?.solana || 0);
      
      // Risk scoring
      const riskFactors = [];
      let riskScore = 0;

      // New wallet (low activity)
      if (tokenCount < 3 && nftCount === 0) {
        riskFactors.push({
          severity: 'medium',
          category: 'new_wallet',
          message: 'Wallet has minimal activity',
          details: `Only ${tokenCount} tokens, ${nftCount} NFTs`
        });
        riskScore += 30;
      }

      // Low SOL balance (might be a burner wallet)
      if (solBalance < 0.1) {
        riskFactors.push({
          severity: 'low',
          category: 'low_balance',
          message: 'Very low SOL balance',
          details: `${solBalance} SOL - possible burner wallet`
        });
        riskScore += 10;
      }

      // Single token holder (suspicious)
      if (tokenCount === 1) {
        riskFactors.push({
          severity: 'high',
          category: 'single_token',
          message: 'Wallet only holds this token',
          details: 'Possible developer or team wallet'
        });
        riskScore += 40;
      }

      // Established wallet (positive indicator)
      if (tokenCount > 10 && nftCount > 5) {
        riskFactors.push({
          severity: 'info',
          category: 'established',
          message: 'Established wallet with diverse holdings',
          details: `${tokenCount} tokens, ${nftCount} NFTs`
        });
        riskScore -= 20;
      }

      // Determine overall risk level
      let riskLevel = 'low';
      if (riskScore > 60) riskLevel = 'critical';
      else if (riskScore > 40) riskLevel = 'high';
      else if (riskScore > 20) riskLevel = 'medium';

      return {
        walletAddress,
        tokenAddress,
        riskLevel,
        riskScore: Math.max(0, Math.min(100, riskScore)),
        metrics: {
          tokenCount,
          nftCount,
          solBalance,
          hasNFTs: nftCount > 0,
          isEstablished: tokenCount > 10
        },
        riskFactors,
        portfolio: {
          tokens: tokenCount,
          nfts: nftCount,
          topTokens: Array.isArray(tokens) ? tokens.slice(0, 5) : []
        }
      };
    } catch (error) {
      console.error('Error analyzing wallet risk:', error.message);
      return {
        walletAddress,
        tokenAddress,
        riskLevel: 'unknown',
        riskScore: 0,
        error: error.message
      };
    }
  }

  /**
   * Analyze top BONK holders for risk
   * @param {string} bonkAddress - BONK token address
   * @param {number} topN - Number of top holders to analyze
   * @returns {Promise<Object>} Comprehensive risk analysis
   */
  async analyzeBonkHolders(bonkAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', topN = 20) {
    try {
      console.log(`\n🔍 Analyzing top ${topN} BONK holders...`);
      
      // Get top holders
      const holdersData = await this.getTopHolders(bonkAddress, topN);
      
      if (!holdersData || !Array.isArray(holdersData)) {
        throw new Error('Invalid holders data received');
      }

      console.log(`Found ${holdersData.length} holders to analyze\n`);

      // Analyze each holder
      const holderAnalyses = [];
      for (let i = 0; i < holdersData.length; i++) {
        const holder = holdersData[i];
        const walletAddr = holder.walletAddress || holder.owner;
        console.log(`Analyzing holder ${i + 1}/${holdersData.length}: ${walletAddr}`);
        
        const analysis = await this.analyzeWalletRisk(walletAddr, bonkAddress);
        holderAnalyses.push({
          rank: i + 1,
          owner: walletAddr,
          balance: holder.rawBalance || holder.balance,
          uiAmount: holder.balance,
          percentageOfSupply: holder.percentageOfSupply,
          ...analysis
        });

        // Rate limiting - wait 300ms between requests
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Calculate aggregate statistics
      const totalRiskScore = holderAnalyses.reduce((sum, h) => sum + h.riskScore, 0);
      const avgRiskScore = totalRiskScore / holderAnalyses.length;
      
      const riskDistribution = {
        critical: holderAnalyses.filter(h => h.riskLevel === 'critical').length,
        high: holderAnalyses.filter(h => h.riskLevel === 'high').length,
        medium: holderAnalyses.filter(h => h.riskLevel === 'medium').length,
        low: holderAnalyses.filter(h => h.riskLevel === 'low').length
      };

      // Overall assessment
      let overallRisk = 'low';
      if (riskDistribution.critical > topN * 0.3 || avgRiskScore > 60) {
        overallRisk = 'critical';
      } else if (riskDistribution.critical + riskDistribution.high > topN * 0.4 || avgRiskScore > 40) {
        overallRisk = 'high';
      } else if (avgRiskScore > 25) {
        overallRisk = 'medium';
      }

      return {
        tokenAddress: bonkAddress,
        tokenName: 'BONK',
        analysisDate: new Date().toISOString(),
        holdersAnalyzed: holderAnalyses.length,
        overallRisk,
        avgRiskScore: avgRiskScore.toFixed(2),
        riskDistribution,
        topRiskyHolders: holderAnalyses
          .filter(h => h.riskLevel === 'critical' || h.riskLevel === 'high')
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 10),
        holders: holderAnalyses,
        summary: {
          totalHolders: holderAnalyses.length,
          criticalRiskHolders: riskDistribution.critical,
          highRiskHolders: riskDistribution.high,
          establishedWallets: holderAnalyses.filter(h => h.metrics?.isEstablished).length,
          newWallets: holderAnalyses.filter(h => h.metrics?.tokenCount < 3).length
        }
      };
    } catch (error) {
      console.error('Error analyzing BONK holders:', error.message);
      throw error;
    }
  }
}

module.exports = new MoralisAnalyzer();
