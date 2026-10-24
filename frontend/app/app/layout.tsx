"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAppProvider } from '@/lib/providers'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  Bell, Search, Settings, ChevronDown, Activity, Sparkles, Check, X, 
  BarChart2, Target, Calendar, DollarSign, Brain, Users, CheckCircle2,
  FileText, LayoutDashboard, Megaphone, HelpCircle, Link2, Menu,
  Zap, Rocket, Plus, Layers, ChevronRight, MessageSquare
} from 'lucide-react'
import { useWorkflowStatus } from '@/lib/providers/WorkflowStatusProvider'
import { WebsiteLoadingMotion } from '@/components/ui/website-loading-motion'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { auth, orchestrator, notifications } = useAppProvider()
  const { authState, user, activeWorkspace, activeBrand, logout } = auth
  const orchestratorProvider = orchestrator
  const { status: workflowStatus } = useWorkflowStatus()
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
    setQuickActionsOpen(false)
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

  // Helper for dynamic mobile title
  const getMobileTitle = (path: string) => {
    if (path === '/app') return 'Command Center'
    if (path.startsWith('/app/ai-cmo')) return 'AI CMO'
    if (path.startsWith('/app/agents')) return '15 AI Agents'
    if (path.startsWith('/app/agent-log')) return 'Agent Logs'
    if (path.startsWith('/app/campaigns')) return 'Campaigns'
    if (path.startsWith('/app/content')) return 'Content Studio'
    if (path.startsWith('/app/approvals')) return 'Approvals'
    if (path.startsWith('/app/opportunities')) return 'Opportunities'
    if (path.startsWith('/app/brand-brain')) return 'Brand Brain'
    if (path.startsWith('/app/competitors')) return 'Competitors'
    if (path.startsWith('/app/calendar')) return 'Calendar'
    if (path.startsWith('/app/revenue')) return 'Revenue & ROI'
    if (path.startsWith('/app/analytics')) return 'Analytics'
    if (path.startsWith('/app/integrations')) return 'Integrations'
    if (path.startsWith('/app/settings/billing')) return 'Billing'
    if (path.startsWith('/app/settings')) return 'Settings'
    return 'StandBharat'
  }

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
      {/* ========================================================= */}
      {/* TOP HEADER (Responsive: Desktop full bar vs Mobile native bar) */}
      {/* ========================================================= */}
      <header className="h-[52px] bg-[#1C1A1A] border-b border-[#373333] flex items-center justify-between px-3 sm:px-4 shrink-0 z-50">
        
        {/* LEFT: Logo & Brand Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/app" className="flex items-center gap-2 shrink-0">
            <Image src="/logo-icon.png" alt="StandBharat Logo" width={28} height={28} className="object-contain" style={{ width: 'auto', height: 'auto' }} priority />
            <span className="font-bold text-[14px] sm:text-[15px] tracking-tight text-white hidden xs:inline">StandBharat</span>
          </Link>
          
          <div className="h-4 w-px bg-[#373333] hidden sm:block"></div>
          
          {/* Active Brand / Workspace Pill */}
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] min-w-0">
            <div 
              onClick={() => setMobileMenuOpen(true)}
              data-hover-group="true"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#242222] border border-[#373333] hover:bg-[#2A2828] cursor-pointer transition-colors max-w-[140px] sm:max-w-[200px]"
            >
              <div className="w-2 h-2 rounded-full bg-[#00A650] animate-pulse shrink-0" />
              <HoverScrollText 
                text={activeBrand?.name || activeWorkspace?.name || 'Workspace'} 
                className="font-medium text-white text-[11px] sm:text-[13px] block" 
              />
              <ChevronDown className="w-3 h-3 text-[#E5E7EB] shrink-0" />
            </div>
          </div>
        </div>

        {/* CENTER: Dynamic Mobile Page Title on < lg, AI CMO Live Status on xl+ */}
        <div className="lg:hidden flex items-center justify-center text-center px-1">
          <span className="text-xs font-bold text-white tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
            {getMobileTitle(pathname)}
          </span>
        </div>

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

        {/* RIGHT: Quick Search, Notifications & User */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Search Trigger (⌘K) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex lg:hidden items-center justify-center h-8 w-8 text-[#E5E7EB] hover:text-white rounded-lg hover:bg-[#242222] transition-colors"
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

          {/* Notifications Popover */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#242222] text-[#E5E7EB] hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications?.unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
              {notifications?.unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-[#1C1A1A] border border-[#373333] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
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

          <div className="h-4 w-px bg-[#373333] hidden sm:block"></div>
          
          {/* User Profile Avatar */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setMobileMenuOpen(true)}
            data-hover-group="true"
          >
            <div className="h-7 w-7 rounded-full bg-[#800020] flex items-center justify-center text-[11px] font-bold text-white shrink-0 border border-[#8F0028]/60 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:flex flex-col min-w-0 max-w-[120px]">
              <HoverScrollText 
                text={user?.name || 'User'} 
                className="text-[12px] font-semibold text-white leading-none block" 
              />
              <span className="text-[10px] text-[#E5E7EB] leading-none mt-1">Growth Plan</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* DESKTOP-ONLY SUB-NAVIGATION (Hidden on mobile) */}
      {/* ========================================================= */}
      <nav className="hidden lg:flex h-[38px] bg-[#191717] border-b border-[#2D2A2A] px-3 sm:px-4 items-center gap-1 overflow-x-auto custom-scrollbar shrink-0 z-40">
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
          { label: 'Workflows', href: '/app/workflows', icon: Layers },
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

      {/* ========================================================= */}
      {/* MAIN VIEWPORT (With bottom-safe padding on mobile) */}
      {/* ========================================================= */}
      <main className="flex-1 flex min-h-0 overflow-hidden bg-[#171515] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {children}
      </main>

      {/* ========================================================= */}
      {/* BESPOKE MOBILE GLASSMORPHIC BOTTOM APP DOCK (Tab Bar) */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#161414]/95 backdrop-blur-2xl border-t border-[#302B2B] px-3 py-1 flex items-center justify-between shadow-2xl safe-area-pb">
        {/* 1. Command Center */}
        <Link
          href="/app"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            pathname === '/app' ? 'text-white' : 'text-[#A39E9E] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${pathname === '/app' ? 'bg-[#8F0028] text-white shadow-md shadow-[#8F0028]/40 scale-105' : 'text-[#A39E9E]'}`}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Command</span>
        </Link>

        {/* 2. AI CMO */}
        <Link
          href="/app/ai-cmo"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            pathname?.startsWith('/app/ai-cmo') ? 'text-white' : 'text-[#A39E9E] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${pathname?.startsWith('/app/ai-cmo') ? 'bg-[#8F0028] text-white shadow-md shadow-[#8F0028]/40 scale-105' : 'text-[#A39E9E]'}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">AI CMO</span>
        </Link>

        {/* 3. CENTER ELEVATED QUICK ACTION FAB */}
        <div className="flex flex-col items-center justify-center flex-1 py-0.5 relative">
          <button
            onClick={() => setQuickActionsOpen(true)}
            aria-label="Quick Actions"
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#8F0028] via-[#B80033] to-[#E65100] text-white shadow-xl shadow-[#8F0028]/60 border-2 border-[#161414] flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white text-white animate-pulse" />
          </button>
          <span className="text-[10px] font-bold text-white mt-0.5 tracking-tight">Actions</span>
        </div>

        {/* 4. Content Studio */}
        <Link
          href="/app/content"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            pathname?.startsWith('/app/content') ? 'text-white' : 'text-[#A39E9E] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${pathname?.startsWith('/app/content') ? 'bg-[#8F0028] text-white shadow-md shadow-[#8F0028]/40 scale-105' : 'text-[#A39E9E]'}`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Studio</span>
        </Link>

        {/* 5. More / All Hub Menu */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            mobileMenuOpen ? 'text-white' : 'text-[#A39E9E] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${mobileMenuOpen ? 'bg-[#8F0028] text-white shadow-md shadow-[#8F0028]/40 scale-105' : 'text-[#A39E9E]'}`}>
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Hub (15)</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* QUICK GROWTH ACTIONS BOTTOM SHEET (Modal) */}
      {/* ========================================================= */}
      {quickActionsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setQuickActionsOpen(false)}
          />

          {/* Sheet Body */}
          <div className="relative w-full bg-[#1C1A1A] border-t border-[#373333] rounded-t-3xl p-5 pb-8 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto custom-scrollbar safe-area-pb">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-[#443F3F] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#302B2B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#8F0028]" />
                  Quick Growth Actions
                </h3>
                <p className="text-xs text-[#A39E9E]">1-tap execution for your active marketing sprint</p>
              </div>
              <button 
                onClick={() => setQuickActionsOpen(false)}
                className="p-1 rounded-full text-[#A39E9E] hover:text-white hover:bg-[#282525]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Action 1: Morning Pulse */}
              <Link
                href="/app/ai-cmo"
                onClick={() => setQuickActionsOpen(false)}
                className="p-3.5 rounded-2xl bg-[#242222] border border-[#373333] hover:border-[#8F0028] flex flex-col gap-2 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#8F0028]/20 text-[#8F0028] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-white">AI CMO Pulse</h4>
                  <p className="text-[10px] text-[#A39E9E]">Run morning growth diagnostic</p>
                </div>
              </Link>

              {/* Action 2: Creative Carousel */}
              <Link
                href="/app/content"
                onClick={() => setQuickActionsOpen(false)}
                className="p-3.5 rounded-2xl bg-[#242222] border border-[#373333] hover:border-[#8F0028] flex flex-col gap-2 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-white">Generate Carousel</h4>
                  <p className="text-[10px] text-[#A39E9E]">Festival & Social 5-slide PDF</p>
                </div>
              </Link>

              {/* Action 3: WhatsApp Broadcast */}
              <Link
                href="/app/campaigns"
                onClick={() => setQuickActionsOpen(false)}
                className="p-3.5 rounded-2xl bg-[#242222] border border-[#373333] hover:border-[#8F0028] flex flex-col gap-2 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-white">WhatsApp Studio</h4>
                  <p className="text-[10px] text-[#A39E9E]">Blast festive discount broadcast</p>
                </div>
              </Link>

              {/* Action 4: Competitor Scan */}
              <Link
                href="/app/competitors"
                onClick={() => setQuickActionsOpen(false)}
                className="p-3.5 rounded-2xl bg-[#242222] border border-[#373333] hover:border-[#8F0028] flex flex-col gap-2 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-white">Competitor Radar</h4>
                  <p className="text-[10px] text-[#A39E9E]">Benchmark positioning & threats</p>
                </div>
              </Link>

              {/* Action 5: Approvals Queue */}
              <Link
                href="/app/approvals"
                onClick={() => setQuickActionsOpen(false)}
                className="p-3.5 rounded-2xl bg-[#242222] border border-[#373333] hover:border-[#8F0028] flex flex-col gap-2 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-white">Approvals Queue</h4>
                  <p className="text-[10px] text-[#A39E9E]">Review AI generated copy</p>
                </div>
              </Link>

              {/* Action 6: 15 AI Agents Roster */}
              <Link
                href="/app/agents"
                onClick={() => setQuickActionsOpen(false)}
                className="p-3.5 rounded-2xl bg-[#242222] border border-[#373333] hover:border-[#8F0028] flex flex-col gap-2 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-white">15 AI Agents</h4>
                  <p className="text-[10px] text-[#A39E9E]">SEO, Copy, Ads & Telemetry</p>
                </div>
              </Link>
            </div>

            {/* Quick Command shortcut button */}
            <button
              onClick={() => {
                setQuickActionsOpen(false)
                setIsCommandPaletteOpen(true)
              }}
              className="w-full mt-4 py-3 rounded-2xl bg-[#242222] border border-[#373333] text-white flex items-center justify-between px-4 text-xs font-semibold hover:bg-[#2D2A2A] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#A39E9E]" />
                <span>Search everything or ask a question</span>
              </div>
              <kbd className="text-[10px] bg-[#1C1A1A] border border-[#443F3F] px-2 py-0.5 rounded text-white">⌘K</kbd>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COMPREHENSIVE CATEGORIZED MOBILE HUB DRAWER */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Drawer Pane */}
          <div className="relative w-[300px] sm:w-[340px] max-w-[88vw] bg-[#1A1818] border-r border-[#373333] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#302B2B] flex items-center justify-between bg-[#1F1D1D]">
              <div className="flex items-center gap-2.5">
                <Image src="/logo-icon.png" alt="StandBharat" width={28} height={28} className="object-contain" />
                <div>
                  <span className="font-bold text-sm text-white tracking-tight block">StandBharat</span>
                  <span className="text-[10px] text-[#A39E9E]">Autonomous Growth OS</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2727] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Brand / Workspace Card */}
            <div className="p-3.5 border-b border-[#302B2B] bg-[#161414]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8F0028] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                  {activeBrand?.name?.[0]?.toUpperCase() || 'B'}
                </div>
                <div className="flex-1 min-w-0">
                  <HoverScrollText 
                    text={activeBrand?.name || 'Workspace Brand'} 
                    className="text-xs font-bold text-white block" 
                  />
                  <div className="text-[10px] text-[#00A650] flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A650] animate-pulse" />
                    Brand Brain Synced
                  </div>
                </div>
              </div>
            </div>

            {/* Categorized Navigation Routes List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
              
              {/* Category 1: Growth Strategy */}
              <div>
                <div className="px-2 pb-1 text-[10px] uppercase font-bold text-[#8E8A85] tracking-wider">
                  Core Strategy
                </div>
                <div className="space-y-0.5">
                  {[
                    { label: 'Command Center', href: '/app', icon: LayoutDashboard, exact: true },
                    { label: 'AI CMO Strategist', href: '/app/ai-cmo', icon: Sparkles },
                    { label: 'Marketing Campaigns', href: '/app/campaigns', icon: Megaphone },
                    { label: 'Approvals Queue', href: '/app/approvals', icon: CheckCircle2 },
                  ].map(item => {
                    const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'))
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#8F0028] text-white shadow-md'
                            : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Category 2: Content Studio */}
              <div>
                <div className="px-2 pb-1 text-[10px] uppercase font-bold text-[#8E8A85] tracking-wider">
                  Creative & Publishing
                </div>
                <div className="space-y-0.5">
                  {[
                    { label: 'Content Studio', href: '/app/content', icon: FileText },
                    { label: 'Editorial Calendar', href: '/app/calendar', icon: Calendar },
                  ].map(item => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#8F0028] text-white shadow-md'
                            : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Category 3: Market Intelligence */}
              <div>
                <div className="px-2 pb-1 text-[10px] uppercase font-bold text-[#8E8A85] tracking-wider">
                  Market Radar & Intel
                </div>
                <div className="space-y-0.5">
                  {[
                    { label: 'Competitor Intelligence', href: '/app/competitors', icon: Users },
                    { label: 'Growth Opportunities', href: '/app/opportunities', icon: Target },
                    { label: 'Brand Brain Knowledge', href: '/app/brand-brain', icon: Brain },
                    { label: 'Analytics Dashboard', href: '/app/analytics', icon: BarChart2 },
                    { label: 'Revenue & ROI', href: '/app/revenue', icon: DollarSign },
                  ].map(item => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#8F0028] text-white shadow-md'
                            : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Category 4: System & Automation */}
              <div>
                <div className="px-2 pb-1 text-[10px] uppercase font-bold text-[#8E8A85] tracking-wider">
                  Automation & System
                </div>
                <div className="space-y-0.5">
                  {[
                    { label: 'AI Agents (15 Active)', href: '/app/agents', icon: Activity },
                    { label: 'Agent Audit Log', href: '/app/agent-log', icon: Activity },
                    { label: 'Multi-Agent Workflows', href: '/app/workflows', icon: Layers },
                    { label: 'Integrations & Sync', href: '/app/integrations', icon: Link2 },
                    { label: 'Billing & Invoices', href: '/app/settings/billing', icon: DollarSign },
                    { label: 'Team & Permissions', href: '/app/settings/team', icon: Users },
                    { label: 'Settings', href: '/app/settings', icon: Settings },
                  ].map(item => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#8F0028] text-white shadow-md'
                            : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom User & Logout Footer */}
            <div className="p-3 border-t border-[#302B2B] bg-[#161414] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
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
                className="px-3 py-1.5 bg-[#242222] hover:bg-[#2E2B2B] text-[#E5E7EB] hover:text-white rounded-xl text-[11px] font-semibold border border-[#373333] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

    </div>
  )
}

