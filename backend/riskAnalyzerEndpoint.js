import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@sanity/client';
import express from 'express';

const router = express.Router();

// Initialize clients lazily to ensure env vars are loaded
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
    sanityClient = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      token: process.env.SANITY_TOKEN,
      apiVersion: '2024-01-01',
      useCdn: false
    });
  }
  return sanityClient;
}

router.post('/analyze', async (req, res) => {
  const { tokenAddress, topN = 10 } = req.body;

  if (!tokenAddress) {
    return res.status(400).json({
      error: 'Missing required field: tokenAddress'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log(`Analyzing risk for token address: ${tokenAddress}`);

    // Call the find_account_info MCP tool
    const accountInfo = await mcpClient.callTool({
      name: 'find_account_info',
      arguments: {
        tokenAddress: tokenAddress,
        topN: topN
      }
    });

    // Parse account data
    let parsedData = accountInfo.content;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        parsedData = { raw: accountInfo.content };
      }
    }

    // Perform basic risk analysis
    const riskAnalysis = analyzeRisk(accountInfo.content, null);

    // Get Claude's reasoning
    const claudeReasoning = await getClaudeReasoning(parsedData, riskAnalysis);

    // Prepare data for Sanity
    const riskReport = {
      _type: 'riskReport',
      tokenAddress: tokenAddress,
      tokenName: parsedData.tokenName || parsedData.name || 'Unknown',
      tokenSymbol: parsedData.tokenSymbol || parsedData.symbol || 'Unknown',
      chain: 'solana',
      topHolders: formatTopHolders(parsedData.topHolders || [], topN),
      concentration: {
        top3: calculateConcentration(parsedData.topHolders || [], 3),
        top5: calculateConcentration(parsedData.topHolders || [], 5),
        top10: calculateConcentration(parsedData.topHolders || [], 10)
      },
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      claudeReasoning: claudeReasoning,
      recommendations: riskAnalysis.recommendations,
      rawJson: JSON.stringify(parsedData, null, 2),
      timestamp: new Date().toISOString()
    };

    // Save to Sanity
    const savedReport = await getSanityClient().create(riskReport);

    res.json({
      success: true,
      reportId: savedReport._id,
      tokenAddress: tokenAddress,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      claudeReasoning: claudeReasoning,
      concentration: riskReport.concentration,
      recommendations: riskAnalysis.recommendations,
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

router.get('/:tokenAddress', async (req, res) => {
  const { tokenAddress } = req.params;
  const topN = parseInt(req.query.topN) || 10;

  if (!tokenAddress) {
    return res.status(400).json({
      error: 'Missing required parameter: tokenAddress'
    });
  }

  try {
    const mcpClient = req.mcpClient;

    if (!mcpClient) {
      return res.status(503).json({
        error: 'MCP client not initialized'
      });
    }

    console.log(`Fetching risk data for token address: ${tokenAddress}`);

    const accountInfo = await mcpClient.callTool({
      name: 'find_account_info',
      arguments: {
        tokenAddress: tokenAddress,
        topN: topN
      }
    });

    // Parse account data
    let parsedData = accountInfo.content;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        parsedData = { raw: accountInfo.content };
      }
    }

    // Perform basic risk analysis
    const riskAnalysis = analyzeRisk(accountInfo.content, null);

    // Get Claude's reasoning
    const claudeReasoning = await getClaudeReasoning(parsedData, riskAnalysis);

    res.json({
      success: true,
      tokenAddress: tokenAddress,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      claudeReasoning: claudeReasoning,
      concentration: {
        top3: calculateConcentration(parsedData.topHolders || [], 3),
        top5: calculateConcentration(parsedData.topHolders || [], 5),
        top10: calculateConcentration(parsedData.topHolders || [], 10)
      },
      recommendations: riskAnalysis.recommendations,
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

function analyzeRisk(accountData, apiResults) {
  const analysis = {
    riskLevel: 'UNKNOWN',
    score: 0,
    factors: [],
    recommendations: [],
    concentrationMetrics: {}
  };

  try {
    // Parse the account data if it's a string
    let data = accountData;
    if (typeof accountData === 'string') {
      try {
        data = JSON.parse(accountData);
      } catch (e) {
        data = { raw: accountData };
      }
    }

    let riskScore = 50;

    // Analyze holder concentration
    if (data.topHolders && Array.isArray(data.topHolders)) {
      const holders = data.topHolders;
      
      // Calculate concentration metrics
      const totalPercentage = holders.reduce((sum, h) => sum + (h.percentage || 0), 0);
      analysis.concentrationMetrics.topHoldersPercentage = totalPercentage;
      analysis.concentrationMetrics.holderCount = holders.length;

      // High concentration risk
      if (totalPercentage > 70) {
        riskScore += 25;
        analysis.factors.push(`HIGH CONCENTRATION: Top holders control ${totalPercentage.toFixed(2)}% of supply`);
      } else if (totalPercentage > 50) {
        riskScore += 15;
        analysis.factors.push(`MEDIUM CONCENTRATION: Top holders control ${totalPercentage.toFixed(2)}% of supply`);
      } else {
        riskScore -= 10;
        analysis.factors.push(`Good distribution: Top holders control ${totalPercentage.toFixed(2)}% of supply`);
      }

      // Check for exchange/pool addresses
      const exchangeCount = holders.filter(h => 
        h.type && (h.type.toLowerCase().includes('exchange') || h.type.toLowerCase().includes('pool'))
      ).length;

      if (exchangeCount > 0) {
        riskScore -= 5;
        analysis.factors.push(`${exchangeCount} exchange/pool addresses detected (positive)`);
      }

      // Check for suspicious patterns
      const suspiciousCount = holders.filter(h => 
        h.type && h.type.toLowerCase().includes('suspicious')
      ).length;

      if (suspiciousCount > 0) {
        riskScore += 20;
        analysis.factors.push(`WARNING: ${suspiciousCount} suspicious addresses detected`);
      }
    }

    // Check for risk indicators in the data
    const dataStr = JSON.stringify(data).toLowerCase();

    if (dataStr.includes('scam') || dataStr.includes('fraud') || dataStr.includes('rug')) {
      riskScore += 30;
      analysis.factors.push('ALERT: Scam/fraud indicators detected');
    }

    if (dataStr.includes('verified') || dataStr.includes('audit')) {
      riskScore -= 15;
      analysis.factors.push('Token appears to be verified/audited');
    }

    if (dataStr.includes('locked') || dataStr.includes('vested')) {
      riskScore -= 10;
      analysis.factors.push('Liquidity appears to be locked/vested');
    }

    // Additional API results analysis
    if (apiResults) {
      const apiStr = JSON.stringify(apiResults).toLowerCase();

      if (apiStr.includes('error') || apiStr.includes('failed')) {
        riskScore += 10;
        analysis.factors.push('API errors detected during analysis');
      }
    }

    analysis.score = Math.max(0, Math.min(100, riskScore));

    // Determine risk level and recommendations
    if (analysis.score < 30) {
      analysis.riskLevel = 'LOW';
      analysis.recommendations.push('Token shows relatively low risk based on holder distribution');
      analysis.recommendations.push('Continue monitoring for changes in holder concentration');
    } else if (analysis.score < 60) {
      analysis.riskLevel = 'MEDIUM';
      analysis.recommendations.push('Exercise caution - moderate risk detected');
      analysis.recommendations.push('Monitor holder concentration and trading patterns');
      analysis.recommendations.push('Verify token legitimacy through multiple sources');
    } else {
      analysis.riskLevel = 'HIGH';
      analysis.recommendations.push('⚠️ HIGH RISK: Proceed with extreme caution');
      analysis.recommendations.push('Significant holder concentration or suspicious patterns detected');
      analysis.recommendations.push('Conduct thorough due diligence before any investment');
      analysis.recommendations.push('Consider consulting with security experts');
    }

  } catch (error) {
    console.error('Error in risk analysis:', error);
    analysis.factors.push('Error analyzing data: ' + error.message);
  }

  return analysis;
}

async function getClaudeReasoning(accountData, riskAnalysis) {
  try {
    const prompt = `You are a cryptocurrency risk analyst. Analyze the following token holder data and provide a detailed risk assessment.

Token Data:
${JSON.stringify(accountData, null, 2)}

Preliminary Risk Analysis:
- Risk Level: ${riskAnalysis.riskLevel}
- Risk Score: ${riskAnalysis.score}/100
- Key Factors: ${riskAnalysis.factors.join(', ')}

Please provide:
1. A comprehensive analysis of the holder distribution
2. Identification of any red flags or concerning patterns
3. Assessment of centralization risks
4. Evaluation of liquidity and market manipulation risks
5. Overall investment risk summary

Keep your response concise but thorough (300-500 words).`;

    const message = await getAnthropicClient().messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    return `Risk analysis completed with ${riskAnalysis.riskLevel} risk level (${riskAnalysis.score}/100). ${riskAnalysis.factors.join('. ')}`;
  }
}

function formatTopHolders(holders, topN) {
  const formatted = holders.slice(0, topN).map((holder, index) => ({
    rank: index + 1,
    walletOwner: holder.owner || holder.walletOwner || 'Unknown',
    tokenAccount: holder.address || holder.tokenAccount || 'Unknown',
    balance: holder.balance || 0,
    percentage: holder.percentage || 0,
    accountType: holder.type || holder.accountType || 'Unknown'
  }));

  // Ensure exactly 10 holders (pad with empty if needed)
  while (formatted.length < 10) {
    formatted.push({
      rank: formatted.length + 1,
      walletOwner: 'N/A',
      tokenAccount: 'N/A',
      balance: 0,
      percentage: 0,
      accountType: 'N/A'
    });
  }

  return formatted.slice(0, 10);
}

function calculateConcentration(holders, topN) {
  if (!holders || holders.length === 0) return 0;
  
  const topHolders = holders.slice(0, topN);
  const totalPercentage = topHolders.reduce((sum, holder) => {
    return sum + (holder.percentage || 0);
  }, 0);
  
  return Math.round(totalPercentage * 100) / 100;
}

export default router;
