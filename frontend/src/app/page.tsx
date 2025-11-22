"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    // Check if input is an address (simple check for Ethereum-style addresses)
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(searchQuery);

    if (isAddress) {
      // Direct to coin page if it's an address
      router.push(`/coin/${searchQuery}`);
    } else {
      // Redirect to search results page for name/symbol searches
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-3xl text-center space-y-8 -mt-20">
        {/* Hero Text */}
        <div className="space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            <span>AI-Powered Risk Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Analyze Crypto Risk <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              In Seconds
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Instant, automated security audits for any token. Detect honeypots,
            rug pulls, and liquidity risks before you trade.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex items-center gap-2">
            <div className="pl-4 text-gray-400">
              <Search className="h-6 w-6" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or address (e.g., 'Bitcoin' or '0x...')"
              className="flex-1 h-14 bg-transparent border-none focus:ring-0 text-lg text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:scale-[1.02]"
            >
              Search <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Features / Social Proof */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Contract Audit</h3>
            <p className="text-sm text-gray-500">
              Automated verification of contract code and ownership.
            </p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Real-time Scanning</h3>
            <p className="text-sm text-gray-500">
              Live monitoring of liquidity changes and trading patterns.
            </p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Deep Analysis</h3>
            <p className="text-sm text-gray-500">
              Holder distribution and historical behavior tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
