import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      error: 'Missing required field: query'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log(`Searching for tokens: ${query}`);

    const result = await mcpClient.callTool({
      name: 'search_tokens',
      arguments: {
        q: query
      }
    });

    // Format the data
    console.log('Formatting search results...');
    
    const rawData = JSON.parse(result.content[0].text);
    const formattedData = rawData.pairs.map(pair => {
      // Calculate volatility risk based on price changes
      const priceChanges = pair.priceChange || {};
      const volatility = Math.abs(priceChanges.h24 || 0) + 
                        Math.abs(priceChanges.h6 || 0) * 0.5 + 
                        Math.abs(priceChanges.h1 || 0) * 0.3;
      const volatilityRisk = Math.min(100, Math.round(volatility * 2));

      return {
        address: pair.baseToken?.address || '',
        symbol: pair.baseToken?.symbol || '',
        name: pair.baseToken?.name || '',
        chainId: pair.chainId || '',
        priceUsd: parseFloat(pair.priceUsd) || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        marketCap: pair.marketCap || 0,
        fdv: pair.fdv || 0,
        pairAddress: pair.pairAddress || '',
        dexId: pair.dexId || '',
        url: pair.url || '',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        pairCreatedAt: pair.pairCreatedAt || null,
        priceChange: {
          m5: pair.priceChange?.m5 || 0,
          h1: pair.priceChange?.h1 || 0,
          h6: pair.priceChange?.h6 || 0,
          h24: pair.priceChange?.h24 || 0
        },
        txns24h: {
          buys: pair.txns?.h24?.buys || 0,
          sells: pair.txns?.h24?.sells || 0
        },
        volatilityRisk: volatilityRisk
      };
    });

    res.json({
      success: true,
      query: query,
      data: formattedData,
      count: formattedData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
      details: error.toString()
    });
  }
});

export default router;
