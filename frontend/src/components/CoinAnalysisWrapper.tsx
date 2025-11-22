"use client";

import { useEffect, useState } from "react";
import CoinPageContent from "./CoinPageContent";

interface AnalysisData {
  tokenAddress: string;
  riskLevel: string;
  riskScore: number;
  concentration?: {
    top3: number;
    top5: number;
    top10: number;
  };
  recommendations?: string[];
  timestamp: string;
  reportId?: string;
}

interface Props {
  address: string;
  sanityAnalysis: any;
  logs: any[];
}

export default function CoinAnalysisWrapper({ address, sanityAnalysis, logs }: Props) {
  const [analysis, setAnalysis] = useState(sanityAnalysis);

  useEffect(() => {
    console.log('CoinAnalysisWrapper: Checking localStorage for address:', address);
    console.log('CoinAnalysisWrapper: Current sanityAnalysis:', sanityAnalysis);
    
    // Check localStorage for recent analysis
    const stored = localStorage.getItem(`analysis_${address}`);
    console.log('CoinAnalysisWrapper: localStorage data:', stored);
    
    if (stored) {
      try {
        const localAnalysis: AnalysisData = JSON.parse(stored);
        console.log('CoinAnalysisWrapper: Parsed localStorage analysis:', localAnalysis);
        
        // Check if it's recent (within last hour)
        const analysisTime = new Date(localAnalysis.timestamp).getTime();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        console.log('CoinAnalysisWrapper: Analysis time:', analysisTime, 'Current time:', now, 'Diff:', now - analysisTime);
        
        if (now - analysisTime < oneHour) {
          // Convert localStorage data to match expected format
          const formattedAnalysis = {
            riskLevel: localAnalysis.riskLevel,
            riskScore: localAnalysis.riskScore,
            concentration: localAnalysis.concentration,
            recommendations: localAnalysis.recommendations,
            timestamp: localAnalysis.timestamp,
            tokenAddress: localAnalysis.tokenAddress,
            tokenName: sanityAnalysis?.tokenName || sanityAnalysis?.coin?.name || "Unknown",
            tokenSymbol: sanityAnalysis?.tokenSymbol || sanityAnalysis?.coin?.symbol || "Unknown",
            // Legacy fields
            overallRisk: localAnalysis.riskLevel?.toLowerCase(),
            rugPullRisk: null,
            liquidityRisk: null,
            contractRisk: null,
            holderRisk: null,
            volatilityRisk: null,
            flags: null,
            recommendation: null,
            assessedAt: localAnalysis.timestamp,
            coin: null,
            fromLocalStorage: true
          };
          
          setAnalysis(formattedAnalysis);
          console.log('Using analysis from localStorage:', formattedAnalysis);
        } else {
          // Remove old analysis
          console.log('CoinAnalysisWrapper: Analysis too old, removing from localStorage');
          localStorage.removeItem(`analysis_${address}`);
        }
      } catch (error) {
        console.error('Error parsing localStorage analysis:', error);
        localStorage.removeItem(`analysis_${address}`);
      }
    } else {
      console.log('CoinAnalysisWrapper: No localStorage data found');
    }
  }, [address, sanityAnalysis]);

  return <CoinPageContent address={address} analysis={analysis} logs={logs} />;
}