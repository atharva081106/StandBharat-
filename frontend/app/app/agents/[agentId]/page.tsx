"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppProvider } from '@/lib/providers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Sparkles, 
  Zap, 
  Lock, 
  ArrowLeft, 
  Bot, 
  RefreshCw, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Layers,
  Settings,
  Save,
  Check,
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react'
import { AgentOutputInspector } from '@/components/agents/AgentOutputInspector'
import { AgentLogo } from '@/components/agents/AgentLogo'

interface AgentConfig {
  schedule: string;
  tone: string;
  requireApproval: boolean;
  customDirectives: string;
  targetChannels: string[];
  notificationEmail: boolean;
}

const DEFAULT_CONFIG: AgentConfig = {
  schedule: 'AUTONOMOUS',
  tone: 'BRAND_BRAIN',
  requireApproval: true,
  customDirectives: '',
  targetChannels: ['Brand Brain Knowledge Base', 'Approvals Queue'],
  notificationEmail: true
}

const AVAILABLE_CHANNELS = [
  'Brand Brain Knowledge Base',
  'Approvals Queue',
  'Deliverables Library',
  'Social Publishing Drafts'
]

export default function AgentDetail({ params }: { params?: Promise<{ agentId: string }> | { agentId: string } }) {
  const { agents } = useAppProvider()
  const routeParams = useParams()
  
  // Resolve agentId safely across Next.js versions (including Next.js 15+ Promise params)
  const resolvedAgentId = (
    (routeParams?.agentId as string) || 
    (params && 'agentId' in params && typeof (params as any).agentId === 'string' ? (params as any).agentId : '') ||
    ''
  )

  const [agent, setAgent] = useState<any>(null)
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  
  // Interactive Configuration State
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const fetchRuns = async (targetId = resolvedAgentId) => {
    if (!targetId) return
    try {
      const data = await agents.getAgentRuns(targetId)
      setRuns(data || [])
    } catch (e) {
      console.error('Failed to fetch runs:', e)
    }
  }

  // Load agent metadata and existing configuration
  useEffect(() => {
    if (!resolvedAgentId) return

    const loadData = async () => {
      setLoading(true)
      try {
        let loadedAgent = null
        try {
          loadedAgent = await agents.getAgent(resolvedAgentId)
        } catch (e1) {
          // Fallback alias resolution: try toggling '_agent' suffix
          const altId = resolvedAgentId.endsWith('_agent')
            ? resolvedAgentId.replace(/_agent$/, '')
            : `${resolvedAgentId}_agent`
          try {
            loadedAgent = await agents.getAgent(altId)
          } catch (e2) {
            console.warn('Fallback agent fetch failed:', e2)
          }
        }

        if (loadedAgent) {
          setAgent(loadedAgent)
        }

        // Load saved configuration from localStorage first
        const cacheKey = `standbharat_agent_config_${resolvedAgentId}`
        let activeCfg = { ...DEFAULT_CONFIG }
        try {
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            activeCfg = { ...activeCfg, ...JSON.parse(cached) }
          }
        } catch (err) {}

        // Then check if backend has saved configuration
        if (agents.getAgentConfig) {
          try {
            const remoteCfg = await agents.getAgentConfig(resolvedAgentId)
            if (remoteCfg && typeof remoteCfg === 'object') {
              activeCfg = {
                ...activeCfg,
                schedule: remoteCfg.schedule || activeCfg.schedule,
                tone: remoteCfg.tone || activeCfg.tone,
                requireApproval: remoteCfg.require_approval !== undefined ? remoteCfg.require_approval : activeCfg.requireApproval,
                customDirectives: remoteCfg.custom_directives !== undefined ? remoteCfg.custom_directives : activeCfg.customDirectives,
                targetChannels: remoteCfg.target_channels || activeCfg.targetChannels,
                notificationEmail: remoteCfg.notification_email !== undefined ? remoteCfg.notification_email : activeCfg.notificationEmail
              }
            }
          } catch (e) {}
        }

        setConfig(activeCfg)
        await fetchRuns(resolvedAgentId)
      } catch (err) {
        console.error('Failed to load agent:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedAgentId, agents])

  const handleConfigChange = (key: keyof AgentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
    setSaveSuccess(false)
  }

  const toggleChannel = (channel: string) => {
    setConfig(prev => {
      const exists = prev.targetChannels.includes(channel)
      const updated = exists 
        ? prev.targetChannels.filter(c => c !== channel)
        : [...prev.targetChannels, channel]
      return { ...prev, targetChannels: updated }
    })
    setIsDirty(true)
    setSaveSuccess(false)
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      // Save locally for instant UX
      const cacheKey = `standbharat_agent_config_${resolvedAgentId}`
      localStorage.setItem(cacheKey, JSON.stringify(config))

      // Persist to backend API if available
      if (agents.saveAgentConfig) {
        await agents.saveAgentConfig(resolvedAgentId, {
          schedule: config.schedule,
          tone: config.tone,
          require_approval: config.requireApproval,
          custom_directives: config.customDirectives,
          target_channels: config.targetChannels,
          notification_email: config.notificationEmail
        })
      }

      setIsDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      console.error('Error saving config:', e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    setIsDirty(true)
    setSaveSuccess(false)
  }

  const handleRun = async () => {
    if (!resolvedAgentId) return
    setRunning(true)
    try {
      // Auto-save configuration before executing
      const cacheKey = `standbharat_agent_config_${resolvedAgentId}`
      localStorage.setItem(cacheKey, JSON.stringify(config))

      await agents.runAgent(resolvedAgentId, { 
        input_data: { 
          config: config,
          schedule: config.schedule,
          tone: config.tone,
          require_approval: config.requireApproval,
          custom_directives: config.customDirectives,
          target_channels: config.targetChannels
        } 
      })

      // Refresh runs after execution starts
      setTimeout(() => fetchRuns(resolvedAgentId), 1500)
      setTimeout(() => fetchRuns(resolvedAgentId), 4000)
      setTimeout(() => fetchRuns(resolvedAgentId), 8000)
    } catch(e) {
      console.error('Failed to run agent:', e)
    } finally {
      setRunning(false)
      await fetchRuns(resolvedAgentId)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-[#E5E7EB] bg-[#171515] py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-4 border-[#373333] border-t-[#8F0028] animate-spin"></div>
          <p className="text-sm font-semibold text-white">Loading Agent Workspace & Configurations...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center bg-[#171515] text-[#EF4444] py-24">
        <div className="flex flex-col items-center gap-3 bg-[#1C1A1A] p-8 rounded-2xl border border-[#373333] text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-white" />
          <p className="text-lg font-bold text-white">Agent Not Found</p>
          <p className="text-xs text-[#E5E7EB]">
            The agent &quot;{resolvedAgentId}&quot; could not be resolved in the marketing fleet.
          </p>
          <Link href="/app/agents">
            <Button variant="outline" className="mt-2 border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222]">
              Back to Agents Fleet
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#171515] text-white custom-scrollbar">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#E5E7EB]">
        <Link 
          href="/app/agents" 
          className="hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Marketing Fleet</span>
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{agent.name}</span>
        <span>/</span>
        <span className="text-white font-medium">Configure & Execute</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#373333] pb-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <AgentLogo id={agent.id || resolvedAgentId} name={agent.name} size="lg" showRing={false} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {agent.name}
                </h1>
                <Badge className="text-[10px] uppercase tracking-wider bg-[#8F0028]/20 text-white border border-[#8F0028]/40 font-bold">
                  {agent.status || "ACTIVE"}
                </Badge>
                {agent.tier === 'FREE' ? (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#252222] text-white border border-[#3A3535]">
                    Free Tier
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#8F0028]/20 text-white border border-[#8F0028]/40 flex items-center gap-1 font-bold">
                    <Lock className="w-2.5 h-2.5" /> Pro Plan
                  </span>
                )}
              </div>
              <p className="text-[#E5E7EB] text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
                {agent.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium pt-1">
            {agent.resourceProfile === 'LIGHTWEIGHT' ? (
              <span className="inline-flex items-center gap-1 text-white bg-[#221F1F] px-2.5 py-1 rounded-lg border border-[#373333]">
                <Zap className="w-3.5 h-3.5 text-white" /> Lightweight Compute (~{agent.creditCost || 500} credits/run)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-white bg-[#8F0028]/20 px-2.5 py-1 rounded-lg border border-[#8F0028]/40">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Deep Compute Model (~{agent.creditCost || 2000} credits/run)
              </span>
            )}
            <span className="text-[#E5E7EB]">• Grounded in active Brand Brain context</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={() => fetchRuns(resolvedAgentId)}
            className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button 
            onClick={handleRun} 
            disabled={running} 
            className="min-w-[140px] bg-[#8F0028] hover:bg-[#A8002F] text-white font-bold text-xs h-10 rounded-xl shadow-lg shadow-[#8F0028]/20 flex items-center gap-2 cursor-pointer"
          >
            {running ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Agent</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Configuration Form (Primary Focus) */}
        <div className="space-y-6">
          
          {/* Runtime Configuration Card */}
          <Card className="bg-[#1C1A1A] border-[#373333] shadow-md relative overflow-hidden">
            <CardHeader className="border-b border-[#373333] bg-[#242222] pb-3.5 px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-white" />
                <span>Agent Configuration</span>
              </CardTitle>
              {saveSuccess && (
                <span className="text-[11px] font-semibold text-white bg-emerald-950/40 border border-emerald-800/80 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in duration-200">
                  <Check className="w-3 h-3" /> Saved!
                </span>
              )}
            </CardHeader>
            <CardContent className="pt-5 px-5 space-y-4">
              
              {/* Execution Cadence / Schedule */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Execution Cadence
                </label>
                <select
                  value={config.schedule}
                  onChange={(e) => handleConfigChange('schedule', e.target.value)}
                  className="w-full bg-[#242222] border border-[#373333] focus:border-[#8F0028] text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-colors cursor-pointer"
                >
                  <option value="AUTONOMOUS">Autonomous Event-Driven (Trigger on new data)</option>
                  <option value="DAILY_0900">Daily Sprint (09:00 AM IST)</option>
                  <option value="WEEKLY">Weekly Deep Briefing (Mondays)</option>
                  <option value="MANUAL">Manual On-Demand Run Only</option>
                </select>
                <p className="text-[10px] text-[#E5E7EB] leading-tight">
                  Defines when this agent autonomously triggers and scans your market telemetry.
                </p>
              </div>

              {/* Reasoning Tone Grounding */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Tone & Reasoning Grounding
                </label>
                <select
                  value={config.tone}
                  onChange={(e) => handleConfigChange('tone', e.target.value)}
                  className="w-full bg-[#242222] border border-[#373333] focus:border-[#8F0028] text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-colors cursor-pointer"
                >
                  <option value="BRAND_BRAIN">Strict Brand Brain Grounding (Company USP & Voice)</option>
                  <option value="TECHNICAL">Technical & Authoritative (Data & Metrics Focused)</option>
                  <option value="HIGH_CONVERTING">High-Converting Growth & Viral Hooks</option>
                  <option value="EXECUTIVE">Executive C-Suite Strategic Summary</option>
                </select>
                <p className="text-[10px] text-[#E5E7EB] leading-tight">
                  Constrains the agent&apos;s LLM persona and messaging style.
                </p>
              </div>

              {/* Human-in-the-Loop Quality Gate */}
              <div className="pt-2 border-t border-[#2C2828] space-y-3">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Quality & Safety Guardrails
                </label>
                
                <div 
                  onClick={() => handleConfigChange('requireApproval', !config.requireApproval)}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#242222] border border-[#373333] hover:border-[#4A4444] cursor-pointer transition-colors"
                >
                  <div className="mt-0.5 text-white">
                    {config.requireApproval ? (
                      <CheckSquare className="w-4 h-4 fill-[#8F0028]/30" />
                    ) : (
                      <Square className="w-4 h-4 text-[#E5E7EB]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Require Human Approval
                    </span>
                    <span className="text-[10px] text-[#E5E7EB] leading-relaxed block mt-0.5">
                      Sends generated briefings and copy drafts to your Approvals Queue before any live distribution.
                    </span>
                  </div>
                </div>

                <div 
                  onClick={() => handleConfigChange('notificationEmail', !config.notificationEmail)}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#242222] border border-[#373333] hover:border-[#4A4444] cursor-pointer transition-colors"
                >
                  <div className="mt-0.5 text-white">
                    {config.notificationEmail ? (
                      <CheckSquare className="w-4 h-4 fill-[#8F0028]/30" />
                    ) : (
                      <Square className="w-4 h-4 text-[#E5E7EB]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Notify Team on Completion
                    </span>
                    <span className="text-[10px] text-[#E5E7EB] leading-relaxed block mt-0.5">
                      Post notification in top bell alerts when a new strategic deliverable is produced.
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Deliverable Channels */}
              <div className="pt-2 border-t border-[#2C2828] space-y-2">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Deliverable Destinations
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CHANNELS.map((ch) => {
                    const active = config.targetChannels.includes(ch)
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#8F0028]/25 text-white border-[#8F0028]/60 shadow-sm'
                            : 'bg-[#242222] text-[#E5E7EB] border-[#373333] hover:border-[#4A4444] hover:text-[#E5E7EB]'
                        }`}
                      >
                        {active ? '✓ ' : '+ '} {ch}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Directives & Topic Overrides */}
              <div className="pt-2 border-t border-[#2C2828] space-y-1.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Custom Directives & Guidelines
                </label>
                <textarea
                  value={config.customDirectives}
                  onChange={(e) => handleConfigChange('customDirectives', e.target.value)}
                  placeholder="e.g. Focus specifically on B2B SaaS in India, prioritize founder pain points, avoid generic claims without proof."
                  rows={3}
                  className="w-full bg-[#242222] border border-[#373333] focus:border-[#8F0028] text-xs text-white rounded-xl p-3 outline-none transition-colors resize-none placeholder:text-[#5E5959]"
                />
                <p className="text-[10px] text-[#E5E7EB] leading-tight">
                  Direct overrides injected straight into the agent&apos;s system prompt during execution.
                </p>
              </div>

              {/* Configuration Save Controls */}
              <div className="pt-3 border-t border-[#2C2828] flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetConfig}
                  className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs h-9 px-3"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className={`text-xs font-bold h-9 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    saveSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : isDirty
                      ? 'bg-[#8F0028] hover:bg-[#A8002F] text-white shadow-lg shadow-[#8F0028]/25'
                      : 'bg-[#2A2626] hover:bg-[#332E2E] text-white border border-[#3E3838]'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Configuration Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{isDirty ? 'Save Changes' : 'Save Configuration'}</span>
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Capabilities Specs */}
          <Card className="bg-[#1C1A1A] border-[#373333] shadow-md">
            <CardHeader className="border-b border-[#373333] bg-[#242222] pb-3.5 px-5">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8F0028]" />
                <span>Agent Capabilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-5">
              <ul className="space-y-2.5">
                {agent.capabilities?.map((cap: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                )) || (
                  <li className="text-xs text-[#E5E7EB] italic">Standard autonomous marketing reasoning.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Model Foundation Metadata */}
          <Card className="bg-[#1C1A1A] border-[#373333] shadow-md">
            <CardHeader className="border-b border-[#373333] bg-[#242222] pb-3.5 px-5">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#8F0028]" />
                <span>Foundation Architecture</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-5 space-y-3">
              <div className="bg-[#242222] p-3 rounded-xl border border-[#373333]">
                <span className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider block mb-0.5">
                  LLM Foundation
                </span>
                <span className="text-xs font-bold text-white">
                  {agent.tier === 'PRO' ? 'Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o' : 'Groq Llama 3 70B & Gemini Flash'}
                </span>
              </div>

              <div className="bg-[#242222] p-3 rounded-xl border border-[#373333]">
                <span className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider block mb-0.5">
                  Execution Quota
                </span>
                <span className="text-xs font-bold text-white">
                  ~{agent.creditCost || 500} credits per execution
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right 2 Columns: Execution History & Deliverables Inspector */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="flex flex-col bg-[#1C1A1A] border-[#373333] shadow-md">
            <CardHeader className="border-b border-[#373333] bg-[#242222] pb-4 px-6">
              <CardTitle className="flex justify-between items-center text-sm font-bold text-white">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8F0028]" />
                  <span>Execution History & Strategic Deliverables</span>
                </div>
                <Badge variant="outline" className="border-[#373333] text-[#E5E7EB] text-xs">
                  {runs.length} Runs
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              {runs.length > 0 ? (
                <div className="divide-y divide-[#373333]">
                  {runs.map((run) => (
                    <div key={run.id} className="p-6 hover:bg-[#201E1E] transition-colors">
                      {/* Top Run Metadata Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-sm">
                            {new Date(run.created_at).toLocaleString()}
                          </span>
                          <span className="text-xs text-[#E5E7EB] font-mono bg-[#242222] px-2 py-0.5 rounded border border-[#373333]">
                            Run #{run.id.substring(0, 8)}
                          </span>
                        </div>

                        <Badge 
                          className={`text-[10px] uppercase tracking-wider font-bold ${
                            run.status === 'SUCCESS' 
                              ? 'bg-[#8F0028]/20 text-white border border-[#8F0028]/40' 
                              : run.status === 'FAILED' 
                              ? 'bg-red-950/40 text-red-400 border border-red-800' 
                              : run.status === 'RUNNING' 
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50 animate-pulse' 
                              : 'bg-[#242222] text-[#E5E7EB] border-[#373333]'
                          }`}
                        >
                          {run.status}
                        </Badge>
                      </div>

                      {/* Error Alert if Failed */}
                      {run.error_message && (
                        <div className="mt-3 p-3.5 bg-red-950/40 text-red-400 text-xs rounded-xl border border-red-800/80 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="break-all font-medium leading-relaxed">{run.error_message}</span>
                        </div>
                      )}

                      {/* Human-Readable Output Inspector */}
                      {run.result_data && (
                        <AgentOutputInspector run={run} agentName={agent.name} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4 space-y-3">
                  <AgentLogo id={agent.id || resolvedAgentId} name={agent.name} size="lg" showRing={false} />
                  <div>
                    <p className="text-white font-bold text-base">No Execution Runs Yet</p>
                    <p className="text-xs text-[#E5E7EB] mt-1 max-w-sm">
                      Configure your execution cadence and custom directives on the left, then trigger this agent to produce strategic marketing deliverables.
                    </p>
                  </div>
                  <Button 
                    onClick={handleRun} 
                    className="mt-2 bg-[#8F0028] hover:bg-[#A8002F] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Run First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
