import { client } from "@/sanity/client";
import CoinAnalysisWrapper from "@/components/CoinAnalysisWrapper";

// Revalidate every 10 seconds
export const revalidate = 10;

async function getCoinData(address: string) {
  const query = `{
    "analysis": *[(_type == "riskReport" && tokenAddress == $address) || (_type == "risk" && coin->address == $address)] | order(coalesce(timestamp, assessedAt) desc)[0] {
      // New riskReport fields
      riskLevel,
      riskScore,
      concentration,
      recommendations,
      timestamp,
      tokenAddress,
      tokenName,
      tokenSymbol,
      // Legacy risk fields
      overallRisk,
      rugPullRisk,
      liquidityRisk,
      contractRisk,
      holderRisk,
      volatilityRisk,
      flags,
      recommendation,
      assessedAt,
      coin->{
        name,
        symbol,
        address,
        priceUsd,
        priceChange24h,
        volume24h,
        liquidity,
        marketCap,
        fdv,
        url,
        createdAt
      }
    },
    "logs": *[_type == "agentLog" && (tokenAddress == $address || coin->address == $address)] | order(timestamp desc)[0...5] {
      _id,
      action,
      status,
      message,
      timestamp
    }
  }`;

  let data: any = { analysis: null, logs: [] };

  try {
    data = await client.fetch(query, { address });
  } catch (error) {
    console.error("Sanity fetch error:", error);
  }

  // If no analysis found in Sanity, try to fetch from DexScreener
  if (!data.analysis) {
    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`
      );
      const dexData = await response.json();

      if (dexData.pairs && dexData.pairs.length > 0) {
        const bestPair = dexData.pairs.sort(
          (a: any, b: any) => b.liquidity.usd - a.liquidity.usd
        )[0];

        // Create a mock analysis object with DexScreener data
        data.analysis = {
          coin: {
            name: bestPair.baseToken.name,
            symbol: bestPair.baseToken.symbol,
            address: bestPair.baseToken.address,
            priceUsd: parseFloat(bestPair.priceUsd || "0"),
            priceChange24h: bestPair.priceChange?.h24 || 0,
            volume24h: bestPair.volume?.h24 || 0,
            liquidity: bestPair.liquidity?.usd || 0,
            marketCap: bestPair.marketCap || 0,
            fdv: bestPair.fdv || 0,
            url: bestPair.url,
          },
          overallRisk: "unknown",
          riskScore: 0,
          rugPullRisk: 0,
          liquidityRisk: 0,
          contractRisk: 0,
          holderRisk: 0,
          volatilityRisk: 0,
          flags: [],
          recommendation: "pending_analysis",
          assessedAt: new Date().toISOString(),
          fromDexScreener: true,
        };
      }
    } catch (error) {
      console.error("Failed to fetch from DexScreener:", error);
    }
  }

  return data;
}

function parseTokenAddress(addressSegments: string[]): string {
  // Handle different token path formats:
  // Simple: ["0x123..."] -> "0x123..."
  // Cosmos factory: ["factory", "creator", "subdenom"] -> "factory/creator/subdenom"  
  // Cosmos native: ["osmo1..."] -> "osmo1..."
  // IBC: ["ibc", "hash"] -> "ibc/hash"
  // Complex: ["factory", "osmo1z6r6...", "alloyed", "allBTC"] -> "factory/osmo1z6r6.../alloyed/allBTC"
  
  if (addressSegments.length === 1) {
    // Simple address
    return addressSegments[0];
  } else {
    // Multi-segment address (Cosmos tokens)
    return addressSegments.join('/');
  }
}

export default async function CoinPage({
  params,
}: {
  params: Promise<{ address: string[] }>;
}) {
  const { address: addressSegments } = await params;
  const fullAddress = parseTokenAddress(addressSegments);
  const data = await getCoinData(fullAddress);

  const { address: addressSegments } = await params;
  const fullAddress = parseTokenAddress(addressSegments);
  const data = await getCoinData(fullAddress);

  return (
    <CoinAnalysisWrapper 
      address={fullAddress}

  return (
    <CoinAnalysisWrapper 
      address={fullAddress} 
      sanityAnalysis={data.analysis} 
      logs={data.logs} 
    />
  );
}
