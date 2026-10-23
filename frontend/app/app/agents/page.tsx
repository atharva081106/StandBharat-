"use client"

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Bot, 
  Sparkles, 
  Lock, 
  Zap, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Search, 
  ExternalLink, 
  X,
  Layers,
  Crown,
  CheckCircle2,
  SlidersHorizontal,
  Lightbulb
} from 'lucide-react'
import { useAppProvider } from '@/lib/providers'
import { ApiClient } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { AgentLogo } from '@/components/agents/AgentLogo'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Agents() {
  const router = useRouter()
  const { agents, auth } = useAppProvider()
  const [agentsList, setAgentsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'pro' | 'exclusive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO'>(
    (auth?.activeWorkspace?.plan_tier?.toUpperCase() === 'PRO' || (auth?.activeWorkspace as any)?.plan?.toUpperCase() === 'PRO') ? 'PRO' : 'FREE'
  )
  const [usedCredits, setUsedCredits] = useState(0)
  const [totalCredits, setTotalCredits] = useState(1000000)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedProAgent, setSelectedProAgent] = useState<any>(null)

  const fetchPlan = async () => {
    if (auth?.activeWorkspace?.id) {
      try {
        const planData = await ApiClient.get<any>(`/api/workspaces/${auth.activeWorkspace.id}/plan`)
        if (planData) {
          const planTier = (planData.plan_tier || 'FREE').toUpperCase()
          setUserPlan(planTier === 'PRO' || planTier === 'ENTERPRISE' ? 'PRO' : 'FREE')
          setUsedCredits(planData.used_credits_this_month || 0)
          setTotalCredits(planData.monthly_credit_quota || (planTier === 'PRO' ? 1000000 : 50000))
        }
      } catch (e) {
        console.error('Failed to load live workspace plan:', e)
      }
    }
  }

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agents.getAgents()
        setAgentsList(data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [agents])

  useEffect(() => {
    fetchPlan()
  }, [auth?.activeWorkspace?.id])

  const filteredAgents = useMemo(() => {
    return agentsList.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.capabilities && a.capabilities.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())))

      if (!matchesSearch) return false

      if (activeTab === 'free') return a.tier === 'FREE'
      if (activeTab === 'pro') return a.tier === 'PRO'
      if (activeTab === 'exclusive') return a.isStandBharatExclusive
      return true
    })
  }, [agentsList, activeTab, searchQuery])

  const handleAgentClick = (agent: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const isProLocked = agent.tier === 'PRO' && userPlan === 'FREE'
    if (isProLocked) {
      setSelectedProAgent(agent)
      setUpgradeModalOpen(true)
      return
    }
    const targetId = agent.id || agent.agent_id
    router.push(`/app/agents/${targetId}`)
  }

  const handleSimulateUpgrade = async () => {
    if (auth?.activeWorkspace?.id) {
      try {
        await ApiClient.post(`/api/workspaces/${auth.activeWorkspace.id}/upgrade`, { plan: 'PRO' })
        await fetchPlan()
      } catch (e) {
        console.error('Failed to upgrade workspace plan:', e)
      }
    }
    setUserPlan('PRO')
    setTotalCredits(1000000)
    setUpgradeModalOpen(false)
  }

  const formatTag = (tag: string) => {
    return tag
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-[#E5E7EB] bg-[#171515] py-28">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#2E2A2A] border-t-[#8F0028] animate-spin"></div>
          <p className="text-sm font-semibold text-white">Loading 15 Autonomous Agents...</p>
        </div>
      </div>
    )
  }

  const freeCount = agentsList.filter((a) => a.tier === 'FREE').length
  const proCount = agentsList.filter((a) => a.tier === 'PRO').length
  const exclusiveCount = agentsList.filter((a) => a.isStandBharatExclusive).length
  const percentUsed = Math.min(100, Math.round((usedCredits / totalCredits) * 100))

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-7 bg-[#171515] text-white custom-scrollbar">
      {/* Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2C2828] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#262323] text-white border border-[#3E3838]">
              Autonomous AI Team
            </span>
            <span className="text-[11px] font-bold text-white bg-[#262323] px-2.5 py-0.5 rounded-full border border-[#3E3838] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              15 Agents Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Marketing Agent Fleet
          </h1>
          <p className="text-[#E5E7EB] text-sm sm:text-base mt-1">
            15 specialized autonomous AI marketing agents orchestrating your complete organic and paid growth funnel.
          </p>
        </div>

        {/* Global Plan Status Indicator */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/pricing" className="text-xs font-semibold text-white hover:text-white hover:underline flex items-center gap-1">
            View All Plans <ExternalLink className="w-3 h-3" />
          </Link>
          {userPlan === 'FREE' ? (
            <Button
              onClick={() => {
                setSelectedProAgent(null)
                setUpgradeModalOpen(true)
              }}
              className="bg-[#8F0028] hover:bg-[#A8002F] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#8F0028]/25 flex items-center gap-1.5 h-9 px-4 transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-white" /> Upgrade to Pro
            </Button>
          ) : (
            <span className="bg-[#262323] text-white border border-[#3E3838] font-bold text-xs py-1 px-3 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Pro Plan Active (15 Unlocked)
            </span>
          )}
        </div>
      </div>

      {/* Instructions & How It Works Callout */}
      <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#262323] border border-[#3E3838] text-white shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="font-bold text-white text-xs sm:text-sm block">
              How Autonomous Agents Work in StandBharat
            </span>
            <p className="text-[#E5E7EB] text-xs leading-relaxed max-w-3xl">
              1. <strong>Select Any Agent:</strong> Click <strong>Configure Agent</strong> to set execution frequency, tone grounding, and custom directives.<br />
              2. <strong>Autonomous or On-Demand:</strong> Agents execute tasks and deposit drafted briefs, blog outlines, and social campaigns directly into your <strong>Approvals Queue</strong>.<br />
              3. <strong>Quality Sign-off:</strong> Nothing is ever published or dispatched externally without your final human approval.
            </p>
          </div>
        </div>
        <Link href="/app/approvals" className="shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-[#373333] text-white hover:text-white hover:bg-[#252222] text-xs h-8 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <span>Approvals Queue</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Hero Resource & Credit Quota Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#1C1A1A] border border-[#2D2A2A] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#8F0028]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 flex-1 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-xl text-sm">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-[#E5E7EB] text-xs font-semibold uppercase tracking-wider">Workspace Plan:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${userPlan === 'FREE' ? 'bg-[#242121] text-white border border-[#3E3838]' : 'bg-[#262323] text-white border border-[#3E3838]'}`}>
                {userPlan === 'FREE' ? 'Starter (Free Forever)' : 'Growth (Pro Plan)'}
              </span>
            </div>
            <span className="text-xs text-[#E5E7EB] font-medium">
              <strong className="text-white">{usedCredits.toLocaleString()}</strong> / {totalCredits.toLocaleString()} Credits ({100 - percentUsed}% Left)
            </span>
          </div>

          {/* Progress Bar (Solid Burgundy) */}
          <div className="w-full max-w-xl h-2 bg-[#262222] rounded-full overflow-hidden border border-[#332E2E]">
            <div
              className="h-full transition-all duration-500 rounded-full bg-[#8F0028]"
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#E5E7EB] pt-0.5">
            {userPlan === 'FREE' ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-white font-semibold bg-[#262222] px-2.5 py-0.5 rounded-md border border-[#3E3838]">
                  <Zap className="w-3.5 h-3.5 text-white" /> Low Resource Compute Active (Groq Llama-3 & Gemini Flash)
                </span>
                <span className="text-[#E5E7EB]">• Strict 500 max_tokens limit per generation to prevent token burn</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-white font-semibold bg-[#8F0028]/20 px-2.5 py-0.5 rounded-md border border-[#8F0028]/40">
                  <Sparkles className="w-3.5 h-3.5 text-white" /> Frontier Models Active (Claude 3.5 Sonnet & GPT-4o)
                </span>
                <span className="text-[#E5E7EB]">• 1,000,000 monthly credits with multi-channel auto-publishing</span>
              </>
            )}
          </div>
        </div>

        {userPlan === 'FREE' && (
          <div className="shrink-0 flex items-center gap-2 relative z-10">
            <Button
              onClick={() => {
                setSelectedProAgent(null)
                setUpgradeModalOpen(true)
              }}
              className="bg-[#242121] hover:bg-[#2C2727] text-white border border-[#3A3535] hover:border-[#8F0028]/60 font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all group"
            >
              <span>Unlock 12 Pro Agents</span>
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1C1A1A] rounded-xl border border-[#2D2A2A]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-[#8F0028] text-white shadow-sm'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#242121]'
            }`}
          >
            All Agents ({agentsList.length})
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'free'
                ? 'bg-[#2E2828] text-white border border-[#483F3F] shadow-sm'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#242121]'
            }`}
          >
            <span>Free Tier ({freeCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('pro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'pro'
                ? 'bg-[#2A2727] text-white border border-[#443F3F] shadow-sm'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#242121]'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Pro Unlocked ({proCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('exclusive')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'exclusive'
                ? 'bg-[#2A2727] text-white border border-[#443F3F] shadow-sm'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#242121]'
            }`}
          >
            StandBharat Exclusives ({exclusiveCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#E5E7EB] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#2D2A2A] bg-[#1C1A1A] text-white placeholder-[#8E8B88] focus:outline-none focus:ring-1 focus:ring-[#8F0028] focus:border-[#8F0028] transition-all"
          />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => {
          const isProLocked = agent.tier === 'PRO' && userPlan === 'FREE'

          return (
            <Card
              key={agent.id}
              onClick={(e) => handleAgentClick(agent, e)}
              className={`flex flex-col transition-all group relative overflow-hidden rounded-2xl border ${
                isProLocked
                  ? 'border-[#2C2828] bg-[#191717] hover:border-[#8F0028]/60 hover:shadow-xl cursor-pointer'
                  : 'border-[#2C2828] bg-[#1C1A1A] hover:border-[#8F0028] hover:shadow-xl cursor-pointer'
              }`}
            >

              {/* Card Header with Non-Colliding Responsive Flex Flow */}
              <div className="p-5 border-b border-[#2A2626] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <AgentLogo id={agent.id} name={agent.name} size="md" showRing={false} />

                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-white leading-snug group-hover:text-white transition-colors">
                      {agent.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {agent.tier === 'FREE' && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#252222] text-white border border-[#3A3535]">
                          Free Tier
                        </span>
                      )}

                      {agent.isStandBharatExclusive && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#262323] text-white border border-[#3E3838] flex items-center gap-1">
                          ★ StandBharat Exclusive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right aligned status badge (strictly shrink-0, zero overlap) */}
                <div className="shrink-0 pt-0.5">
                  {isProLocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#262323] text-white border border-[#3E3838] text-[10px] font-semibold uppercase tracking-wider shadow-sm">
                      <Lock className="w-3 h-3" /> Pro Plan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-[#262323] text-white border border-[#3E3838] font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {agent.status || 'Active'}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4 relative z-20">
                <p className="text-xs text-[#E5E7EB] leading-relaxed line-clamp-3">
                  {agent.description}
                </p>

                <div className="space-y-3 pt-1">
                  {/* Human-Readable Capability Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities?.map((cap: string, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium bg-[#221F1F] text-white px-2.5 py-1 rounded-lg border border-[#302B2B] hover:border-[#443E3E] transition-colors"
                      >
                        {formatTag(cap)}
                      </span>
                    ))}
                  </div>

                  {/* Resource & Credit Specs Footer */}
                  <div className="flex items-center justify-between text-xs pt-3.5 border-t border-[#2A2626]">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {agent.resourceProfile === 'LIGHTWEIGHT' ? (
                        <span className="inline-flex items-center gap-1 text-white bg-[#221F1F] px-2 py-0.5 rounded border border-[#373333]">
                          <Zap className="w-3 h-3 text-white" /> ~{agent.creditCost || 500} cr/run
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-white bg-[#262323] px-2 py-0.5 rounded border border-[#3E3838]">
                          <Flame className="w-3 h-3 text-white" /> ~{agent.creditCost || 2000} cr/run
                        </span>
                      )}
                    </div>

                    {isProLocked ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAgentClick(agent, e); }}
                        className="text-white hover:text-white bg-[#262323] hover:bg-[#322E2E] px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#3E3838] transition-all flex items-center gap-1 cursor-pointer z-30"
                      >
                        <span>Unlock with Pro</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAgentClick(agent, e); }}
                        className="text-white hover:text-white bg-[#8F0028]/25 hover:bg-[#8F0028] px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#8F0028]/40 transition-all flex items-center gap-1 cursor-pointer z-30 shadow-sm"
                      >
                        <span>Configure Agent</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Upgrade to Pro Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1A1A] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#373333] relative animate-in zoom-in-95 duration-200 text-white">
            <button
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute top-5 right-5 text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#242121] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-[#8F0028] text-white rounded-full">
                StandBharat Pro
              </span>
              <span className="text-xs font-bold text-white bg-[#8F0028]/25 px-2.5 py-1 rounded-full border border-[#8F0028]/40">
                14-Day Free Trial
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              {selectedProAgent ? `Unlock the ${selectedProAgent.name}` : 'Unlock All 15 Specialized AI Agents'}
            </h3>
            <p className="text-sm text-[#E5E7EB] leading-relaxed mb-6">
              You are currently on the Free Starter plan. Upgrading to Pro unlocks full autonomous execution across all 15 agents and exclusive competitor intelligence tracking.
            </p>

            <div className="p-4 rounded-2xl bg-[#221F1F] border border-[#302B2B] mb-6 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#E5E1DD]">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>All 15 Specialized AI Agents (Reddit, LinkedIn, X, UGC, GEO, Competitor Spy)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#E5E1DD]">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>1,000,000 AI Credits / month (powered by Claude 3.5 Sonnet & GPT-4o)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#E5E1DD]">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>Multi-channel auto-publishing (LinkedIn, WordPress, Webflow, X)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#E5E1DD]">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>Real-time competitor counter-positioning alerts</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div>
                <div className="text-xl font-black text-white">₹4,999 <span className="text-xs text-[#E5E7EB] font-normal">/ month</span></div>
                <div className="text-[11px] text-[#E5E7EB]">Cancel anytime · Instant activation</div>
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setUpgradeModalOpen(false)}
                  className="bg-transparent border-[#3A3535] text-[#E5E7EB] hover:text-white hover:bg-[#252222] text-xs font-bold h-10 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSimulateUpgrade}
                  className="bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold h-10 px-5 rounded-xl shadow-lg shadow-[#8F0028]/30 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Activate Pro Access</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
