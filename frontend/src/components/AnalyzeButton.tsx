"use client";

import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { analyzeCryptoRisk } from "@/lib/api";

interface AnalyzeButtonProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
}

export default function AnalyzeButton({
  tokenAddress,
  tokenSymbol,
  tokenName,
}: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await analyzeCryptoRisk({
        cryptoSymbol: tokenSymbol,
        tokenAddress: tokenAddress,
      });

      if (response.success) {
        setSuccess(true);
        // Reload the page after 5 seconds to give Sanity time to save
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        setError(response.error || "Analysis failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || success}
        className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          success
            ? "bg-emerald-500 text-white cursor-not-allowed"
            : isAnalyzing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-[1.02]"
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing... (may take 10-15 seconds)
          </>
        ) : success ? (
          <>Analysis Complete</>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Run Risk Analysis
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-800">
            Analysis completed successfully! Refreshing...
          </p>
        </div>
      )}
    </div>
  );
}
