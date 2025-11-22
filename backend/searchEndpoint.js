import { createClient } from '@sanity/client';
import express from 'express';

const router = express.Router();

// Lazy-load Sanity client to ensure env vars are loaded
let sanityClient = null;

function getSanityClient() {
  if (!sanityClient) {
    sanityClient = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || 'production',
      token: process.env.SANITY_TOKEN,
      apiVersion: '2024-01-01',
      useCdn: false,
    });
  }
  return sanityClient;
}

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

    // Save to Sanity.io
    console.log('Saving results to Sanity.io...');
    
    try {
      const client = getSanityClient();
      
      // Create individual coin documents
      const coinPromises = formattedData.map(coin => 
        client.create({
          _type: 'coin',
          ...coin
        })
      );
      
      const savedCoins = await Promise.all(coinPromises);
      console.log(`Saved ${savedCoins.length} coins to Sanity`);

      // Create coinList document with coins array (add _key to each coin)
      const coinsWithKeys = formattedData.map(coin => ({
        _key: crypto.randomUUID(),
        ...coin
      }));

      const coinList = await client.create({
        _type: 'coinList',
        query: query,
        timestamp: new Date().toISOString(),
        count: formattedData.length,
        coins: coinsWithKeys
      });

      console.log('Created coinList document:', coinList._id);

      res.json({
        success: true,
        query: query,
        data: formattedData,
        count: formattedData.length,
        timestamp: new Date().toISOString(),
        sanity: {
          coinListId: coinList._id,
          coinsCreated: savedCoins.length
        }
      });
    } catch (sanityError) {
      console.error('Sanity save error:', sanityError);
      // Still return the data even if Sanity save fails
      res.json({
        success: true,
        query: query,
        data: formattedData,
        count: formattedData.length,
        timestamp: new Date().toISOString(),
        sanityError: sanityError.message
      });
    }

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
