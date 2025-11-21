import express from 'express';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { cryptoSymbol, collectionId, requestName } = req.body;

  if (!cryptoSymbol && !collectionId) {
    return res.status(400).json({
      error: 'Missing required field: either cryptoSymbol or collectionId is required'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log(`Analyzing risk for: ${cryptoSymbol || collectionId}`);

    let collectionData;

    if (cryptoSymbol) {
      const searchResult = await mcpClient.callTool({
        name: 'search_collections',
        arguments: {
          query: cryptoSymbol,
          searchType: 'all'
        }
      });
      collectionData = searchResult.content;
    } else {
      const getResult = await mcpClient.callTool({
        name: 'get_collection',
        arguments: {
          collectionId: collectionId
        }
      });
      collectionData = getResult.content;
    }

    let apiResults = null;
    if (collectionId && requestName) {
      try {
        apiResults = await mcpClient.callTool({
          name: 'send_request',
          arguments: {
            collectionId: collectionId,
            requestName: requestName
          }
        });
      } catch (error) {
        console.warn('Failed to send request:', error.message);
      }
    }

    const riskAnalysis = analyzeRisk(collectionData, apiResults);

    res.json({
      success: true,
      cryptoSymbol: cryptoSymbol,
      collectionId: collectionId,
      collectionData: collectionData,
      apiResults: apiResults,
      riskAnalysis: riskAnalysis,
      timestamp: new Date().toISOString()
    });

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

    const searchResult = await mcpClient.callTool({
      name: 'search_collections',
      arguments: {
        query: tokenId,
        searchType: 'all'
      }
    });

    const riskAnalysis = analyzeRisk(searchResult.content, null);

    res.json({
      success: true,
      tokenId: tokenId,
      data: searchResult.content,
      riskAnalysis: riskAnalysis,
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

function analyzeRisk(collectionData, apiResults) {
  const analysis = {
    riskLevel: 'UNKNOWN',
    score: 0,
    factors: [],
    recommendations: []
  };

  try {
    const dataStr = JSON.stringify(collectionData).toLowerCase();

    let riskScore = 50;

    if (dataStr.includes('security') || dataStr.includes('audit')) {
      riskScore -= 10;
      analysis.factors.push('Has security/audit mentions');
    }

    if (dataStr.includes('warning') || dataStr.includes('risk')) {
      riskScore += 15;
      analysis.factors.push('Contains warning/risk indicators');
    }

    if (dataStr.includes('verified') || dataStr.includes('official')) {
      riskScore -= 15;
      analysis.factors.push('Appears to be verified/official');
    }

    if (dataStr.includes('scam') || dataStr.includes('fraud')) {
      riskScore += 30;
      analysis.factors.push('Scam/fraud indicators detected');
    }

    if (apiResults) {
      const apiStr = JSON.stringify(apiResults).toLowerCase();

      if (apiStr.includes('error') || apiStr.includes('failed')) {
        riskScore += 10;
        analysis.factors.push('API errors detected');
      }

      if (apiStr.includes('success') && apiStr.includes('200')) {
        riskScore -= 5;
        analysis.factors.push('Successful API responses');
      }
    }

    analysis.score = Math.max(0, Math.min(100, riskScore));

    if (analysis.score < 30) {
      analysis.riskLevel = 'LOW';
      analysis.recommendations.push('This appears to be relatively safe based on available data');
    } else if (analysis.score < 60) {
      analysis.riskLevel = 'MEDIUM';
      analysis.recommendations.push('Exercise caution and conduct additional research');
      analysis.recommendations.push('Verify official sources and community feedback');
    } else {
      analysis.riskLevel = 'HIGH';
      analysis.recommendations.push('HIGH RISK: Proceed with extreme caution');
      analysis.recommendations.push('Conduct thorough due diligence before any investment');
      analysis.recommendations.push('Consider consulting with security experts');
    }

  } catch (error) {
    console.error('Error in risk analysis:', error);
    analysis.factors.push('Error analyzing data');
  }

  return analysis;
}

export default router;
