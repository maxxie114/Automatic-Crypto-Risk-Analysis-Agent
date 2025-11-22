/**
 * Moralis API tool for Solana wallet analysis and risk assessment.
 * 
 * Analyzes wallet portfolios, token holdings, NFTs, and SOL balances
 * to determine risk indicators and provide comprehensive wallet insights.
 */

const MORALIS_BASE_URL = 'https://solana-gateway.moralis.io';

/**
 * Get wallet token balances from Moralis
 */
async function getWalletTokens(walletAddress, apiKey) {
  try {
    const response = await fetch(
      `${MORALIS_BASE_URL}/account/mainnet/${walletAddress}/tokens`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet tokens:', error.message);
    return [];
  }
}

/**
 * Get wallet NFTs from Moralis
 */
async function getWalletNFTs(walletAddress, apiKey) {
  try {
    const response = await fetch(
      `${MORALIS_BASE_URL}/account/mainnet/${walletAddress}/nft`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { nfts: [] };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error.message);
    return { nfts: [] };
  }
}

/**
 * Get wallet SOL balance from Moralis
 */
async function getWalletBalance(walletAddress, apiKey) {
  try {
    const response = await fetch(
      `${MORALIS_BASE_URL}/account/mainnet/${walletAddress}/balance`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { solana: '0' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet balance:', error.message);
    return { solana: '0' };
  }
}

/**
 * Get wallet portfolio from Moralis
 */
async function getWalletPortfolio(walletAddress, apiKey) {
  try {
    const response = await fetch(
      `${MORALIS_BASE_URL}/account/mainnet/${walletAddress}/portfolio`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { tokens: [], nfts: [], nativeBalance: { solana: '0' } };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error.message);
    return { tokens: [], nfts: [], nativeBalance: { solana: '0' } };
  }
}

/**
 * Analyze wallet risk based on holdings and activity
 */
const executeAnalyzeWalletRisk = async ({ walletAddress, tokenAddress }) => {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    return {
      error: 'MORALIS_API_KEY environment variable is not set'
    };
  }

  if (!walletAddress) {
    return {
      error: 'walletAddress is required'
    };
  }

  try {
    // Fetch wallet data in parallel
    const [tokens, nfts, balance] = await Promise.all([
      getWalletTokens(walletAddress, apiKey),
      getWalletNFTs(walletAddress, apiKey),
      getWalletBalance(walletAddress, apiKey)
    ]);

    // Calculate metrics
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
      tokenAddress: tokenAddress || null,
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
      },
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing wallet risk:', error);
    return {
      error: `An error occurred while analyzing wallet: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Get detailed wallet portfolio
 */
const executeGetWalletPortfolio = async ({ walletAddress }) => {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    return {
      error: 'MORALIS_API_KEY environment variable is not set'
    };
  }

  if (!walletAddress) {
    return {
      error: 'walletAddress is required'
    };
  }

  try {
    const portfolio = await getWalletPortfolio(walletAddress, apiKey);

    return {
      walletAddress,
      portfolio,
      summary: {
        totalTokens: portfolio.tokens?.length || 0,
        totalNFTs: portfolio.nfts?.length || 0,
        solBalance: portfolio.nativeBalance?.solana || '0'
      },
      retrievedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting wallet portfolio:', error);
    return {
      error: `An error occurred while fetching portfolio: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * MCP Tool 1: Analyze wallet risk
 */
const analyzeWalletRiskTool = {
  function: executeAnalyzeWalletRisk,
  definition: {
    type: 'function',
    function: {
      name: 'analyze_wallet_risk',
      description: 'Analyze a Solana wallet for risk indicators using Moralis API. Evaluates token holdings, NFT count, SOL balance, and activity patterns to determine if the wallet is new, established, or potentially risky (burner wallet, single-token holder, etc.).',
      parameters: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            description: 'The Solana wallet address to analyze'
          },
          tokenAddress: {
            type: 'string',
            description: 'Optional token address for context in the analysis'
          }
        },
        required: ['walletAddress']
      }
    }
  }
};

/**
 * MCP Tool 2: Get wallet portfolio
 */
const getWalletPortfolioTool = {
  function: executeGetWalletPortfolio,
  definition: {
    type: 'function',
    function: {
      name: 'get_wallet_portfolio',
      description: 'Get comprehensive portfolio information for a Solana wallet using Moralis API. Returns all tokens, NFTs, and native SOL balance held by the wallet.',
      parameters: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            description: 'The Solana wallet address to fetch portfolio for'
          }
        },
        required: ['walletAddress']
      }
    }
  }
};

// Export the analyze_wallet_risk tool as the primary tool for this file
export { analyzeWalletRiskTool as apiTool };

// Note: To also register get_wallet_portfolio, you would need to export it separately
// or create a second file. For now, exporting the risk analyzer as primary.
