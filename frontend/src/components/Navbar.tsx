import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <Link href="/" className="text-xl font-semibold text-gray-900 tracking-tight">
              Crypto Risk Agent
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-500">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
