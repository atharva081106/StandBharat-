"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Activity, CheckCircle2, Clock, AlertCircle, Loader2, Search, Filter, 
  RefreshCw, Play, ArrowRight, ChevronRight, Copy, Check, FileText, 
  Sparkles, Terminal, ExternalLink, Shield, Zap, Flame, SlidersHorizontal,
  TrendingUp, Users, DollarSign, BarChart2, Share2, MessageSquare, Code,
  Megaphone, Video, PenTool, CheckCircle, XCircle, ChevronDown, Bot, Layers
} from 'lucide-react'
import { useAppProvider } from '@/lib/providers'
import { Button } from '@/components/ui/button'
import { AgentLogo } from '@/components/agents/AgentLogo'

const AGENT_META: Record<string, { name: string; category: string; icon: any }> = {
  seo_agent: { name: 'SEO & Topical Authority Agent', category: 'Organic Search', icon: Search },
  competitor: { name: 'Competitor Radar & Spy Agent', category: 'Competitive Intelligence', icon: Users },
  growth: { name: 'CRO & Growth Experiment Agent', category: 'Conversion Optimization', icon: TrendingUp },
  content_strategy: { name: 'Content Strategy & Roadmap Agent', category: 'Content Marketing', icon: FileText },
  content_writer: { name: 'High-Velocity Content Writer Agent', category: 'Content Marketing', icon: PenTool },
  performance: { name: 'Paid Ads & PPC Performance Agent', category: 'Paid Acquisition', icon: DollarSign },
  analytics: { name: 'Multi-Touch Revenue Attribution Agent', category: 'Analytics & Telemetry', icon: BarChart2 },
  geo_agent: { name: 'AI Answer Engine (GEO) Agent', category: 'AI Discovery', icon: Sparkles },
  ai_cmo: { name: 'Strategic AI CMO Advisor', category: 'Executive Strategy', icon: Sparkles },
  linkedin_agent: { name: 'LinkedIn Thought Leadership Agent', category: 'Social Distribution', icon: Share2 },
  x_agent: { name: 'X / Twitter Growth Agent', category: 'Social Distribution', icon: Share2 },
  reddit_agent: { name: 'Reddit Community Engagement Agent', category: 'Community', icon: MessageSquare },
  coding_agent: { name: 'Technical SEO & Engineering Agent', category: 'Technical Marketing', icon: Code },
  influencer_agent: { name: 'Influencer & PR Outreach Agent', category: 'PR & Partnerships', icon: Megaphone },
  ugc_agent: { name: 'UGC & Video Hook Creative Agent', category: 'Creative Production', icon: Video },
}

function getAgentInfo(agentId: string) {
  const clean = (agentId || '').replace(/_agent$/, '').toLowerCase()
  const key = Object.keys(AGENT_META).find(k => k === clean || k === agentId || `${k}_agent` === agentId)
  if (key && AGENT_META[key]) {
    return AGENT_META[key]
  }
  return {
    name: (agentId || 'Autonomous Agent').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    category: 'Autonomous Execution',
    icon: Bot
  }
}

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return 'Recently'
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch (e) {
    return 'Recently'
  }
}

