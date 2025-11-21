/**
 * Helius API tool to analyze token holder concentration and account information.
 * 
 * This tool fetches the top token holders for a given SPL token address,
 * identifies wallet owners, calculates concentration metrics, and assesses risk.
 * 
 * @param {Object} args - Arguments for the analysis
 * @param {string} args.tokenAddress - The SPL token mint address to analyze
 * @param {number} [args.topN=10] - Number of top holders to fetch (default: 10)
 * @returns {Promise<Object>} - Analysis results including holders, concentration, and risk assessment
 */
const executeFunction = async ({ tokenAddress, topN = 10 }) => {
  const apiKey = process.env.HELIUS_API_KEY;
  
  if (!apiKey) {
    return { 
      error: "HELIUS_API_KEY environment variable is not set" 
    };
  }

  if (!tokenAddress) {
    return { 
      error: "tokenAddress is required" 
    };
  }

  const heliusRpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  try {
    // Step 1: Get largest token accounts
    const largestAccountsResponse = await fetch(heliusRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenLargestAccounts',
        params: [tokenAddress]
      })
    });

    const largestAccountsData = await largestAccountsResponse.json();

    if (!largestAccountsData.result || !largestAccountsData.result.value) {
      return {
        error: 'Failed to get token accounts',
        details: largestAccountsData
      };
    }

    const largestAccounts = largestAccountsData.result.value.slice(0, topN);

    // Step 2: Get total supply
    const supplyResponse = await fetch(heliusRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenSupply',
        params: [tokenAddress]
      })
    });

    const supplyData = await supplyResponse.json();
    const totalSupply = supplyData.result.value.uiAmount;

    // Step 3: Get owner for each token account
    const holders = [];

    for (let i = 0; i < largestAccounts.length; i++) {
      const account = largestAccounts[i];

      try {
        const accountInfoResponse = await fetch(heliusRpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getAccountInfo',
            params: [
              account.address,
              { encoding: 'jsonParsed' }
            ]
          })
        });

        const accountInfoData = await accountInfoResponse.json();
        const parsed = accountInfoData.result?.value?.data?.parsed;

        if (parsed?.info) {
          const owner = parsed.info.owner;
          const balance = account.uiAmount;
          const percentage = (balance / totalSupply * 100).toFixed(4);

          // Identify likely account type
          let accountType = 'Individual/Unknown';
          if (owner.startsWith('5Q544fK')) accountType = 'Likely Exchange (Raydium/Orca Pool)';
          else if (owner.startsWith('5hpfC')) accountType = 'Likely Liquidity Pool';
          else if (owner.startsWith('F8Fq')) accountType = 'Likely Exchange Wallet';
          else if (owner.startsWith('8voV')) accountType = 'Likely Liquidity Pool';

          holders.push({
            rank: i + 1,
            tokenAccount: account.address,
            walletOwner: owner,
            balance: balance,
            percentage: parseFloat(percentage),
            accountType: accountType
          });
        }
      } catch (error) {
        console.error(`Could not get owner for account ${i + 1}:`, error);
      }
    }

    // Calculate concentration metrics
    const top3Percentage = holders.slice(0, 3).reduce((sum, h) => sum + h.percentage, 0);
    const top5Percentage = holders.slice(0, 5).reduce((sum, h) => sum + h.percentage, 0);
    const top10Percentage = holders.reduce((sum, h) => sum + h.percentage, 0);

    // Risk assessment
    let concentrationRisk = 'Low';
    let riskLevel = 1;
    if (top10Percentage > 80) {
      concentrationRisk = 'CRITICAL';
      riskLevel = 4;
    } else if (top10Percentage > 60) {
      concentrationRisk = 'High';
      riskLevel = 3;
    } else if (top10Percentage > 40) {
      concentrationRisk = 'Medium';
      riskLevel = 2;
    }

    return {
      tokenAddress,
      totalSupply,
      analysisDate: new Date().toISOString(),
      holders,
      concentration: {
        top3: parseFloat(top3Percentage.toFixed(2)),
        top5: parseFloat(top5Percentage.toFixed(2)),
        top10: parseFloat(top10Percentage.toFixed(2))
      },
      risk: {
        level: concentrationRisk,
        score: riskLevel,
        description: `Top ${topN} holders control ${top10Percentage.toFixed(2)}% of supply`
      }
    };

  } catch (error) {
    console.error('Error in find_account_info:', error);
    return {
      error: `An error occurred while analyzing token holders: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * MCP Tool configuration for finding account info and holder analysis
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'find_account_info',
      description: 'Analyze SPL token holder concentration using Helius API. Fetches top holders, calculates ownership percentages, identifies likely account types (exchanges, pools), and assesses concentration risk.',
      parameters: {
        type: 'object',
        properties: {
          tokenAddress: {
            type: 'string',
            description: 'The SPL token mint address to analyze (e.g., DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263 for BONK)'
          },
          topN: {
            type: 'number',
            description: 'Number of top holders to fetch and analyze (default: 10)',
            default: 10
          }
        },
        required: ['tokenAddress']
      }
    }
  }
};

export { apiTool };
