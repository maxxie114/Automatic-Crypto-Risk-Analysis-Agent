import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'dxrx4i9g',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

/**
 * Create or update a coin document in Sanity
 */
export async function upsertCoin(tokenData) {
  if (!tokenData || !tokenData.address) {
    throw new Error('Token address is required');
  }

  const coinDoc = {
    _type: 'coin',
    address: tokenData.address,
    symbol: tokenData.symbol || '',
    name: tokenData.name || '',
    chainId: tokenData.chainId || '',
    priceUsd: tokenData.priceUsd || 0,
    priceChange24h: tokenData.priceChange24h || 0,
    volume24h: tokenData.volume24h || 0,
    liquidity: tokenData.liquidity || 0,
    marketCap: tokenData.marketCap || 0,
    fdv: tokenData.fdv || 0,
    url: tokenData.url || '',
    pairAddress: tokenData.pairAddress || '',
    dexId: tokenData.dexId || '',
    createdAt: new Date().toISOString(),
  };

  // Check if coin already exists
  const existingCoin = await sanityClient.fetch(
    `*[_type == "coin" && address == $address][0]`,
    { address: tokenData.address }
  );

  if (existingCoin) {
    // Update existing coin
    return await sanityClient
      .patch(existingCoin._id)
      .set(coinDoc)
      .commit();
  } else {
    // Create new coin
    return await sanityClient.create(coinDoc);
  }
}

/**
 * Create a risk assessment document in Sanity
 */
export async function createRiskAssessment(coinId, riskAnalysis) {
  const riskDoc = {
    _type: 'risk',
    coin: {
      _type: 'reference',
      _ref: coinId,
    },
    overallRisk: mapRiskLevel(riskAnalysis.riskLevel),
    riskScore: riskAnalysis.score || 50,
    rugPullRisk: 0, // Can be enhanced later
    liquidityRisk: extractLiquidityRisk(riskAnalysis.factors),
    contractRisk: 0, // Can be enhanced later
    holderRisk: 0, // Can be enhanced later
    volatilityRisk: extractVolatilityRisk(riskAnalysis.factors),
    flags: riskAnalysis.factors.map((factor, index) => ({
      _key: `flag-${Date.now()}-${index}`,
      type: categorizeFlag(factor),
      severity: getSeverityFromFactor(factor),
      description: factor,
      detectedAt: new Date().toISOString(),
    })),
    recommendation: mapRecommendation(riskAnalysis.riskLevel),
    assessedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  return await sanityClient.create(riskDoc);
}

/**
 * Helper functions to map backend data to Sanity schema
 */
function mapRiskLevel(level) {
  const mapping = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
    'CRITICAL': 'critical',
    'UNKNOWN': 'medium'
  };
  return mapping[level] || 'medium';
}

function mapRecommendation(riskLevel) {
  const mapping = {
    'LOW': 'safe',
    'MEDIUM': 'caution',
    'HIGH': 'not_recommended',
    'CRITICAL': 'blocked',
    'UNKNOWN': 'caution'
  };
  return mapping[riskLevel] || 'caution';
}

function extractLiquidityRisk(factors) {
  const liquidityFactor = factors.find(f => f.toLowerCase().includes('liquidity'));
  if (!liquidityFactor) return 50;
  
  if (liquidityFactor.includes('LOW') || liquidityFactor.includes('HIGH RISK')) {
    return 80;
  } else if (liquidityFactor.includes('Moderate')) {
    return 50;
  } else if (liquidityFactor.includes('Good')) {
    return 20;
  }
  return 50;
}

function extractVolatilityRisk(factors) {
  const volatilityFactor = factors.find(f => f.toLowerCase().includes('volatility'));
  if (!volatilityFactor) return 50;
  
  if (volatilityFactor.includes('Extreme')) {
    return 90;
  } else if (volatilityFactor.includes('High')) {
    return 70;
  }
  return 30;
}

function categorizeFlag(factor) {
  const lowerFactor = factor.toLowerCase();
  
  if (lowerFactor.includes('liquidity')) return 'low_liquidity';
  if (lowerFactor.includes('volatility')) return 'pump_dump_pattern';
  if (lowerFactor.includes('market cap')) return 'suspicious_holders';
  if (lowerFactor.includes('tax') || lowerFactor.includes('fee')) return 'high_tax';
  
  return 'unverified_contract';
}

function getSeverityFromFactor(factor) {
  const lowerFactor = factor.toLowerCase();
  
  if (lowerFactor.includes('high risk') || lowerFactor.includes('extreme')) {
    return 'critical';
  } else if (lowerFactor.includes('very low') || lowerFactor.includes('low')) {
    return 'high';
  } else if (lowerFactor.includes('moderate')) {
    return 'medium';
  }
  return 'low';
}

/**
 * Create a comprehensive risk report with holder analysis
 */
export async function createRiskReport(tokenData, riskAnalysis, holderAnalysis) {
  const reportDoc = {
    _type: 'riskReport',
    tokenAddress: tokenData.address,
    tokenName: tokenData.name || '',
    tokenSymbol: tokenData.symbol || '',
    chain: tokenData.chainId || 'unknown',
    riskLevel: riskAnalysis.riskLevel,
    riskScore: riskAnalysis.score || 50,
    recommendations: riskAnalysis.recommendations || [],
    timestamp: new Date().toISOString(),
  };

  // Add holder data if available
  if (holderAnalysis && holderAnalysis.topHolders) {
    reportDoc.topHolders = holderAnalysis.topHolders.slice(0, 10).map((holder, index) => ({
      _key: `holder-${Date.now()}-${index}`,
      rank: holder.rank || (index + 1),
      walletOwner: holder.owner || '',
      tokenAccount: holder.address || '',
      balance: holder.balance || 0,
      percentage: holder.percentage || 0,
      accountType: holder.accountType || 'unknown'
    }));

    reportDoc.concentration = {
      top3: holderAnalysis.concentration?.top3 || 0,
      top5: holderAnalysis.concentration?.top5 || 0,
      top10: holderAnalysis.concentration?.top10 || 0
    };

    // Add holder-based risk factors
    const top10Concentration = holderAnalysis.concentration?.top10 || 0;
    if (top10Concentration > 80) {
      reportDoc.riskLevel = 'CRITICAL';
      reportDoc.riskScore = Math.max(reportDoc.riskScore, 90);
    } else if (top10Concentration > 60) {
      reportDoc.riskLevel = 'HIGH';
      reportDoc.riskScore = Math.max(reportDoc.riskScore, 75);
    }
  }

  // Add raw analysis data
  reportDoc.rawJson = JSON.stringify({
    tokenData,
    riskAnalysis,
    holderAnalysis
  }, null, 2);

  return await sanityClient.create(reportDoc);
}
