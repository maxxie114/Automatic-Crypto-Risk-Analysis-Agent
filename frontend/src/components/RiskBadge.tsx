import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'

interface RiskBadgeProps {
  level: string
  score: number
}

export default function RiskBadge({ level, score }: RiskBadgeProps) {
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-50 text-red-700 border-red-100'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'low':
      case 'very_low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'high':
        return <ShieldX className="h-3.5 w-3.5" />
      case 'medium':
        return <ShieldAlert className="h-3.5 w-3.5" />
      case 'low':
      case 'very_low':
        return <ShieldCheck className="h-3.5 w-3.5" />
      default:
        return <Shield className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getRiskColor(level)}`}>
      {getRiskIcon(level)}
      <span className="text-xs font-medium capitalize">{level?.replace('_', ' ')}</span>
      <span className="text-xs opacity-60 font-mono">({score})</span>
    </div>
  )
}