export default function AgentLogPage() {
  const { agents, auth } = useAppProvider()
  const { activeBrand } = auth

  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'RUNNING' | 'FAILED'>('ALL')
  const [agentFilter, setAgentFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [triggerModalOpen, setTriggerModalOpen] = useState<boolean>(false)
  const [executingAgentId, setExecutingAgentId] = useState<string | null>(null)
  
  // Inspector sub-tab
  const [inspectorTab, setInspectorTab] = useState<'briefing' | 'report' | 'payload' | 'config'>('briefing')
  const [copied, setCopied] = useState<boolean>(false)

  const fetchRuns = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    try {
      const data = await agents.getAgentRuns()
      const sorted = Array.isArray(data) ? [...data].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) : []
      setRuns(sorted)
      if (sorted.length > 0 && !selectedRunId) {
        setSelectedRunId(sorted[0].id)
      }
    } catch (err) {
      console.error('Failed to load agent runs:', err)
    } finally {
      setLoading(false)
      if (isManualRefresh) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRuns()
    // Periodic poll every 15 seconds for live telemetry
    const interval = setInterval(() => {
      fetchRuns()
    }, 15000)
    return () => clearInterval(interval)
  }, [activeBrand?.id])

  const filteredRuns = useMemo(() => {
    return runs.filter(run => {
      // Status filter
      if (statusFilter === 'COMPLETED' && run.status !== 'COMPLETED' && run.status !== 'SUCCESS') return false
      if (statusFilter === 'RUNNING' && run.status !== 'RUNNING' && run.status !== 'IN_PROGRESS' && run.status !== 'QUEUED') return false
      if (statusFilter === 'FAILED' && run.status !== 'FAILED' && run.status !== 'ERROR') return false

      // Agent ID filter
      if (agentFilter !== 'ALL') {
        const cleanRunAgent = (run.agent_id || '').replace(/_agent$/, '').toLowerCase()
        const cleanFilter = agentFilter.replace(/_agent$/, '').toLowerCase()
        if (cleanRunAgent !== cleanFilter) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const idMatch = (run.id || '').toLowerCase().includes(q)
        const agentMatch = (run.agent_id || '').toLowerCase().includes(q)
        const summaryMatch = (run.summary || '').toLowerCase().includes(q)
        const meta = getAgentInfo(run.agent_id)
        const nameMatch = meta.name.toLowerCase().includes(q)
        if (!idMatch && !agentMatch && !summaryMatch && !nameMatch) return false
      }

      return true
    })
  }, [runs, statusFilter, agentFilter, searchQuery])

  const selectedRun = useMemo(() => {
    return runs.find(r => r.id === selectedRunId) || filteredRuns[0] || null
  }, [runs, selectedRunId, filteredRuns])

  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTriggerAgent = async (agentId: string) => {
    setExecutingAgentId(agentId)
    try {
      await agents.runAgent(agentId, {})
      setTriggerModalOpen(false)
      await fetchRuns(true)
    } catch (err) {
      console.error('Trigger agent failed:', err)
    } finally {
      setExecutingAgentId(null)
    }
  }

  // Calculate statistics
  const totalRuns = runs.length
  const completedRuns = runs.filter(r => r.status === 'COMPLETED' || r.status === 'SUCCESS').length
  const runningRuns = runs.filter(r => r.status === 'RUNNING' || r.status === 'IN_PROGRESS' || r.status === 'QUEUED').length
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100

  return (
    <div className="flex-1 flex flex-col h-full bg-[#171515] text-white overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* TOP HEADER & TELEMETRY SUMMARY */}
      {/* ========================================================= */}
      <div className="px-6 py-4 border-b border-[#373333] bg-[#1C1A1A] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#262323] text-white border border-[#3E3838]">
                Real-Time Autonomous Telemetry
              </span>
              <span className="text-[10px] font-medium text-white bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Polling
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-white" />
              <span>Agent Execution & Audit Log</span>
            </h1>
            <p className="text-xs text-[#E5E7EB] mt-0.5">
              Live audit traces, autonomous task execution histories, and strategic deliverable outputs for <strong className="text-white">{activeBrand?.name || 'your workspace'}</strong>.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="hidden sm:flex items-center gap-4 bg-[#242222] border border-[#373333] px-3.5 py-1.5 rounded-xl text-xs">
              <div>
                <span className="text-[#E5E7EB] text-[10px] uppercase block">Total Runs</span>
                <span className="font-bold text-white">{totalRuns}</span>
              </div>
              <div className="h-6 w-px bg-[#373333]"></div>
              <div>
                <span className="text-[#E5E7EB] text-[10px] uppercase block">Success</span>
                <span className="font-bold text-white">{successRate}%</span>
              </div>
              <div className="h-6 w-px bg-[#373333]"></div>
              <div>
                <span className="text-[#E5E7EB] text-[10px] uppercase block">Active</span>
                <span className="font-bold text-white">{runningRuns}</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchRuns(true)}
              disabled={refreshing}
              className="border-[#373333] bg-[#242222] hover:bg-[#2C2929] text-white text-xs h-9 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-white' : 'text-[#E5E7EB]'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setTriggerModalOpen(true)}
              className="bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold h-9 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#8F0028]/25 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Agent</span>
            </Button>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH & FILTERS BAR */}
      {/* ========================================================= */}
      <div className="px-6 py-2.5 bg-[#191717] border-b border-[#2E2A2A] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#201D1D] p-1 rounded-lg border border-[#332F2F]">
          {(['ALL', 'COMPLETED', 'RUNNING', 'FAILED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#2A2727] text-white border border-[#443F3F] shadow-sm'
                  : 'text-[#E5E7EB] hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Runs' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Agent Filter Dropdown & Search Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl justify-end">
          <div className="relative">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-[#242222] border border-[#373333] text-white text-xs rounded-lg py-1.5 px-3 pr-8 appearance-none focus:outline-none focus:border-[#443F3F] cursor-pointer"
            >
              <option value="ALL">All 15 Agents</option>
              {Object.entries(AGENT_META).map(([id, meta]) => (
                <option key={id} value={id}>{meta.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#E5E7EB] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#E5E7EB] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent, keyword, or run ID..."
              className="w-full bg-[#242222] border border-[#373333] rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#78736E] focus:outline-none focus:border-[#443F3F]"
            />
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MAIN DUAL PANE LOG WORKSPACE */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE 1: RUNS STREAM LIST */}
        <div className="w-full md:w-[380px] lg:w-[440px] border-r border-[#373333] bg-[#1A1818] flex flex-col shrink-0 overflow-hidden">
          
          <div className="px-4 py-2 border-b border-[#2C2828] bg-[#1E1C1C] flex items-center justify-between text-[11px] text-[#E5E7EB]">
            <span>Activity Stream ({filteredRuns.length} runs)</span>
            <span>Sorted by Recent</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#262323]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#E5E7EB] flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span>Loading execution telemetry...</span>
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#E5E7EB] space-y-3">
                <Activity className="w-8 h-8 text-[#5E5A57] mx-auto" />
                <p>No agent runs match the selected filters.</p>
                <button
                  onClick={() => { setStatusFilter('ALL'); setAgentFilter('ALL'); setSearchQuery(''); }}
                  className="px-3 py-1 bg-[#242222] hover:bg-[#2C2929] border border-[#373333] rounded-lg text-white text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredRuns.map((run) => {
                const meta = getAgentInfo(run.agent_id)
                const Icon = meta.icon
                const isSelected = selectedRun?.id === run.id
                const isComplete = run.status === 'COMPLETED' || run.status === 'SUCCESS'
                const isRunning = run.status === 'RUNNING' || run.status === 'IN_PROGRESS' || run.status === 'QUEUED'

                return (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`p-4 transition-all cursor-pointer flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-[#242222] border-l-4 border-l-emerald-400 shadow-inner'
                        : 'hover:bg-[#1E1C1C]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AgentLogo id={run.agent_id} name={meta.name} size="sm" showRing={false} />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {meta.name}
                          </h4>
                          <span className="text-[10px] text-[#E5E7EB] font-mono block">
                            ID: {run.id.substring(0, 8)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 text-right">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        ) : isRunning ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-full">
                            <Loader2 className="w-3 h-3 animate-spin" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                        <span className="text-[10px] text-[#E5E7EB] block mt-0.5">
                          {formatRelativeTime(run.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Executive Summary Snippet */}
                    <p className="text-[11px] text-white line-clamp-2 leading-relaxed">
                      {typeof run.summary === 'string'
                        ? run.summary
                        : (run.summary?.executive_summary || run.output?.executive_summary || 'Autonomous agent execution concluded. Artifacts and telemetry generated.')}
                    </p>

                    {/* Footer Tags */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-[#E5E7EB]">
                      <span className="px-2 py-0.5 rounded bg-[#201D1D] border border-[#332F2F]">
                        {run.trigger_type || 'AUTONOMOUS'}
                      </span>
                      {run.key_findings?.length > 0 && (
                        <span>• {run.key_findings.length} Findings</span>
                      )}
                      {run.action_items?.length > 0 && (
                        <span>• {run.action_items.length} Actions</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* PANE 2: SELECTED RUN INSPECTOR */}
        <div className="flex-1 bg-[#171515] flex flex-col overflow-y-auto custom-scrollbar">
          {selectedRun ? (
            <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
              
              {/* Run Header Card */}
              {(() => {
                const meta = getAgentInfo(selectedRun.agent_id)
                const Icon = meta.icon
                const isComplete = selectedRun.status === 'COMPLETED' || selectedRun.status === 'SUCCESS'

                return (
                  <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-3.5">
                        <AgentLogo id={selectedRun.agent_id} name={meta.name} size="md" showRing={false} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-white">
                              {meta.name}
                            </h2>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#262323] text-white border border-[#3E3838]">
                              {meta.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#E5E7EB] mt-1 font-mono">
                            <span>Run ID: {selectedRun.id}</span>
                            <span>•</span>
                            <span>Trigger: {selectedRun.trigger_type || 'AUTONOMOUS'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(selectedRun.id)}
                          className="border-[#373333] bg-[#242222] hover:bg-[#2C2929] text-white hover:text-white text-xs h-8 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy ID'}</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleTriggerAgent(selectedRun.agent_id)}
                          disabled={executingAgentId === selectedRun.agent_id}
                          className="bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {executingAgentId === selectedRun.agent_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>Run Agent Again</span>
                        </Button>
                      </div>

                    </div>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#2C2828] text-xs">
                      <div>
                        <span className="text-[10px] text-[#E5E7EB] uppercase block">Execution Status</span>
                        <span className={`font-bold ${isComplete ? 'text-white' : 'text-white'}`}>
                          {selectedRun.status || 'COMPLETED'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#E5E7EB] uppercase block">Started At</span>
                        <span className="text-white">
                          {selectedRun.started_at ? new Date(selectedRun.started_at).toLocaleTimeString() : new Date(selectedRun.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#E5E7EB] uppercase block">Completed At</span>
                        <span className="text-white">
                          {selectedRun.completed_at ? new Date(selectedRun.completed_at).toLocaleTimeString() : 'Immediate'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#E5E7EB] uppercase block">Human Oversight</span>
                        <span className="text-white font-medium">Safe • Sandboxed</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Inspector Sub-Tabs */}
              <div className="flex items-center gap-1 border-b border-[#373333] pb-2 text-xs">
                {[
                  { id: 'briefing', label: 'Executive Briefing', icon: Sparkles },
                  { id: 'report', label: 'Markdown Deliverable', icon: FileText },
                  { id: 'payload', label: 'Raw Telemetry Payload', icon: Terminal },
                  { id: 'config', label: 'Agent Directives', icon: SlidersHorizontal },
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = inspectorTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInspectorTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#262323] text-white border border-[#3E3838]'
                          : 'text-[#E5E7EB] hover:text-white hover:bg-[#201D1D]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* TAB CONTENT: 1. EXECUTIVE BRIEFING */}
              {inspectorTab === 'briefing' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* Strategic Executive Summary Card */}
                  <div className="rounded-xl border border-[#373333] bg-[#201E1E] p-5 relative">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#8F0028] text-white shrink-0 mt-0.5 shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Strategic Executive Summary
                        </h4>
                        <p className="text-sm text-white leading-relaxed font-medium">
                          {typeof selectedRun.summary === 'string'
                            ? selectedRun.summary
                            : (selectedRun.summary?.executive_summary || selectedRun.result_data?.executive_summary || 'Autonomous task executed successfully with verified strategic metrics.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Findings Section */}
                  {selectedRun.key_findings && selectedRun.key_findings.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5E7EB] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                        Key Strategic Signals & Findings ({selectedRun.key_findings.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedRun.key_findings.map((f: any, i: number) => {
                          const findingText = typeof f === 'string'
                            ? f
                            : (f?.title || f?.finding || f?.description || f?.summary || JSON.stringify(f))
                          return (
                            <div key={i} className="bg-[#201E1E] border border-[#373333] rounded-xl p-3.5 flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-[#262323] border border-[#3E3838] flex items-center justify-center shrink-0 text-white mt-0.5">
                                <Check className="w-3 h-3" />
                              </div>
                              <p className="text-xs text-[#E5E1DD] leading-relaxed">
                                {findingText}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Prioritized Action Items */}
                  {selectedRun.action_items && selectedRun.action_items.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5E7EB] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-white" />
                        Prioritized Action Items ({selectedRun.action_items.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedRun.action_items.map((act: any, i: number) => {
                          const actTitle = typeof act === 'string'
                            ? act
                            : (act?.title || act?.action || act?.name || 'Action Item')
                          const actDesc = typeof act === 'object' ? (act?.description || act?.recommended_action || '') : ''
                          const actPriority = typeof act === 'object' ? (act?.priority || 'HIGH') : 'HIGH'
                          const actStatus = typeof act === 'object' ? (act?.status || 'READY') : 'READY'
                          const isHigh = String(actPriority).toUpperCase() === 'HIGH' || String(actPriority).toUpperCase() === 'CRITICAL'

                          return (
                            <div key={i} className="bg-[#201E1E] border border-[#373333] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-[#262323] border border-[#3E3838] flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                      isHigh
                                        ? 'bg-red-950/40 text-red-400 border-red-800/40'
                                        : 'bg-[#262323] text-white border-[#3E3838]'
                                    }`}>
                                      {String(actPriority)}
                                    </span>
                                    <span className="text-xs text-white font-semibold">
                                      {actTitle}
                                    </span>
                                  </div>
                                  {actDesc && (
                                    <p className="text-xs text-[#E5E7EB] leading-relaxed">
                                      {actDesc}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 self-start sm:self-center pl-7 sm:pl-0">
                                <span className="text-[10px] text-white font-semibold uppercase px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/40 rounded">
                                  {actStatus}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB CONTENT: 2. MARKDOWN DELIVERABLE */}
              {inspectorTab === 'report' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#E5E7EB]">
                      Publication-ready deliverable formatted from agent output.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(selectedRun.markdown_report || selectedRun.summary || '')}
                      className="border-[#373333] bg-[#242222] hover:bg-[#2C2929] text-xs h-7 px-2.5 rounded-lg flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Report'}</span>
                    </Button>
                  </div>

                  <div className="bg-[#121111] border border-[#373333] rounded-xl p-6 font-mono text-xs text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
                    {selectedRun.markdown_report || `# ${getAgentInfo(selectedRun.agent_id).name} Deliverable\n\n## Executive Summary\n${selectedRun.summary || 'Strategic run finished.'}`}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: 3. RAW TELEMETRY PAYLOAD */}
              {inspectorTab === 'payload' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#E5E7EB] font-mono">
                      Raw JSON Output Payload & Signal Metadata
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(JSON.stringify(selectedRun.result_data || selectedRun.output || selectedRun, null, 2))}
                      className="border-[#373333] bg-[#242222] hover:bg-[#2C2929] text-xs h-7 px-2.5 rounded-lg flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>Copy JSON</span>
                    </Button>
                  </div>

                  <pre className="bg-[#121111] border border-[#373333] rounded-xl p-5 font-mono text-xs text-[#E5E7EB] max-h-[500px] overflow-auto leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(selectedRun.result_data || selectedRun.output || selectedRun, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB CONTENT: 4. AGENT DIRECTIVES & CONFIG */}
              {inspectorTab === 'config' && (
                <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-6 space-y-4 animate-in fade-in duration-200 text-xs">
                  <h4 className="font-bold text-white text-sm">Agent Operational Parameters</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#242222] rounded-xl border border-[#373333] space-y-1">
                      <span className="text-[10px] uppercase text-[#E5E7EB]">Agent Identifier</span>
                      <p className="font-bold text-white font-mono">{selectedRun.agent_id}</p>
                    </div>
                    <div className="p-3 bg-[#242222] rounded-xl border border-[#373333] space-y-1">
                      <span className="text-[10px] uppercase text-[#E5E7EB]">Tone & Memory Grounding</span>
                      <p className="font-bold text-white">Brand Brain Canonical Docs</p>
                    </div>
                    <div className="p-3 bg-[#242222] rounded-xl border border-[#373333] space-y-1">
                      <span className="text-[10px] uppercase text-[#E5E7EB]">Execution Frequency</span>
                      <p className="font-bold text-white">Autonomous (Continuous Trigger)</p>
                    </div>
                    <div className="p-3 bg-[#242222] rounded-xl border border-[#373333] space-y-1">
                      <span className="text-[10px] uppercase text-[#E5E7EB]">Human Sign-Off Policy</span>
                      <p className="font-bold text-white">Strict Human In The Loop (Approvals Queue)</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/app/agents/${selectedRun.agent_id}`}>
                      <Button className="bg-[#242222] hover:bg-[#2C2929] border border-[#373333] text-white text-xs rounded-xl h-9">
                        <span>Edit Agent Configuration in Fleet</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#E5E7EB] space-y-3">
              <Activity className="w-10 h-10 text-[#443F3F]" />
              <p className="text-sm font-semibold text-white">No Execution Selected</p>
              <p>Select any agent run from the left activity stream to inspect details.</p>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* TRIGGER AGENT MODAL */}
      {/* ========================================================= */}
      {triggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2E2A2A] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-white fill-current" />
                  <span>Execute Autonomous Agent</span>
                </h3>
                <p className="text-xs text-[#E5E7EB] mt-0.5">
                  Select an agent from your fleet to run immediately.
                </p>
              </div>
              <button 
                onClick={() => setTriggerModalOpen(false)}
                className="text-[#E5E7EB] hover:text-white p-1 rounded-lg hover:bg-[#2A2828]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(AGENT_META).map(([id, meta]) => {
                const Icon = meta.icon
                const isRunning = executingAgentId === id

                return (
                  <div
                    key={id}
                    className="p-3 bg-[#242222] hover:bg-[#2B2727] border border-[#373333] rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AgentLogo id={id} name={meta.name} size="sm" showRing={false} />
                      <div>
                        <h4 className="text-xs font-bold text-white">{meta.name}</h4>
                        <span className="text-[10px] text-[#E5E7EB]">{meta.category}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleTriggerAgent(id)}
                      disabled={Boolean(executingAgentId)}
                      className="bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-semibold h-8 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                    </Button>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 border-t border-[#2E2A2A] flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTriggerModalOpen(false)}
                className="border-[#373333] bg-[#242222] text-white text-xs h-8 px-3"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
