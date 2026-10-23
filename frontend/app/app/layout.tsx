"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAppProvider } from '@/lib/providers'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  Bell, Search, Settings, ChevronDown, Activity, Sparkles, Check, X, 
  BarChart2, Target, Calendar, DollarSign, Brain, Users, CheckCircle2,
  FileText, LayoutDashboard, Megaphone, HelpCircle, Link2, Menu
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
      <header className="h-[52px] bg-[#1C1A1A] border-b border-[#373333] flex items-center justify-between px-3 sm:px-4 shrink-0 z-50">
        
        {/* LEFT: Mobile Toggle + Logo & Workspace */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden flex items-center justify-center h-8 w-8 text-[#E5E7EB] hover:text-white rounded-md hover:bg-[#242222] transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>

          <Link href="/app" className="flex items-center gap-2 shrink-0">
            <Image src="/logo-icon.png" alt="StandBharat Logo" width={28} height={28} className="object-contain" style={{ width: 'auto', height: 'auto' }} priority />
            <span className="font-bold text-[14px] sm:text-[15px] tracking-tight text-white hidden xs:inline">StandBharat</span>
          </Link>
          
          <div className="h-4 w-px bg-[#373333] hidden sm:block"></div>
          
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] min-w-0">
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md bg-[#242222] border border-[#373333] hover:bg-[#2A2828] cursor-pointer transition-colors max-w-[130px] sm:max-w-[200px]">
              <Sparkles className="w-3.5 h-3.5 text-[#E5E7EB] shrink-0" />
              <span className="font-medium text-white truncate">{activeWorkspace?.name || 'Workspace'}</span>
              <ChevronDown className="w-3 h-3 text-[#E5E7EB] shrink-0" />
            </div>
          </div>
        </div>

        {/* CENTER: AI CMO Status */}
        {workflowStatus?.overall_status === 'PROCESSING' ? (
          <div className="hidden xl:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <div className="h-2 w-2 rounded-full bg-[#800020] animate-pulse"></div>
             <span className="text-[13px] font-medium text-[#E5E7EB]">
               AI CMO is analyzing <span className="text-white font-semibold">{activeBrand?.website_url?.replace(/^https?:\/\//,'') || activeBrand?.name || 'brand'}</span>...
             </span>
          </div>
        ) : workflowStatus?.overall_status === 'COMPLETED' ? (
          <div className="hidden xl:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <div className="h-2 w-2 rounded-full bg-[#800020]"></div>
             <span className="text-[13px] font-medium text-[#E5E7EB]">
               Brand Brain <span className="text-white font-semibold">Synced</span>
             </span>
          </div>
        ) : null}

        {/* RIGHT: Search & User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="lg:hidden flex items-center justify-center h-8 w-8 text-[#E5E7EB] hover:text-white rounded-md hover:bg-[#242222] transition-colors"
            title="Search or ask anything (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Cmd+K search input */}
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative hidden lg:flex items-center w-56 xl:w-64 bg-[#242222] border border-[#373333] hover:border-[#524B4B] rounded-md py-1.5 px-3 text-[13px] text-[#E5E7EB] cursor-pointer transition-colors justify-between group shadow-sm"
            title="Press Cmd+K or Ctrl+K to open QuickCommand"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#E5E7EB] group-hover:text-white transition-colors" />
              <span className="group-hover:text-white transition-colors truncate">Search or ask anything...</span>
            </div>
            <kbd className="text-[10px] font-mono text-white bg-[#1C1A1A] border border-[#373333] px-1.5 py-0.5 rounded shadow-sm shrink-0">
              ⌘K
            </kbd>
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
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#1C1A1A] border border-[#373333] rounded-md shadow-lg overflow-hidden z-50 flex flex-col max-h-[400px]">
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
              <span className="text-[12px] font-semibold text-white leading-none max-w-[120px] truncate">{user?.name || 'User'}</span>
              <span className="text-[10px] text-[#E5E7EB] leading-none mt-1">Growth Plan</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Subheader (Desktop / Tablet Scrollable Bar) */}
      <nav className="h-[38px] bg-[#191717] border-b border-[#2D2A2A] px-3 sm:px-4 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0 z-40">
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
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[11.5px] sm:text-[12px] font-medium transition-colors shrink-0 ${
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

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Drawer Pane */}
          <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] bg-[#1C1A1A] border-r border-[#373333] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#373333] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo-icon.png" alt="StandBharat" width={26} height={26} className="object-contain" />
                <span className="font-bold text-base text-white tracking-tight">StandBharat</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#E5E7EB] hover:text-white p-1 rounded-lg hover:bg-[#242222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Brand / Workspace Pill */}
            <div className="p-3 border-b border-[#373333] bg-[#161414]">
              <div className="text-[10px] uppercase font-bold text-[#A39E9E] mb-1">Active Brand Context</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#8F0028] text-white font-bold text-[10px] flex items-center justify-center">
                  {activeBrand?.name?.[0]?.toUpperCase() || 'B'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{activeBrand?.name || 'Workspace Brand'}</div>
                  <div className="text-[10px] text-[#00A650] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A650]" />
                    Brand Brain Synced
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Routes List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {[
                { label: 'Command Center', href: '/app', icon: LayoutDashboard, exact: true },
                { label: 'AI CMO Strategist', href: '/app/ai-cmo', icon: Sparkles },
                { label: 'AI Agents (15)', href: '/app/agents', icon: Activity },
                { label: 'Agent Log', href: '/app/agent-log', icon: Activity },
                { label: 'Marketing Campaigns', href: '/app/campaigns', icon: Megaphone },
                { label: 'Content Studio', href: '/app/content', icon: FileText },
                { label: 'Approvals Queue', href: '/app/approvals', icon: CheckCircle2 },
                { label: 'Growth Opportunities', href: '/app/opportunities', icon: Target },
                { label: 'Brand Brain', href: '/app/brand-brain', icon: Brain },
                { label: 'Competitor Intelligence', href: '/app/competitors', icon: Users },
                { label: 'Editorial Calendar', href: '/app/calendar', icon: Calendar },
                { label: 'Revenue & ROI', href: '/app/revenue', icon: DollarSign },
                { label: 'Analytics Dashboard', href: '/app/analytics', icon: BarChart2 },
                { label: 'Integrations', href: '/app/integrations', icon: Link2 },
                { label: 'Billing & Settings', href: '/app/settings', icon: Settings },
              ].map(item => {
                const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#8F0028] text-white shadow-md'
                        : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Bottom User & Logout Footer */}
            <div className="p-3 border-t border-[#373333] bg-[#161414] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-[#800020] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-[#A39E9E]">Growth Tier</div>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setMobileMenuOpen(false)
                  await logout()
                  router.push('/')
                }}
                className="px-2.5 py-1 bg-[#242222] hover:bg-[#2E2B2B] text-[#E5E7EB] hover:text-white rounded-lg text-[11px] font-semibold border border-[#373333]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

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
