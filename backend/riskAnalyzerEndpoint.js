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
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_TOKEN;
    
    if (!projectId || !dataset || !token) {
      throw new Error('Missing Sanity configuration. Check SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_TOKEN in .env');
    }
    
    sanityClient = createClient({
      projectId,
      dataset,
      token,
      apiVersion: '2024-01-01',
      useCdn: false
    });
    
    console.log('🔧 Sanity client initialized:', { projectId, dataset });
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

    // Call the find_account_info MCP tool
    const accountInfo = await mcpClient.callTool({
      name: 'find_account_info',
      arguments: {
        tokenAddress: tokenAddress,
        topN: topN
      }
    });

    // Parse MCP response - handle nested content structure
    let parsedData = {};
    try {
      // MCP returns content array with text field
      if (accountInfo.content && Array.isArray(accountInfo.content)) {
        const textContent = accountInfo.content[0]?.text || accountInfo.content[0];
        parsedData = typeof textContent === 'string' ? JSON.parse(textContent) : textContent;
      } else if (typeof accountInfo.content === 'string') {
        parsedData = JSON.parse(accountInfo.content);
      } else {
        parsedData = accountInfo.content || {};
      }
    } catch (e) {
      console.error('Error parsing MCP response:', e);
      parsedData = { raw: accountInfo.content };
    }

    // Use concentration from MCP if available, otherwise calculate
    const concentration = parsedData.concentration || {
      top3: calculateConcentration(parsedData.holders || [], 3),
      top5: calculateConcentration(parsedData.holders || [], 5),
      top10: calculateConcentration(parsedData.holders || [], 10)
    };

    console.log('📊 Starting risk analysis for:', tokenAddress);
    
    // Perform basic risk analysis
    const riskAnalysis = analyzeRisk(parsedData, null);
    console.log('✅ Risk analysis complete:', riskAnalysis.riskLevel, `(${riskAnalysis.score}/100)`);

    // Prepare data for Sanity (without Claude first)
    const riskReport = {
      _type: 'tokenAnalysis',
      tokenAddress: tokenAddress,
      tokenName: parsedData.tokenName || parsedData.name || 'Unknown',
      tokenSymbol: parsedData.tokenSymbol || parsedData.symbol || 'Unknown',
      chain: 'solana',
      topHolders: formatTopHolders(parsedData.holders || [], topN),
      concentration: concentration,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      claudeReasoning: 'Analysis in progress...',
      recommendations: riskAnalysis.recommendations,
      rawJson: JSON.stringify(parsedData, null, 2),
      timestamp: new Date().toISOString()
    };

    console.log('💾 Saving initial report to Sanity...');
    console.log('   Token:', riskReport.tokenName, `(${riskReport.tokenSymbol})`);
    console.log('   Risk:', riskReport.riskLevel, `- Score: ${riskReport.riskScore}/100`);
    console.log('   Concentration: Top3=${concentration.top3}%, Top10=${concentration.top10}%');
    console.log('   Top Holders count:', riskReport.topHolders.length);
    
    // Save to Sanity
    let savedReport;
    try {
      savedReport = await getSanityClient().create(riskReport);
      console.log('✅ Report saved to Sanity with ID:', savedReport._id);
      console.log('   View at: https://production-agent-hack.sanity.studio/desk/tokenAnalysis;' + savedReport._id);
    } catch (sanityError) {
      console.error('❌ Sanity save error:', sanityError.message);
      if (sanityError.response?.body) {
        console.error('   Response body:', JSON.stringify(sanityError.response.body, null, 2));
      }
      throw sanityError;
    }

    // Now get Claude's reasoning asynchronously and update
    console.log('🤖 Requesting Claude AI analysis (async)...');
    getClaudeReasoning(parsedData, riskAnalysis, concentration)
      .then(async (claudeReasoning) => {
        console.log('✅ Claude analysis received, updating Sanity...');
        try {
          await getSanityClient()
            .patch(savedReport._id)
            .set({ claudeReasoning })
            .commit();
          console.log('✅ Claude analysis added to report:', savedReport._id);
        } catch (updateError) {
          console.error('❌ Failed to update with Claude analysis:', updateError.message);
        }
      })
      .catch((claudeError) => {
        console.error('❌ Claude analysis failed:', claudeError.message);
      });

    res.json({
      success: true,
      reportId: savedReport._id,
      tokenAddress: tokenAddress,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      concentration: riskReport.concentration,
      recommendations: riskAnalysis.recommendations,
      timestamp: new Date().toISOString(),
      note: 'Claude AI analysis will be added shortly'
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

    const accountInfo = await mcpClient.callTool({
      name: 'find_account_info',
      arguments: {
        tokenAddress: tokenAddress,
        topN: topN
      }
    });

    // Parse MCP response - handle nested content structure
    let parsedData = {};
    try {
      if (accountInfo.content && Array.isArray(accountInfo.content)) {
        const textContent = accountInfo.content[0]?.text || accountInfo.content[0];
        parsedData = typeof textContent === 'string' ? JSON.parse(textContent) : textContent;
      } else if (typeof accountInfo.content === 'string') {
        parsedData = JSON.parse(accountInfo.content);
      } else {
        parsedData = accountInfo.content || {};
      }
    } catch (e) {
      console.error('Error parsing MCP response:', e);
      parsedData = { raw: accountInfo.content };
    }

    // Use concentration from MCP if available
    const concentration = parsedData.concentration || {
      top3: calculateConcentration(parsedData.holders || [], 3),
      top5: calculateConcentration(parsedData.holders || [], 5),
      top10: calculateConcentration(parsedData.holders || [], 10)
    };

    console.log('📊 Quick analysis for:', tokenAddress);
    
    // Perform basic risk analysis
    const riskAnalysis = analyzeRisk(parsedData, null);
    console.log('✅ Risk level:', riskAnalysis.riskLevel, `(${riskAnalysis.score}/100)`);

    // Get Claude's reasoning
    console.log('🤖 Getting Claude analysis...');
    const claudeReasoning = await getClaudeReasoning(parsedData, riskAnalysis, concentration);
    console.log('✅ Analysis complete');

    res.json({
      success: true,
      tokenAddress: tokenAddress,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.score,
      claudeReasoning: claudeReasoning,
      concentration: concentration,
      topHolders: parsedData.holders || [],
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
    let data = accountData;
    let riskScore = 50;

    // Get holders array (could be 'holders' or 'topHolders')
    const holders = data.holders || data.topHolders || [];
    
    // Analyze holder concentration
    if (holders && Array.isArray(holders) && holders.length > 0) {
      
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

async function getClaudeReasoning(accountData, riskAnalysis, concentration) {
  try {
    const holders = accountData.holders || accountData.topHolders || [];
    const totalSupply = accountData.totalSupply || 'Unknown';
    const tokenInfo = `${accountData.tokenName || accountData.name || 'Unknown'} (${accountData.tokenSymbol || accountData.symbol || 'Unknown'})`;
    
    // Use provided concentration or calculate
    const top3Concentration = concentration?.top3 || holders.slice(0, 3).reduce((sum, h) => sum + (h.percentage || 0), 0);
    const top5Concentration = concentration?.top5 || holders.slice(0, 5).reduce((sum, h) => sum + (h.percentage || 0), 0);
    const top10Concentration = concentration?.top10 || holders.slice(0, 10).reduce((sum, h) => sum + (h.percentage || 0), 0);
    const exchangeCount = holders.filter(h => 
      (h.type || h.accountType || '').toLowerCase().includes('exchange') || 
      (h.type || h.accountType || '').toLowerCase().includes('pool')
    ).length;

    const prompt = `You are an expert cryptocurrency risk analyst specializing in Solana tokens. Analyze this token's holder distribution and provide a professional risk assessment.

TOKEN: ${tokenInfo}
TOTAL SUPPLY: ${totalSupply}

HOLDER CONCENTRATION:
- Top 3 holders control: ${top3Concentration.toFixed(2)}%
- Top 5 holders control: ${top5Concentration.toFixed(2)}%
- Top 10 holders control: ${top10Concentration.toFixed(2)}%
- Exchange/Pool addresses: ${exchangeCount} out of top 10

TOP HOLDERS BREAKDOWN:
${holders.slice(0, 10).map((h, i) => 
  `${i + 1}. ${h.percentage?.toFixed(2)}% - ${h.accountType || h.type || 'Unknown'} (${h.walletOwner || h.owner || 'Unknown'})`
).join('\n')}

PRELIMINARY RISK ASSESSMENT:
- Risk Level: ${riskAnalysis.riskLevel}
- Risk Score: ${riskAnalysis.score}/100
- Key Factors: ${riskAnalysis.factors.join('; ')}

Provide a detailed professional analysis covering:

1. **Holder Distribution Analysis**: Evaluate the concentration levels and what they indicate about token centralization
2. **Red Flags & Warning Signs**: Identify any suspicious patterns, whale dominance, or manipulation risks
3. **Liquidity Assessment**: Analyze the presence of exchange/pool addresses and their implications
4. **Market Manipulation Risk**: Assess the potential for price manipulation based on holder concentration
5. **Investment Recommendation**: Clear guidance on risk level and precautions investors should take

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
    console.error('Claude API error:', error);
    return `Risk analysis completed with ${riskAnalysis.riskLevel} risk level (${riskAnalysis.score}/100). ${riskAnalysis.factors.join('. ')}`;
  }
}

function formatTopHolders(holders, topN) {
  const formatted = [];
  
  // Process actual holders
  for (let i = 0; i < Math.min(holders.length, topN); i++) {
    const holder = holders[i];
    formatted.push({
      _key: `holder-${i + 1}-${Date.now()}`,
      rank: i + 1,
      walletOwner: holder.owner || holder.walletOwner || holder.address || 'Unknown',
      tokenAccount: holder.address || holder.tokenAccount || holder.account || 'Unknown',
      balance: parseFloat(holder.balance) || 0,
      percentage: parseFloat(holder.percentage) || 0,
      accountType: holder.type || holder.accountType || 'Unknown'
    });
  }

  // Pad to exactly 10 holders as required by Sanity schema
  while (formatted.length < 10) {
    formatted.push({
      _key: `holder-${formatted.length + 1}-${Date.now()}`,
      rank: formatted.length + 1,
      walletOwner: 'N/A',
      tokenAccount: 'N/A',
      balance: 0,
      percentage: 0,
      accountType: 'N/A'
    });
  }

  // Ensure exactly 10 (trim if somehow more)
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
