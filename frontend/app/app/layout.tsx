"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAppProvider } from '@/lib/providers'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  Bell, Search, Settings, ChevronDown, Activity, Sparkles, Check, X, 
  BarChart2, Target, Calendar, DollarSign, Brain, Users, CheckCircle2,
  FileText, LayoutDashboard, Megaphone, HelpCircle, Link2
} from 'lucide-react'
import { useWorkflowStatus } from '@/lib/providers/WorkflowStatusProvider'
import { WebsiteLoadingMotion } from '@/components/ui/website-loading-motion'
import { CommandPalette } from '@/components/ui/CommandPalette'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { auth, orchestrator, notifications } = useAppProvider()
  const { authState, user, activeWorkspace, activeBrand, logout } = auth
  const orchestratorProvider = orchestrator
  const { status: workflowStatus } = useWorkflowStatus()
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delay = setTimeout(async () => {
        setIsSearching(true)
        try {
          const res = await fetch('/api/search?q=' + encodeURIComponent(searchQuery), { headers: { 'X-Workspace-ID': activeWorkspace?.id, 'X-Brand-ID': activeBrand?.id }})
          if (res.ok) {
            setSearchResults(await res.json())
          }
        } finally {
          setIsSearching(false)
        }
      }, 300)
      return () => clearTimeout(delay)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, activeWorkspace?.id, activeBrand?.id])
  
  const [orchestratorConfig, setOrchestratorConfig] = useState<any>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    // Check if user already saw the cinematic loading motion this session
    const hasLoaded = typeof window !== 'undefined' ? sessionStorage.getItem('standbharat_session_loaded') : null
    if (!hasLoaded) {
      setIsInitialLoading(true)
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('standbharat_session_loaded', 'true')
        }
        setIsInitialLoading(false)
      }, 5200)
      return () => clearTimeout(timer)
    }
  }, [])

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isInitialLoading) return
    if (authState === 'loggedOut') {
      router.push('/landingpage')
    } else if (authState === 'needsOnboarding' || (authState === 'loggedIn' && user && !activeWorkspace && !user.has_workspace)) {
      router.push('/onboarding')
    }
  }, [authState, user, activeWorkspace, isInitialLoading, router])

  useEffect(() => {
    async function fetchStatus() {
      try {
        const config = await orchestratorProvider.getStatus()
        setOrchestratorConfig(config)
      } catch (e) {}
    }
    fetchStatus()
  }, [])

  if (authState === 'loading' || isInitialLoading) {
    return (
      <WebsiteLoadingMotion 
        title="STANDBHARAT"
        targetDurationMs={5000}
        onFinish={() => setIsInitialLoading(false)}
      />
    )
  }
  if (authState === 'loggedOut' || authState === 'needsOnboarding') return null

  return (
    <div className="flex flex-col h-screen bg-[#171515] overflow-hidden font-sans text-white selection:bg-[#8F0028] selection:text-white dashboard-dark app-theme">
      {/* Top Bar */}
      <header className="h-[52px] bg-[#1C1A1A] border-b border-[#373333] flex items-center justify-between px-4 shrink-0 z-50">
        
        {/* LEFT: Logo & Workspace */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="StandBharat Logo" width={28} height={28} className="object-contain" />
            <span className="font-bold text-[15px] tracking-tight">StandBharat <ChevronDown className="w-3 h-3 inline text-[#E5E7EB]" /></span>
          </div>
          
          <div className="h-4 w-px bg-[#373333]"></div>
          
          <div className="flex items-center gap-2 text-[13px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#242222] border border-[#373333] hover:bg-[#2A2828] cursor-pointer transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-[#E5E7EB]" />
              <span className="font-medium text-white">{activeWorkspace?.name || 'Workspace'}</span>
              <ChevronDown className="w-3 h-3 text-[#E5E7EB]" />
            </div>
            <Link 
              href="/app/analytics" 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#242222] cursor-pointer transition-colors text-[#E5E7EB] hover:text-white"
              title="Dedicated Website Analytics"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="font-medium">Analytics</span>
            </Link>
            <Link 
              href="/app/agent-log" 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                pathname === '/app/agent-log'
                  ? 'bg-[#2A2727] text-white border border-[#443F3F]'
                  : 'hover:bg-[#242222] text-[#E5E7EB] hover:text-white'
              }`}
              title="Live Agent Execution Logs & Telemetry"
            >
              <Activity className="w-3.5 h-3.5 text-white" />
              <span className="font-medium">Agent Log</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#800020] animate-pulse ml-0.5"></span>
            </Link>
          </div>
        </div>

        {/* CENTER: AI CMO Status */}
        {workflowStatus?.overall_status === 'PROCESSING' ? (
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <div className="h-2 w-2 rounded-full bg-[#800020] animate-pulse"></div>
             <span className="text-[13px] font-medium text-[#E5E7EB]">
               AI CMO is analyzing <span className="text-white font-semibold">{activeBrand?.website_url?.replace(/^https?:\/\//,'') || activeBrand?.name || 'brand'}</span>...
             </span>
          </div>
        ) : workflowStatus?.overall_status === 'COMPLETED' ? (
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <div className="h-2 w-2 rounded-full bg-[#800020]"></div>
             <span className="text-[13px] font-medium text-[#E5E7EB]">
               Brand Brain <span className="text-white font-semibold">Synced</span>
             </span>
          </div>
        ) : null}

        {/* RIGHT: Search & User */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative hidden lg:flex items-center w-64 bg-[#242222] border border-[#373333] hover:border-[#524B4B] rounded-md py-1.5 px-3 text-[13px] text-[#E5E7EB] cursor-pointer transition-colors justify-between group shadow-sm"
            title="Press Cmd+K or Ctrl+K to open QuickCommand"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#E5E7EB] group-hover:text-white transition-colors" />
              <span className="group-hover:text-white transition-colors">Search or ask anything...</span>
            </div>
            <kbd className="text-[10px] font-mono text-white bg-[#1C1A1A] border border-[#373333] px-1.5 py-0.5 rounded shadow-sm">
              ⌘K
            </kbd>
          </div>
          <div className="hidden">
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search or ask anything..." 
            />
            {searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-[#1C1A1A] border border-[#373333] rounded-md shadow-lg overflow-hidden z-50 flex flex-col max-h-[300px]">
                {isSearching ? (
                  <div className="p-3 text-[12px] text-[#E5E7EB] text-center">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-[12px] text-[#E5E7EB] text-center">No results found</div>
                ) : (
                  <div className="overflow-y-auto">
                    {searchResults.map(res => (
                      <Link href={res.url} key={res.id} onClick={() => setSearchQuery('')} className="block p-2 hover:bg-[#2A2828] border-b border-[#373333] last:border-0 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-[13px] text-white">{res.title}</span>
                          <span className="text-[10px] uppercase text-[#E5E7EB] px-1 bg-[#242222] rounded">{res.type}</span>
                        </div>
                        {res.description && <p className="text-[11px] text-[#E5E7EB] line-clamp-1 mt-0.5">{res.description}</p>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>


          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-[#242222] text-[#E5E7EB] hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications?.unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#1C1A1A] border border-[#373333] rounded-md shadow-lg overflow-hidden z-50 flex flex-col max-h-[400px]">
                <div className="px-4 py-2 border-b border-[#373333] flex justify-between items-center bg-[#242222]">
                  <span className="text-[13px] font-semibold text-white">Notifications</span>
                  <button onClick={() => notifications.markAllAsRead()} className="text-[11px] text-[#E5E7EB] hover:text-white">Mark all read</button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {notifications?.notifications?.length === 0 ? (
                    <div className="p-4 text-center text-[12px] text-[#E5E7EB]">No notifications</div>
                  ) : (
                    notifications?.notifications?.map((n: any) => (
                      <div key={n.id} onClick={() => notifications.markAsRead(n.id)} className={`p-3 rounded-md text-[12px] cursor-pointer transition-colors ${n.read ? 'bg-transparent hover:bg-[#242222]' : 'bg-[#2A2828] hover:bg-[#373333]'}`}>
                         <div className="flex justify-between mb-1">
                           <span className="font-semibold text-white">{n.title}</span>
                           <span className="text-[10px] text-[#E5E7EB]">{new Date(n.created_at).toLocaleDateString()}</span>
                         </div>
                         <p className="text-[#E5E7EB] line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-[#373333]"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={async () => { await logout(); router.push('/') }}>
            <div className="h-7 w-7 rounded-full bg-[#800020] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-[12px] font-semibold text-white leading-none">{user?.name || 'User'}</span>
              <span className="text-[10px] text-[#E5E7EB] leading-none mt-1">Growth Plan</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Subheader */}
      <nav className="h-[38px] bg-[#191717] border-b border-[#2D2A2A] px-4 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0 z-40">
        {[
          { label: 'Command Center', href: '/app', icon: LayoutDashboard, exact: true },
          { label: 'AI CMO', href: '/app/ai-cmo', icon: Sparkles },
          { label: 'AI Agents (15)', href: '/app/agents', icon: Activity },
          { label: 'Agent Log', href: '/app/agent-log', icon: Activity },
          { label: 'Campaigns', href: '/app/campaigns', icon: Megaphone },
          { label: 'Content Studio', href: '/app/content', icon: FileText },
          { label: 'Approvals', href: '/app/approvals', icon: CheckCircle2 },
          { label: 'Opportunities', href: '/app/opportunities', icon: Target },
          { label: 'Brand Brain', href: '/app/brand-brain', icon: Brain },
          { label: 'Competitors', href: '/app/competitors', icon: Users },
          { label: 'Calendar', href: '/app/calendar', icon: Calendar },
          { label: 'Revenue ROI', href: '/app/revenue', icon: DollarSign },
          { label: 'Analytics', href: '/app/analytics', icon: BarChart2 },
          { label: 'Integrations', href: '/app/integrations', icon: Link2 },
          { label: 'Settings', href: '/app/settings', icon: Settings },
        ].map(item => {
          const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#2A2727] text-white border border-[#443F3F] shadow-sm'
                  : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#E5E7EB]'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main Workspace Area (The 4 columns go here) */}
      <main className="flex-1 flex min-h-0 overflow-hidden bg-[#171515]">
        {children}
      </main>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

    </div>
  )
}
