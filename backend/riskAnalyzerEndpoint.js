import express from 'express';


const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { cryptoSymbol, tokenAddress, collectionId, requestName } = req.body;

  if (!cryptoSymbol && !tokenAddress && !collectionId) {
    return res.status(400).json({
      error: 'Missing required field: either cryptoSymbol, tokenAddress, or collectionId is required'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log(`Analyzing risk for: ${cryptoSymbol || tokenAddress || collectionId}`);

    // Use tokenAddress or cryptoSymbol for search
    const searchQuery = tokenAddress || cryptoSymbol;
    let tokenData = null;
    let holderAnalysis = null;

    if (searchQuery) {
      try {
        const searchResult = await mcpClient.callTool({
          name: 'search_tokens',
          arguments: {
            q: searchQuery
          }
        });
        
        // Parse the search result
        const rawData = JSON.parse(searchResult.content[0].text);
        if (rawData.pairs && rawData.pairs.length > 0) {
          // Get the first (most relevant) pair
          const pair = rawData.pairs[0];
          tokenData = {
            address: pair.baseToken?.address || tokenAddress || '',
            symbol: pair.baseToken?.symbol || cryptoSymbol || '',
            name: pair.baseToken?.name || '',
            chainId: pair.chainId || '',
            priceUsd: parseFloat(pair.priceUsd) || 0,
            marketCap: pair.marketCap || 0,
            liquidity: pair.liquidity?.usd || 0,
            volume24h: pair.volume?.h24 || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            dexId: pair.dexId || '',
            pairAddress: pair.pairAddress || ''
          };

          // If it's a Solana token, try to get holder analysis
          if (pair.chainId === 'solana' && pair.baseToken?.address) {
            try {
              console.log('Fetching holder analysis for Solana token...');
              const holderResult = await mcpClient.callTool({
                name: 'find_account_info',
                arguments: {
                  tokenAddress: pair.baseToken.address,
                  topN: 10
                }
              });
              
              const holderData = JSON.parse(holderResult.content[0].text);
              holderAnalysis = {
                topHolders: holderData.holders || [],
                concentration: holderData.concentration || {},
                totalSupply: holderData.totalSupply || 0
              };
              console.log('Holder analysis completed');
            } catch (holderError) {
              console.warn('Holder analysis failed:', holderError.message);
            }
          }
        }
      } catch (searchError) {
        console.warn('Search failed, continuing with basic analysis:', searchError.message);
      }
    }

    // Perform risk analysis
    const riskAnalysis = analyzeRisk(tokenData);

    // Save to Sanity if we have token data
    let sanityResult = null;
    if (tokenData) {
      try {
        // Create comprehensive risk report (includes holder data if available)
        const report = await createRiskReport(tokenData, riskAnalysis, holderAnalysis);
        console.log('Risk report saved to Sanity:', report._id);

        // Also create/update coin and risk documents for backward compatibility
        const coin = await upsertCoin(tokenData);
        const risk = await createRiskAssessment(coin._id, riskAnalysis);

        sanityResult = {
          reportId: report._id,
          coinId: coin._id,
          riskId: risk._id
        };
      } catch (sanityError) {
        console.error('Failed to save to Sanity:', sanityError);
        // Continue anyway - don't fail the request if Sanity save fails
      }
    }

    // Build response
    const response = {
      success: true,
      reportId: sanityResult?.reportId || null,
      tokenAddress: tokenData?.address || tokenAddress || '',
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      riskFactors: riskAnalysis.factors,
      recommendations: riskAnalysis.recommendations,
      tokenData: tokenData,
      timestamp: new Date().toISOString()
    };

    // Include holder concentration if available
    if (holderAnalysis && holderAnalysis.concentration) {
      response.concentration = holderAnalysis.concentration;
      response.topHolders = holderAnalysis.topHolders?.slice(0, 10) || [];
    }

    // Include Sanity IDs for debugging
    if (sanityResult) {
      response.sanity = sanityResult;
    }

    console.log('Risk analysis completed successfully');
    res.json(response);

  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({
      error: 'Risk analysis failed',
      message: error.message,
      details: error.toString()
    });
  }
});

