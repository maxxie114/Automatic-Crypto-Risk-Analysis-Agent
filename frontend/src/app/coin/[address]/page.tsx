import { client } from "@/sanity/client";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  DollarSign,
  Activity,
  Users,
  Lock,
} from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import AnalyzeButton from "@/components/AnalyzeButton";

// Revalidate every 10 seconds
export const revalidate = 10;

async function getCoinData(address: string) {
  const query = `{
    "analysis": *[_type == "risk" && coin->address == $address] | order(assessedAt desc)[0] {
      overallRisk,
      riskScore,
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
    "logs": *[_type == "agentLog" && coin->address == $address] | order(timestamp desc)[0...5] {
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

export default async function CoinPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const data = await getCoinData(address);
  const analysis = data.analysis;

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Coin Not Found</h2>
        <p className="mt-2 text-gray-600">
          No analysis data found for this address.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const coin = analysis.coin;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
              {coin.symbol[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {coin.name}{" "}
                <span className="text-gray-400 font-normal text-lg">
                  ({coin.symbol})
                </span>
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mt-1">
                {coin.address}
                {coin.url && (
                  <a
                    href={coin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${coin.priceUsd?.toFixed(8)}
              </p>
              <p
                className={`text-sm font-medium ${coin.priceChange24h >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {coin.priceChange24h > 0 ? "+" : ""}
                {coin.priceChange24h?.toFixed(2)}% (24h)
              </p>
            </div>
            <div className="pl-4 border-l border-gray-200">
              <RiskBadge
                level={analysis.overallRisk}
                score={analysis.riskScore}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Analysis Notice */}
      {analysis.fromDexScreener && (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  Pending Risk Analysis
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  This token has not been analyzed yet. The data shown is from
                  DexScreener. Click the button to trigger an automated risk
                  analysis now.
                </p>
              </div>
            </div>
            <div className="w-full md:w-auto md:min-w-[200px]">
              <AnalyzeButton
                tokenAddress={coin.address}
                tokenSymbol={coin.symbol}
                tokenName={coin.name}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Risk Score Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Risk Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Risk Score</span>
                    <span className="font-medium text-gray-900">
                      {analysis.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        analysis.riskScore > 70
                          ? "bg-red-500"
                          : analysis.riskScore > 40
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${analysis.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">
                      Rug Pull Risk
                    </div>
                    <div
                      className={`text-lg font-semibold ${analysis.rugPullRisk > 50 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {analysis.rugPullRisk}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">
                      Liquidity Risk
                    </div>
                    <div
                      className={`text-lg font-semibold ${analysis.liquidityRisk > 50 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {analysis.liquidityRisk}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">
                      Contract Risk
                    </div>
                    <div
                      className={`text-lg font-semibold ${analysis.contractRisk > 50 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {analysis.contractRisk}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">
                      Holder Risk
                    </div>
                    <div
                      className={`text-lg font-semibold ${analysis.holderRisk > 50 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {analysis.holderRisk}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-gray-100 pl-0 md:pl-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Risk Flags
                </h3>
                {analysis.flags && analysis.flags.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.flags.map((flag: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-start p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-900 capitalize">
                            {flag.type?.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-red-700 mt-0.5">
                            {flag.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm">No critical risk flags detected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Market Data */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Market Data
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <DollarSign className="h-3.5 w-3.5" /> Market Cap
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ${coin.marketCap?.toLocaleString() || "-"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Activity className="h-3.5 w-3.5" /> Volume (24h)
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ${coin.volume24h?.toLocaleString() || "-"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Lock className="h-3.5 w-3.5" /> Liquidity
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ${coin.liquidity?.toLocaleString() || "-"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Users className="h-3.5 w-3.5" /> FDV
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ${coin.fdv?.toLocaleString() || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Recommendation
            </h2>
            <div
              className={`p-4 rounded-lg border ${
                analysis.recommendation === "safe"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : analysis.recommendation === "caution"
                    ? "bg-amber-50 border-amber-100 text-amber-800"
                    : "bg-red-50 border-red-100 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-lg mb-1 capitalize">
                {analysis.recommendation === "safe" && (
                  <CheckCircle className="h-5 w-5" />
                )}
                {analysis.recommendation === "caution" && (
                  <AlertTriangle className="h-5 w-5" />
                )}
                {["not_recommended", "blocked"].includes(
                  analysis.recommendation
                ) && <XCircle className="h-5 w-5" />}
                {analysis.recommendation?.replace(/_/g, " ")}
              </div>
              <p className="text-sm opacity-90">
                Based on automated analysis of contract security, liquidity, and
                holder distribution.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {data.logs.map((log: any) => (
                <div
                  key={log._id}
                  className="text-sm border-l-2 border-gray-100 pl-3 py-1"
                >
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
              {data.logs.length === 0 && (
                <p className="text-sm text-gray-500">
                  No recent activity logs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
