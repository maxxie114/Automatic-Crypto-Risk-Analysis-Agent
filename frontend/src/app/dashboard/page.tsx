import { client } from '@/sanity/client'
import Link from 'next/link'
import { ArrowRight, ShieldAlert, Activity, Ban } from 'lucide-react'
import RiskBadge from '@/components/RiskBadge'
import AgentLogItem from '@/components/AgentLogItem'

// Revalidate every 10 seconds for real-time-ish updates
export const revalidate = 10

async function getDashboardData() {
  const query = `{
    "recentAnalysis": *[_type == "risk"] | order(assessedAt desc)[0...5] {
      _id,
      overallRisk,
      riskScore,
      assessedAt,
      coin->{
        name,
        symbol,
        address,
        priceUsd,
        priceChange24h
      }
    },
    "recentLogs": *[_type == "agentLog"] | order(timestamp desc)[0...10] {
      _id,
      agentType,
      action,
      status,
      message,
      timestamp,
      severity
    },
    "stats": {
      "totalAnalyzed": count(*[_type == "risk"]),
      "highRisk": count(*[_type == "risk" && overallRisk in ["high", "critical"]]),
      "blockedTx": count(*[_type == "blockedTx"])
    }
  }`

  return client.fetch(query)
}

export default async function Home() {
  const data = await getDashboardData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Real-time monitoring of crypto assets and agent activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Analyzed</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.totalAnalyzed}</p>
          <p className="text-xs text-gray-400 mt-1">Tokens processed</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">High Risk Detected</h3>
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.highRisk}</p>
          <p className="text-xs text-gray-400 mt-1">Critical threats identified</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Blocked Transactions</h3>
            <Ban className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.blockedTx}</p>
          <p className="text-xs text-gray-400 mt-1">Losses prevented</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Risk Assessments</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">Token</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">Price</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">Risk Level</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">Score</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentAnalysis.map((item: any) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {item.coin.symbol[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.coin.name}</p>
                            <p className="text-xs text-gray-500">{item.coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">${item.coin.priceUsd?.toFixed(6) || '0.00'}</p>
                        <p className={`text-xs ${item.coin.priceChange24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.coin.priceChange24h > 0 ? '+' : ''}{item.coin.priceChange24h?.toFixed(2)}%
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <RiskBadge level={item.overallRisk} score={item.riskScore} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 w-24">
                          <div 
                            className={`h-1.5 rounded-full ${
                              item.riskScore > 70 ? 'bg-red-500' : 
                              item.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${item.riskScore}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/coin/${item.coin.address}`}
                          className="text-sm text-gray-400 hover:text-blue-600 font-medium transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.recentAnalysis.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                        No analysis data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Live Agent Logs</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-[600px] overflow-y-auto">
            <div className="space-y-1">
              {data.recentLogs.map((log: any) => (
                <AgentLogItem key={log._id} log={log} />
              ))}
              {data.recentLogs.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No logs available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
