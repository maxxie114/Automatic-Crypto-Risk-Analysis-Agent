"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { searchCollections } from "@/lib/api";

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  chainId: string;
  priceUsd: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  marketCap?: number;
  fdv?: number;
  pairAddress: string;
  dexId: string;
  url: string;
  priceChange?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  txns24h?: {
    buys?: number;
    sells?: number;
  };
  volatilityRisk?: number;
  [key: string]: unknown;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      router.push("/");
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchCollections({
          query: query,
          searchType: "all",
        });

        if (response.success && response.data && response.data.length > 0) {
          setTokens(response.data);
        } else {
          setError("No tokens found matching your search.");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">
              Searching for &quot;{query}&quot;...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take 10-15 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Search
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Results Found
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Search
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-600 mt-2">
          Found {tokens.length} tokens for &quot;{query}&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tokens.map((token) => (
          <Link
            key={token.pairAddress}
            href={`/coin/${token.address}`}
            className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Token Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {token.symbol[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {token.name}
                    </h3>
                    <span className="text-gray-500 font-medium">
                      {token.symbol}
                    </span>
                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                      {token.chainId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono truncate">
                    {token.address}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-gray-600">
                      DEX:{" "}
                      <span className="font-medium text-gray-900">
                        {token.dexId}
                      </span>
                    </span>
                    {token.volatilityRisk !== undefined && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">
                          Volatility Risk:{" "}
                          <span
                            className={`font-medium ${
                              token.volatilityRisk > 50
                                ? "text-red-600"
                                : token.volatilityRisk > 30
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                            }`}
                          >
                            {token.volatilityRisk}%
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Stats */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {token.priceUsd.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </p>
                  {token.priceChange24h !== undefined && (
                    <div
                      className={`flex items-center justify-end gap-1 text-sm font-medium ${
                        token.priceChange24h >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {token.priceChange24h >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {token.priceChange24h > 0 ? "+" : ""}
                      {token.priceChange24h.toFixed(2)}% (24h)
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-right">
                  {token.volume24h !== undefined && (
                    <div>
                      <div className="text-gray-500 text-xs">Volume 24h</div>
                      <div className="font-medium text-gray-900">
                        $
                        {token.volume24h.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  )}
                  {token.liquidity !== undefined && (
                    <div>
                      <div className="text-gray-500 text-xs">Liquidity</div>
                      <div className="font-medium text-gray-900">
                        $
                        {token.liquidity.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  )}
                  {token.marketCap !== undefined && (
                    <div>
                      <div className="text-gray-500 text-xs">Market Cap</div>
                      <div className="font-medium text-gray-900">
                        $
                        {token.marketCap.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  )}
                  {token.fdv !== undefined && (
                    <div>
                      <div className="text-gray-500 text-xs">FDV</div>
                      <div className="font-medium text-gray-900">
                        $
                        {token.fdv.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(token.url, "_blank", "noopener,noreferrer");
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  View on DexScreener <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading search results...</p>
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
