"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, X, Zap, ArrowRight, LayoutDashboard, 
  Activity, CheckCircle2, FileText, Megaphone, 
  Sparkles, Layers, DollarSign, BarChart2, ShieldCheck, 
  Users, Command
} from 'lucide-react'
import { AgentLogo } from '@/components/agents/AgentLogo'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onLaunchSprint?: () => void
  onFastReview?: () => void
  onExportReport?: () => void
}

const AGENTS = [
  { id: 'analytics', name: 'Multi-Touch Revenue Attribution', category: 'Analytics & Attribution', path: '/app/agents/analytics' },
  { id: 'competitor', name: 'Competitor Radar & Spy Agent', category: 'Competitive Intelligence', path: '/app/agents/competitor' },
  { id: 'growth', name: 'CRO & Growth Experiment Agent', category: 'Conversion Optimization', path: '/app/agents/growth' },
  { id: 'content_strategy', name: 'Content Strategy & Roadmap Agent', category: 'Content Marketing', path: '/app/agents/content_strategy' },
  { id: 'content_writer', name: 'High-Velocity Content Writer Agent', category: 'Content Marketing', path: '/app/agents/content_writer' },
  { id: 'performance', name: 'Paid Ads & PPC Performance Agent', category: 'Paid Acquisition', path: '/app/agents/performance' },
  { id: 'seo', name: 'SEO & Topical Authority Agent', category: 'Organic Search', path: '/app/agents/seo' },
  { id: 'geo', name: 'AI Answer Engine (GEO) Agent', category: 'AI Search Discovery', path: '/app/agents/geo' },
  { id: 'ai_cmo', name: 'Strategic AI CMO Advisor', category: 'Executive Strategy', path: '/app/agents/ai_cmo' },
  { id: 'linkedin', name: 'LinkedIn Thought Leadership Agent', category: 'Social Distribution', path: '/app/agents/linkedin' },
  { id: 'x', name: 'X / Twitter Growth Agent', category: 'Social Distribution', path: '/app/agents/x' },
  { id: 'reddit', name: 'Reddit Community Engagement Agent', category: 'Community Engagement', path: '/app/agents/reddit' },
  { id: 'coding', name: 'Technical SEO & Engineering Agent', category: 'Technical Marketing', path: '/app/agents/coding' },
  { id: 'influencer', name: 'Influencer & PR Outreach Agent', category: 'PR & Outreach', path: '/app/agents/influencer' },
  { id: 'ugc', name: 'UGC & Video Hook Creative Agent', category: 'Creative Production', path: '/app/agents/ugc' },
]

const PAGES = [
  { name: 'Command Center', path: '/app', icon: LayoutDashboard },
  { name: 'Marketing Agent Fleet (15)', path: '/app/agents', icon: Users },
  { name: 'Agent Execution & Audit Log', path: '/app/agent-log', icon: Activity },
  { name: 'Approvals Queue', path: '/app/approvals', icon: CheckCircle2 },
  { name: 'Dedicated Website Analytics', path: '/app/analytics', icon: BarChart2 },
  { name: 'Connected Platforms & Integrations', path: '/app/integrations', icon: Layers },
  { name: 'Campaigns & Playbooks', path: '/app/campaigns', icon: Megaphone },
  { name: 'Competitor Radar & Gaps', path: '/app/competitors', icon: Zap },
  { name: 'Brand Brain Knowledge Base', path: '/app/brand-brain', icon: Sparkles },
]