router.get('/:tokenId', async (req, res) => {
  const { tokenId } = req.params;

  if (!tokenId) {
    return res.status(400).json({
      error: 'Missing required parameter: tokenId'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log(`Fetching risk data for token: ${tokenId}`);

    let tokenData = null;

    try {
      const searchResult = await mcpClient.callTool({
        name: 'search_tokens',
        arguments: {
          q: tokenId
        }
      });

      // Parse the search result
      const rawData = JSON.parse(searchResult.content[0].text);
      if (rawData.pairs && rawData.pairs.length > 0) {
        const pair = rawData.pairs[0];
        tokenData = {
          address: pair.baseToken?.address || tokenId,
          symbol: pair.baseToken?.symbol || '',
          name: pair.baseToken?.name || '',
          chainId: pair.chainId || '',
          priceUsd: parseFloat(pair.priceUsd) || 0,
          marketCap: pair.marketCap || 0,
          liquidity: pair.liquidity?.usd || 0,
          volume24h: pair.volume?.h24 || 0,
          priceChange24h: pair.priceChange?.h24 || 0,
          dexId: pair.dexId || '',
          pairAddress: pair.pairAddress || ''
        };
      }
    } catch (searchError) {
      console.warn('Search failed:', searchError.message);
    }

    const riskAnalysis = analyzeRisk(tokenData);

    res.json({
      success: true,
      data: {
        riskLevel: riskAnalysis.riskLevel,
        riskScore: riskAnalysis.score,
        riskFactors: riskAnalysis.factors,
        recommendations: riskAnalysis.recommendations,
        tokenData: tokenData
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token risk fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch token risk data',
      message: error.message
    });
  }
});

function analyzeRisk(tokenData) {
  const analysis = {
    riskLevel: 'MEDIUM',
    score: 50,
    factors: [],
    recommendations: []
  };

  try {
    if (!tokenData) {
      analysis.riskLevel = 'UNKNOWN';
      analysis.score = 50;
      analysis.factors.push('Insufficient data to perform analysis');
      analysis.recommendations.push('Unable to fetch token data - please try again');
      return analysis;
    }

    let riskScore = 50; // Start at medium risk

    // Liquidity analysis
    if (tokenData.liquidity) {
      if (tokenData.liquidity < 10000) {
        riskScore += 20;
        analysis.factors.push(`Low liquidity: $${tokenData.liquidity.toLocaleString()} (HIGH RISK)`);
      } else if (tokenData.liquidity < 100000) {
        riskScore += 10;
        analysis.factors.push(`Moderate liquidity: $${tokenData.liquidity.toLocaleString()}`);
      } else {
        riskScore -= 10;
        analysis.factors.push(`Good liquidity: $${tokenData.liquidity.toLocaleString()}`);
      }
    }

    // Market cap analysis
    if (tokenData.marketCap) {
      if (tokenData.marketCap < 100000) {
        riskScore += 15;
        analysis.factors.push(`Very low market cap: $${tokenData.marketCap.toLocaleString()} (HIGH RISK)`);
      } else if (tokenData.marketCap < 1000000) {
        riskScore += 5;
        analysis.factors.push(`Low market cap: $${tokenData.marketCap.toLocaleString()}`);
      } else if (tokenData.marketCap > 10000000) {
        riskScore -= 10;
        analysis.factors.push(`Established market cap: $${tokenData.marketCap.toLocaleString()}`);
      }
    }

    // Volume analysis
    if (tokenData.volume24h) {
      const volumeToLiquidityRatio = tokenData.liquidity ? tokenData.volume24h / tokenData.liquidity : 0;
      if (tokenData.volume24h < 10000) {
        riskScore += 10;
        analysis.factors.push(`Low trading volume: $${tokenData.volume24h.toLocaleString()}`);
      } else if (volumeToLiquidityRatio > 2) {
        riskScore -= 5;
        analysis.factors.push(`Healthy trading activity`);
      }
    }

    // Price volatility
    if (tokenData.priceChange24h) {
      const absChange = Math.abs(tokenData.priceChange24h);
      if (absChange > 50) {
        riskScore += 15;
        analysis.factors.push(`Extreme price volatility: ${tokenData.priceChange24h.toFixed(2)}% (24h)`);
      } else if (absChange > 20) {
        riskScore += 5;
        analysis.factors.push(`High price volatility: ${tokenData.priceChange24h.toFixed(2)}% (24h)`);
      }
    }

    // DEX analysis
    if (tokenData.dexId) {
      const trustedDexes = ['uniswap', 'pancakeswap', 'sushiswap', 'raydium', 'orca'];
      if (trustedDexes.includes(tokenData.dexId.toLowerCase())) {
        riskScore -= 5;
        analysis.factors.push(`Listed on trusted DEX: ${tokenData.dexId}`);
      }
    }

    // Clamp score between 0-100
    analysis.score = Math.max(0, Math.min(100, riskScore));

    // Determine risk level and recommendations
    if (analysis.score < 30) {
      analysis.riskLevel = 'LOW';
      analysis.recommendations.push('Token shows relatively low risk indicators');
      analysis.recommendations.push('Always verify contract address and do your own research');
      analysis.recommendations.push('Consider starting with a small position');
    } else if (analysis.score < 60) {
      analysis.riskLevel = 'MEDIUM';
      analysis.recommendations.push('Exercise caution when trading this token');
      analysis.recommendations.push('Verify liquidity is sufficient for your trade size');
      analysis.recommendations.push('Check community sentiment and project fundamentals');
      analysis.recommendations.push('Consider using limit orders to control entry/exit');
    } else {
      analysis.riskLevel = 'HIGH';
      analysis.recommendations.push('⚠️ HIGH RISK: Proceed with extreme caution');
      analysis.recommendations.push('Token shows multiple risk indicators');
      analysis.recommendations.push('Only invest what you can afford to lose completely');
      analysis.recommendations.push('Verify this is not a scam or rug pull attempt');
      analysis.recommendations.push('Consider consulting with experienced traders');
    }

  } catch (error) {
    console.error('Error in risk analysis:', error);
    analysis.factors.push('Error occurred during analysis');
    analysis.riskLevel = 'UNKNOWN';
  }

  return analysis;
}

export default router;
