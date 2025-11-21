/**
 * Moralis API tool to get detailed wallet portfolio information.
 * Returns all tokens, NFTs, and SOL balance for a Solana wallet.
 */

const MORALIS_BASE_URL = 'https://solana-gateway.moralis.io';

/**
 * Get wallet portfolio from Moralis API
 */
const executeFunction = async ({ walletAddress }) => {
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
      const errorData = await response.json().catch(() => ({}));
      return {
        error: `Moralis API error: ${response.status}`,
        details: errorData
      };
    }

    const portfolio = await response.json();

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
 * MCP Tool configuration
 */
const apiTool = {
  function: executeFunction,
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

export { apiTool };