export function CommandPalette({
  isOpen,
  onClose,
  onLaunchSprint,
  onFastReview,
  onExportReport
}: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Global keyboard shortcut: Cmd+K / Ctrl+K & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open handled externally or trigger custom event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const q = query.toLowerCase().trim()

  const filteredAgents = AGENTS.filter(a => 
    !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.id.includes(q)
  )

  const filteredPages = PAGES.filter(p => 
    !q || p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
  )

  const handleSelectAgent = (path: string) => {
    onClose()
    router.push(path)
  }

  const handleSelectPage = (path: string) => {
    onClose()
    router.push(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#1C1A1A] border border-[#373333] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Bar */}
        <div className="p-4 border-b border-[#373333] flex items-center gap-3 bg-[#201D1D]">
          <Search className="w-5 h-5 text-[#E5E7EB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, deliverables, pages, or actions... (Cmd+K)"
            className="flex-1 bg-transparent text-[15px] font-medium text-white placeholder:text-[#E5E7EB] focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-[#E5E7EB] bg-[#2A2727] border border-[#3E3838] px-2 py-0.5 rounded">
              ESC to exit
            </span>
            <button 
              onClick={onClose}
              className="text-[#E5E7EB] hover:text-white p-1 rounded-md hover:bg-[#2C2929] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Results Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          
          {/* Section 1: Quick Actions (Shown when query matches or is empty) */}
          {(!q || 'sprint review export approval'.includes(q)) && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">
                ⚡ Quick Actions
              </div>
              <div className="space-y-1 mt-1">
                <div
                  onClick={() => { onClose(); onLaunchSprint?.(); }}
                  className="px-3 py-2.5 rounded-xl hover:bg-[#262323] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#373333]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#800020] text-white border border-[#800020] flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white group-hover:text-white transition-colors">
                        Launch Autonomous Marketing Sprint
                      </div>
                      <div className="text-[11px] text-[#E5E7EB]">
                        Coordinate multi-agent campaigns (Product Launch, SEO Sprint, Paid Ads)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-[#800020] px-2 py-0.5 rounded border border-[#800020]">
                    Run Sprint →
                  </span>
                </div>

                <div
                  onClick={() => { onClose(); onFastReview?.(); }}
                  className="px-3 py-2.5 rounded-xl hover:bg-[#262323] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#373333]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#242222] text-white border border-[#373333] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white group-hover:text-white transition-colors">
                        Fast Review & Approve Generated Drafts
                      </div>
                      <div className="text-[11px] text-[#E5E7EB]">
                        Instant slide-over review for LinkedIn posts, blogs & competitor battlecards
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-[#242222] px-2 py-0.5 rounded border border-[#373333]">
                    Approvals →
                  </span>
                </div>

                <div
                  onClick={() => { onClose(); onExportReport?.(); }}
                  className="px-3 py-2.5 rounded-xl hover:bg-[#262323] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#373333]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#242222] text-white border border-[#373333] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white group-hover:text-white transition-colors">
                        Export Executive Intelligence Report (PDF / MD)
                      </div>
                      <div className="text-[11px] text-[#E5E7EB]">
                        Download complete 30-day playbook, audit scores & revenue attribution
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-[#242222] px-2 py-0.5 rounded border border-[#373333]">
                    Download →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Autonomous Agents (15) */}
          {filteredAgents.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center justify-between">
                <span>🤖 Autonomous Agents ({filteredAgents.length})</span>
                <span className="text-[9px] text-[#E5E7EB]">Click to configure & execute</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent.path)}
                    className="px-3 py-2 rounded-xl hover:bg-[#262323] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#373333]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AgentLogo id={agent.id} name={agent.name} size="sm" showRing={false} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-white group-hover:text-white transition-colors truncate">
                          {agent.name}
                        </div>
                        <div className="text-[11px] text-[#E5E7EB] truncate">
                          {agent.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#E5E7EB] group-hover:text-white flex items-center gap-1 font-medium">
                        Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Navigation Destinations */}
          {filteredPages.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">
                🧭 Workspace Navigation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {filteredPages.map((page) => {
                  const Icon = page.icon
                  return (
                    <div
                      key={page.path}
                      onClick={() => handleSelectPage(page.path)}
                      className="px-3 py-2 rounded-xl hover:bg-[#262323] cursor-pointer flex items-center gap-2.5 group transition-colors border border-transparent hover:border-[#373333]"
                    >
                      <Icon className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                      <span className="text-[12px] font-semibold text-white group-hover:text-white transition-colors truncate">
                        {page.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty search state */}
          {filteredAgents.length === 0 && filteredPages.length === 0 && (
            <div className="py-12 text-center text-[#E5E7EB]">
              <Search className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-[#E5E7EB] mt-1">Try searching for &quot;SEO&quot;, &quot;LinkedIn&quot;, &quot;Sprint&quot;, or &quot;Analytics&quot;</p>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-4 py-2.5 border-t border-[#373333] bg-[#171515] text-[11px] text-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navigation: <strong className="text-white">↑ ↓</strong></span>
            <span>Select: <strong className="text-white">↵ Enter</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-white" />
            <span className="font-semibold text-white">StandBharat QuickCommand</span>
          </div>
        </div>
      </div>
    </div>
  )
}
