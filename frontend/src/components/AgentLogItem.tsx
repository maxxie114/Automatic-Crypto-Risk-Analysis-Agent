import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface AgentLogItemProps {
  log: {
    agentType: string
    action: string
    status: string
    message: string
    timestamp: string
    severity?: string
  }
}

export default function AgentLogItem({ log }: AgentLogItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg">
      <div className="mt-0.5">{getStatusIcon(log.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <p className="text-sm font-medium text-gray-900 truncate">
            {log.action}
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{log.message}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 uppercase tracking-wider">
            {log.agentType.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  )
}
