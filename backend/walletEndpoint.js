import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@sanity/client';
import express from 'express';

const router = express.Router();

let anthropic = null;
let sanityClient = null;

function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  return anthropic;
}

function getSanityClient() {
  if (!sanityClient) {
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_TOKEN;
    
    if (!projectId || !dataset || !token) {
      throw new Error('Missing Sanity configuration');
    }
    
    sanityClient = createClient({
      projectId,
      dataset,
      token,
      apiVersion: '2024-01-01',
      useCdn: false
    });
  }
  return sanityClient;
}

// POST /api/wallet/analyze - Full wallet analysis with Sanity save
router.post('/analyze', async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({
      error: 'Missing required field: walletAddress'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log('📊 Fetching wallet portfolio for:', walletAddress);

    // Call MCP tool to get wallet portfolio
    const portfolioData = await mcpClient.callTool({
      name: 'get_wallet_portfolio',
      arguments: {
        walletAddress: walletAddress
      }
    });

    // Parse MCP response
    let parsedData = {};
    try {
      if (portfolioData.content && Array.isArray(portfolioData.content)) {
        const textContent = portfolioData.content[0]?.text || portfolioData.content[0];
        parsedData = typeof textContent === 'string' ? JSON.parse(textContent) : textContent;
      } else if (typeof portfolioData.content === 'string') {
        parsedData = JSON.parse(portfolioData.content);
      } else {
        parsedData = portfolioData.content || {};
      }
    } catch (e) {
      console.error('Error parsing MCP response:', e);
      return res.status(500).json({
        error: 'Failed to parse wallet data',
        message: e.message
      });
    }

    console.log('✅ Portfolio data received');
    console.log('🔍 DEBUG - parsedData structure:', JSON.stringify(parsedData, null, 2).substring(0, 500));
    console.log('🔍 DEBUG - parsedData keys:', Object.keys(parsedData));
    console.log('🔍 DEBUG - parsedData.data exists?', !!parsedData.data);
    console.log('🔍 DEBUG - parsedData.data keys:', parsedData.data ? Object.keys(parsedData.data) : 'N/A');

    // Extract data from nested structure if needed
    const walletData = parsedData.data || parsedData;
    const tokens = walletData.tokens || [];
    const nfts = walletData.nfts || [];
    const summary = walletData.summary || parsedData.summary || {};
    
    console.log('🔍 DEBUG - tokens array length:', tokens.length);
    console.log('🔍 DEBUG - nfts array length:', nfts.length);
    console.log('🔍 DEBUG - summary:', summary);
    
    // Normalize the data structure
    const normalizedData = {
      tokens: tokens,
      nfts: nfts,
      totalValue: summary.totalValueUsd || parsedData.totalValue || 0,
      nativeBalance: summary.solBalance || parsedData.nativeBalance || parsedData.solBalance || 0,
      tokenCount: summary.totalTokens || tokens.length || 0,
      nftCount: summary.totalNFTs || nfts.length || 0
    };

    console.log('📊 Parsed wallet data:', {
      tokens: normalizedData.tokens.length,
      nfts: normalizedData.nfts.length,
      totalValue: normalizedData.totalValue,
      nativeBalance: normalizedData.nativeBalance
    });

    // Analyze wallet risk and diversification
    const analysis = analyzeWalletRisk(normalizedData);
    console.log('✅ Risk analysis complete:', analysis.riskLevel, `(${analysis.riskScore}/100)`);

    // Prepare data for Sanity
    const walletReport = {
      _type: 'walletAnalysis',
      walletAddress: walletAddress,
      chain: 'solana',
      totalValueUsd: normalizedData.totalValue,
      nativeBalance: normalizedData.nativeBalance,
      tokenCount: normalizedData.tokenCount,
      nftCount: normalizedData.nftCount,
      tokens: formatTokenHoldings(normalizedData.tokens),
      nfts: formatNFTHoldings(normalizedData.nfts),
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      riskFactors: analysis.riskFactors,
      diversification: analysis.diversification,
      activityMetrics: parsedData.activityMetrics || null,
      aiAnalysis: 'Analysis in progress...',
      recommendations: analysis.recommendations,
      rawJson: JSON.stringify(parsedData, null, 2),
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    console.log('💾 Saving wallet analysis to Sanity...');
    console.log('   Wallet:', walletAddress);
    console.log('   Total Value:', `$${walletReport.totalValueUsd.toFixed(2)}`);
    console.log('   Tokens:', walletReport.tokenCount);
    console.log('   NFTs:', walletReport.nftCount);
    console.log('   Risk:', walletReport.riskLevel, `- Score: ${walletReport.riskScore}/100`);

    // Save to Sanity
    let savedReport;
    try {
      savedReport = await getSanityClient().create(walletReport);
      console.log('✅ Wallet analysis saved with ID:', savedReport._id);
    } catch (sanityError) {
      console.error('❌ Sanity save error:', sanityError.message);
      throw sanityError;
    }

    // Get AI analysis asynchronously
    console.log('🤖 Requesting AI analysis (async)...');
    getAIWalletAnalysis(normalizedData, analysis)
      .then(async (aiAnalysis) => {
        console.log('✅ AI analysis received, updating Sanity...');
        try {
          await getSanityClient()
            .patch(savedReport._id)
            .set({ aiAnalysis })
            .commit();
          console.log('✅ AI analysis added to report:', savedReport._id);
        } catch (updateError) {
          console.error('❌ Failed to update with AI analysis:', updateError.message);
        }
      })
      .catch((aiError) => {
        console.error('❌ AI analysis failed:', aiError.message);
      });

    res.json({
      success: true,
      reportId: savedReport._id,
      walletAddress: walletAddress,
      totalValueUsd: walletReport.totalValueUsd,
      tokenCount: walletReport.tokenCount,
      nftCount: walletReport.nftCount,
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      diversification: analysis.diversification,
      recommendations: analysis.recommendations,
      timestamp: new Date().toISOString(),
      note: 'AI analysis will be added shortly'
    });

  } catch (error) {
    console.error('Wallet analysis error:', error);
    res.status(500).json({
      error: 'Wallet analysis failed',
      message: error.message
    });
  }
});

// GET /api/wallet/:walletAddress - Quick wallet lookup
router.get('/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  if (!walletAddress) {
    return res.status(400).json({
      error: 'Missing required parameter: walletAddress'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log('📊 Quick wallet lookup for:', walletAddress);

    const portfolioData = await mcpClient.callTool({
      name: 'get_wallet_portfolio',
      arguments: {
        walletAddress: walletAddress
      }
    });

    // Parse MCP response
    let parsedData = {};
    try {
      if (portfolioData.content && Array.isArray(portfolioData.content)) {
        const textContent = portfolioData.content[0]?.text || portfolioData.content[0];
        parsedData = typeof textContent === 'string' ? JSON.parse(textContent) : textContent;
      } else if (typeof portfolioData.content === 'string') {
        parsedData = JSON.parse(portfolioData.content);
      } else {
        parsedData = portfolioData.content || {};
      }
    } catch (e) {
      console.error('Error parsing MCP response:', e);
      return res.status(500).json({
        error: 'Failed to parse wallet data',
        message: e.message
      });
    }

    console.log('🔍 DEBUG GET - parsedData keys:', Object.keys(parsedData));
    console.log('🔍 DEBUG GET - parsedData.data exists?', !!parsedData.data);

    // Extract data from nested structure if needed
    const walletData = parsedData.data || parsedData;
    const tokens = walletData.tokens || [];
    const nfts = walletData.nfts || [];
    const summary = walletData.summary || parsedData.summary || {};
    
    console.log('🔍 DEBUG GET - tokens length:', tokens.length);
    console.log('🔍 DEBUG GET - nfts length:', nfts.length);
    
    // Normalize the data structure
    const normalizedData = {
      tokens: tokens,
      nfts: nfts,
      totalValue: summary.totalValueUsd || parsedData.totalValue || 0,
      nativeBalance: summary.solBalance || parsedData.nativeBalance || parsedData.solBalance || 0,
      tokenCount: summary.totalTokens || tokens.length || 0,
      nftCount: summary.totalNFTs || nfts.length || 0
    };

    const analysis = analyzeWalletRisk(normalizedData);
    console.log('✅ Analysis complete');

    res.json({
      success: true,
      walletAddress: walletAddress,
      totalValueUsd: normalizedData.totalValue,
      nativeBalance: normalizedData.nativeBalance,
      tokenCount: normalizedData.tokenCount,
      nftCount: normalizedData.nftCount,
      tokens: normalizedData.tokens,
      nfts: normalizedData.nfts,
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      diversification: analysis.diversification,
      recommendations: analysis.recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Wallet lookup error:', error);
    res.status(500).json({
      error: 'Failed to fetch wallet data',
      message: error.message
    });
  }
});

function analyzeWalletRisk(portfolioData) {
  const analysis = {
    riskLevel: 'UNKNOWN',
    riskScore: 50,
    riskFactors: [],
    recommendations: [],
    diversification: {
      topTokenConcentration: 0,
      top3Concentration: 0,
      top5Concentration: 0,
      herfindahlIndex: 0
    }
  };

  try {
    const tokens = portfolioData.tokens || [];
    const totalValue = portfolioData.totalValue || 0;

    if (tokens.length === 0) {
      analysis.riskLevel = 'LOW';
      analysis.riskScore = 20;
      analysis.riskFactors.push('Empty wallet or no token holdings');
      analysis.recommendations.push('Wallet has no significant holdings');
      return analysis;
    }

    // Sort tokens by value
    const sortedTokens = [...tokens].sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0));

    // Calculate concentration metrics
    const top1Value = sortedTokens[0]?.valueUsd || 0;
    const top3Value = sortedTokens.slice(0, 3).reduce((sum, t) => sum + (t.valueUsd || 0), 0);
    const top5Value = sortedTokens.slice(0, 5).reduce((sum, t) => sum + (t.valueUsd || 0), 0);

    analysis.diversification.topTokenConcentration = totalValue > 0 ? (top1Value / totalValue) * 100 : 0;
    analysis.diversification.top3Concentration = totalValue > 0 ? (top3Value / totalValue) * 100 : 0;
    analysis.diversification.top5Concentration = totalValue > 0 ? (top5Value / totalValue) * 100 : 0;

    // Calculate Herfindahl Index (concentration measure)
    let herfindahlIndex = 0;
    tokens.forEach(token => {
      const share = totalValue > 0 ? (token.valueUsd || 0) / totalValue : 0;
      herfindahlIndex += share * share;
    });
    analysis.diversification.herfindahlIndex = herfindahlIndex;

    let riskScore = 50;

    // Analyze concentration risk
    if (analysis.diversification.topTokenConcentration > 80) {
      riskScore += 30;
      analysis.riskFactors.push(`CRITICAL: Single token represents ${analysis.diversification.topTokenConcentration.toFixed(1)}% of portfolio`);
    } else if (analysis.diversification.topTokenConcentration > 60) {
      riskScore += 20;
      analysis.riskFactors.push(`HIGH: Top token represents ${analysis.diversification.topTokenConcentration.toFixed(1)}% of portfolio`);
    } else if (analysis.diversification.topTokenConcentration > 40) {
      riskScore += 10;
      analysis.riskFactors.push(`MEDIUM: Top token represents ${analysis.diversification.topTokenConcentration.toFixed(1)}% of portfolio`);
    } else {
      riskScore -= 10;
      analysis.riskFactors.push(`Good diversification: Top token is ${analysis.diversification.topTokenConcentration.toFixed(1)}% of portfolio`);
    }

    // Herfindahl Index analysis (1.0 = complete concentration, 0 = perfect diversification)
    if (herfindahlIndex > 0.5) {
      riskScore += 15;
      analysis.riskFactors.push('Portfolio is highly concentrated');
    } else if (herfindahlIndex < 0.2) {
      riskScore -= 10;
      analysis.riskFactors.push('Portfolio is well diversified');
    }

    // Token count analysis
    if (tokens.length < 3) {
      riskScore += 15;
      analysis.riskFactors.push(`Low diversification: Only ${tokens.length} token(s) held`);
    } else if (tokens.length > 10) {
      riskScore -= 5;
      analysis.riskFactors.push(`Good diversification: ${tokens.length} different tokens`);
    }

    // Portfolio value analysis
    if (totalValue < 100) {
      riskScore -= 10;
      analysis.riskFactors.push('Small portfolio value - lower risk exposure');
    } else if (totalValue > 100000) {
      riskScore += 10;
      analysis.riskFactors.push('Large portfolio value - consider additional security measures');
    }

    analysis.riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level and recommendations
    if (analysis.riskScore < 30) {
      analysis.riskLevel = 'LOW';
      analysis.recommendations.push('Portfolio shows good diversification');
      analysis.recommendations.push('Continue monitoring token performance');
    } else if (analysis.riskScore < 60) {
      analysis.riskLevel = 'MEDIUM';
      analysis.recommendations.push('Consider diversifying holdings further');
      analysis.recommendations.push('Monitor top holdings for concentration risk');
      analysis.recommendations.push('Review token fundamentals regularly');
    } else {
      analysis.riskLevel = 'HIGH';
      analysis.recommendations.push('⚠️ HIGH RISK: Portfolio is highly concentrated');
      analysis.recommendations.push('Strongly consider diversifying across more tokens');
      analysis.recommendations.push('Reduce exposure to top holdings');
      analysis.recommendations.push('Implement risk management strategies');
    }

  } catch (error) {
    console.error('Error in wallet risk analysis:', error);
    analysis.riskFactors.push('Error analyzing wallet: ' + error.message);
  }

  return analysis;
}

async function getAIWalletAnalysis(portfolioData, riskAnalysis) {
  try {
    const tokens = portfolioData.tokens || [];
    const nfts = portfolioData.nfts || [];
    const totalValue = parseFloat(portfolioData.totalValue) || 0;
    const nativeBalance = parseFloat(portfolioData.nativeBalance) || 0;

    const topTokens = [...tokens]
      .sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0))
      .slice(0, 10);

    const prompt = `You are an expert cryptocurrency portfolio analyst. Analyze this Solana wallet and provide professional investment insights.

WALLET OVERVIEW:
- Total Portfolio Value: $${totalValue.toFixed(2)}
- Native SOL Balance: ${parseFloat(nativeBalance).toFixed(4)} SOL
- Number of Tokens: ${tokens.length}
- NFTs: ${nfts.length}

DIVERSIFICATION METRICS:
- Top Token Concentration: ${riskAnalysis.diversification.topTokenConcentration.toFixed(2)}%
- Top 3 Tokens: ${riskAnalysis.diversification.top3Concentration.toFixed(2)}%
- Top 5 Tokens: ${riskAnalysis.diversification.top5Concentration.toFixed(2)}%
- Herfindahl Index: ${riskAnalysis.diversification.herfindahlIndex.toFixed(3)} (0=diversified, 1=concentrated)

TOP HOLDINGS:
${topTokens.map((t, i) => {
  const pct = totalValue > 0 ? ((t.valueUsd || 0) / totalValue * 100).toFixed(2) : 0;
  return `${i + 1}. ${t.symbol || 'Unknown'} - $${(t.valueUsd || 0).toFixed(2)} (${pct}%)`;
}).join('\n')}

PRELIMINARY RISK ASSESSMENT:
- Risk Level: ${riskAnalysis.riskLevel}
- Risk Score: ${riskAnalysis.riskScore}/100
- Key Factors: ${riskAnalysis.riskFactors.join('; ')}

Provide a detailed professional analysis covering:

1. **Portfolio Composition**: Evaluate the token mix and allocation strategy
2. **Diversification Assessment**: Analyze concentration risk and diversification quality
3. **Risk Factors**: Identify specific risks based on holdings and concentration
4. **Opportunity Analysis**: Highlight potential improvements or rebalancing strategies
5. **Actionable Recommendations**: Provide specific steps to optimize the portfolio

Format your response in clear sections with actionable insights. Be direct and specific. Limit to 400-600 words.`;

    const message = await getAnthropicClient().messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('AI analysis error:', error);
    return `Portfolio analysis completed with ${riskAnalysis.riskLevel} risk level (${riskAnalysis.riskScore}/100). ${riskAnalysis.riskFactors.join('. ')}`;
  }
}

function formatTokenHoldings(tokens) {
  return tokens.map((token, index) => ({
    _key: `token-${index}-${Date.now()}`,
    tokenAddress: token.mint || token.address || token.tokenAddress || 'Unknown',
    symbol: token.symbol || 'Unknown',
    name: token.name || 'Unknown',
    balance: parseFloat(token.amount || token.balance || 0),
    decimals: parseInt(token.decimals || 0),
    valueUsd: parseFloat(token.valueUsd || token.value || 0),
    priceUsd: parseFloat(token.priceUsd || token.price || 0),
    percentageOfPortfolio: parseFloat(token.percentage || 0)
  }));
}

function formatNFTHoldings(nfts) {
  return nfts.map((nft, index) => ({
    _key: `nft-${index}-${Date.now()}`,
    mintAddress: nft.mint || nft.address || 'Unknown',
    name: nft.name || 'Unknown',
    symbol: nft.symbol || '',
    collection: nft.collection || nft.collectionName || '',
    imageUrl: nft.image || nft.imageUrl || '',
    floorPriceUsd: parseFloat(nft.floorPrice || 0)
  }));
}

export default router;
