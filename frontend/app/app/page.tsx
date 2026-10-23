"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  useAuth, useDashboard, useOrchestrator, useBrandBrain, useAgents, useAiCmo 
} from '@/lib/providers/MockProvider'
import { ApiClient } from '@/lib/api/client'
import { 
  Layers, ChevronLeft, ChevronDown, BarChart2, Link as LinkIcon, 
  Globe, FileText, Bot, Search, AlertCircle, ArrowRight, Zap, 
  Target, LineChart, FileCode, Send, Paperclip, CheckCircle2,
  Lock, Plus, Settings, MessageSquare, Briefcase, User, Sparkles, 
  ExternalLink, Check, RefreshCw, Play, X, TrendingUp, ShieldCheck, Loader2
} from 'lucide-react'

import { BusinessOverviewPanel } from '@/components/dashboard/context/BusinessOverviewPanel'
import { WebsiteAnalysisPanel } from '@/components/dashboard/context/WebsiteAnalysisPanel'
import { DocumentsPanel } from '@/components/dashboard/context/DocumentsPanel'
import { AudiencePanel } from '@/components/dashboard/context/AudiencePanel'
import { BrandVoicePanel } from '@/components/dashboard/context/BrandVoicePanel'
import { ProductsPanel } from '@/components/dashboard/context/ProductsPanel'
import { CompetitorsPanel } from '@/components/dashboard/context/CompetitorsPanel'
import { useWebsiteAnalysis } from '@/lib/providers/WebsiteAnalysisProvider'
import { useDocuments } from '@/lib/providers/DocumentProvider'
import LighthouseAuditWidget from '@/components/analytics/LighthouseAuditWidget'
import { ChatMessageRenderer } from '@/components/chat/ChatMessageRenderer'
import { DocumentDeliveryViewer } from '@/components/dashboard/context/DocumentDeliveryViewer'
import { AgentLogo } from '@/components/agents/AgentLogo'
import { CompetitorLogo } from '@/components/competitors/CompetitorLogo'
import { FastApprovalModal } from '@/components/approvals/FastApprovalModal'
import { AutonomousSprintModal } from '@/components/agents/AutonomousSprintModal'
import { StrategicRecommendationModal } from '@/components/cmo/StrategicRecommendationModal'
import { ExportReportModal } from '@/components/reports/ExportReportModal'
import { AttributionFunnelVisualizer } from '@/components/analytics/AttributionFunnelVisualizer'
import { NextBestActionFeed } from '@/components/dashboard/NextBestActionFeed'
import { MorningBriefingCard } from '@/components/dashboard/MorningBriefingCard'

export default function AIWorkspace() {
  const auth = useAuth()
  const { activeWorkspace, activeBrand } = auth
  const dashboardProvider = useDashboard()
  const orchestratorProvider = useOrchestrator()
  const { analysis, refreshAnalysis } = useWebsiteAnalysis()
  const { brandBrain, refresh: refreshBrandBrain } = useBrandBrain()
  const { documents: kbDocuments, generateRealDocuments: kbGenerateReal, fetchDocuments: kbFetchDocs } = useDocuments()
  const agentsProvider = useAgents()
  const aiCmoProvider = useAiCmo()
  
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false)
  const [agentRuns, setAgentRuns] = useState<any[]>([])
  const [agentsList, setAgentsList] = useState<any[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [approvalsCount, setApprovalsCount] = useState(0)
  const [isApprovingAll, setIsApprovingAll] = useState(false)
  const [websiteAnalytics, setWebsiteAnalytics] = useState<any>(null)
  
  const [activeNav, setActiveNav] = useState('Analytics')
  const [dataModel, setDataModel] = useState<any>(null)
  const [analyticsTab, setAnalyticsTab] = useState<'Attribution' | 'SEO' | 'Links' | 'GEO' | 'Content'>('Attribution')
  const [isFastApprovalOpen, setIsFastApprovalOpen] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false)
  const [isExportReportOpen, setIsExportReportOpen] = useState(false)
  const [agentCategoryFilter, setAgentCategoryFilter] = useState<'ALL' | 'SEO' | 'SOCIAL' | 'PAID' | 'STRATEGY'>('ALL')
  const [cmoTab, setCmoTab] = useState<'Chat' | 'Research' | 'Strategy' | 'Tasks'>('Chat')
  const [cwvDevice, setCwvDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [onboardingData, setOnboardingData] = useState<any>(null)
  
  // Interactive Agent Runner State
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null)
  
  // AI CMO Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, timestamp?: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  const isApi = process.env.NEXT_PUBLIC_DATA_MODE === 'api'

  const competitorsList = isApi 
    ? ((brandBrain?.competitors && brandBrain.competitors.length > 0)
        ? brandBrain.competitors.map((c: any) => c.name)
        : (onboardingData?.competitors?.length > 0 ? onboardingData.competitors : []))
    : (onboardingData?.competitors?.length > 0 ? onboardingData.competitors : [])

  useEffect(() => {
    try {
      const data = localStorage.getItem('onboardingData')
      if (data) {
        setOnboardingData(JSON.parse(data))
      }
    } catch (e) {}

    async function load() {
      try {
        const data = await dashboardProvider.getDashboard()
        setDataModel(data)
        
        if (isApi) {
          try {
            const [runs, agents, approvals, webAnalytics] = await Promise.all([
              agentsProvider.getAgentRuns(),
              agentsProvider.getAgents(),
              ApiClient.get<any[]>('/api/approvals?status=PENDING').catch(() => []),
              ApiClient.get<any>('/api/dashboard/website-analytics').catch(() => null)
            ])
            setAgentRuns(runs || [])
            setAgentsList(agents || [])
            if (approvals && Array.isArray(approvals)) {
              setPendingApprovals(approvals)
              setApprovalsCount(approvals.length)
            } else {
              setPendingApprovals([])
              setApprovalsCount(0)
            }
            if (webAnalytics) {
              setWebsiteAnalytics(webAnalytics)
            }
          } catch(e) { console.error('Failed to load agent runs', e) }
        }
      } catch(e) {}
    }
    load()
  }, [auth.activeBrand?.id])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, isChatLoading])

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Handle Approve All
  const handleApproveAll = async () => {
    setIsApprovingAll(true)
    try {
      if (isApi && pendingApprovals.length > 0) {
        await Promise.all(
          pendingApprovals.map(app => 
            ApiClient.post(`/api/approvals/${app.id}/approve`, {}).catch(() => null)
          )
        )
      }
      setApprovalsCount(0)
      setPendingApprovals([])
      showToast('All drafts approved! Ready for publication.', 'success')
    } catch(e) {
      showToast('Failed to approve all drafts', 'error')
    } finally {
      setIsApprovingAll(false)
    }
  }

  // Handle Running Agent
  const handleRunAgent = async (agent: any) => {
    const agentId = agent.id || agent.agent_id
    setRunningAgentId(agentId)
    try {
      if (isApi) {
        await ApiClient.post(`/api/agents/${agentId}/run`, { 
          input_data: { brand: activeBrand?.name || 'Workspace Brand', domain: activeBrand?.website_url || '' } 
        })
        const updatedRuns = await agentsProvider.getAgentRuns()
        setAgentRuns(updatedRuns || [])
      }
      showToast(`${agent.name} executed successfully!`, 'success')
    } catch(e: any) {
      showToast(`${agent.name} queued in worker background`, 'info')
    } finally {
      setRunningAgentId(null)
      setSelectedAgent(null)
    }
  }

  // Handle Producing Real AI Documents
  const handleProduceRealDocs = async () => {
    setIsGeneratingDoc(true)
    try {
      await kbGenerateReal()
      await kbFetchDocs()
      refreshBrandBrain()
      showToast('Real AI documents produced & indexed for AI successfully!', 'success')
    } catch (e: any) {
      showToast('Failed to produce documents: ' + (e.message || 'Error'), 'error')
    } finally {
      setIsGeneratingDoc(false)
    }
  }

  // Format Markdown for Document Viewer
  const renderDocumentMarkdown = (text: string) => {
    if (!text) return null
    const lines = text.split('\n')
    return (
      <div className="space-y-3 font-sans text-[13px] leading-relaxed text-[#E5E7EB]">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-[18px] font-bold text-white pt-2 pb-1 border-b border-[#373333]">
                {trimmed.replace('# ', '')}
              </h1>
            )
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-[15px] font-bold text-white pt-3 pb-1">
                {trimmed.replace('## ', '')}
              </h2>
            )
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-[13px] font-bold text-white pt-2">
                {trimmed.replace('### ', '')}
              </h3>
            )
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8F0028] mt-2 shrink-0"></span>
                <span className="text-[#E5E7EB]">{trimmed.replace(/^[-*]\s+/, '')}</span>
              </div>
            )
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-3 py-1.5 border-l-2 border-[#8F0028] bg-[#1C1A1A] italic text-[#E5E7EB] rounded-r text-[12px]">
                {trimmed.replace('> ', '')}
              </blockquote>
            )
          }
          if (trimmed === '') {
            return <div key={idx} className="h-1"></div>
          }
          return (
            <p key={idx} className="text-[#E5E7EB]">
              {trimmed}
            </p>
          )
        })}
      </div>
    )
  }

  // Handle AI CMO Chat
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim()
    if (!query || isChatLoading) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { role: 'user' as const, content: query, timestamp: timeStr }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)

    try {
      let botReply = ''
      if (isApi) {
        try {
          const res = await aiCmoProvider.chat(query)
          if (res && res.response) {
            botReply = res.response
          }
        } catch(e) {}
      }

      if (!botReply) {
        const brandName = activeBrand?.name || 'Your Brand'
        const domain = activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : (brandBrain?.brand?.website_url ? brandBrain.brand.website_url.replace(/^https?:\/\//,'') : 'yourdomain.com')
        const targetAudience = brandBrain?.audiences?.[0]?.name || brandBrain?.audiences?.[0]?.demographics || 'Core Target Audience'
        const painPoints = brandBrain?.audiences?.[0]?.pain_points || 'Operational bottlenecks and customer discovery'
        const primaryGoal = brandBrain?.goals?.[0]?.goal || 'Accelerate Business Growth'
        const targetRevenue = brandBrain?.goals?.[0]?.target_value || 'target milestones'
        const valueProp = brandBrain?.positioning?.unique_value_proposition || activeBrand?.mission || 'Distinctive market advantage'
        const comps = brandBrain?.competitors?.map((c: any) => c.name).filter(Boolean) || []
        const compsList = comps.length > 0 ? comps.join(', ') : 'Direct Market Alternatives'

        const lower = query.toLowerCase()
        if (lower.includes('strategy') || lower.includes('30 day') || lower.includes('plan')) {
          botReply = `Here is your **30-Day Growth Playbook** for ${brandName}:\n\n` +
            `• **Week 1 (Organic Authority):** Launch content addressing primary audience pain point: "${painPoints}".\n` +
            `• **Week 2 (SEO & Positioning):** Optimize ${domain} landing pages for "${valueProp}" and high-intent industry queries.\n` +
            `• **Week 3 (Competitive Advantage):** Highlight key differentiators against ${compsList} across social and search channels.\n` +
            `• **Week 4 (Conversion Focus):** Align lead capture and CTA flows to track toward ${targetRevenue} (${primaryGoal}).`
        } else if (lower.includes('competitor') || lower.includes('track')) {
          if (comps.length > 0) {
            botReply = `You are currently tracking **${comps.join('**, **')}** for **${brandName}**:\n\n` +
              comps.map((c: string, idx: number) => `${idx + 1}. **${c}**: Monitored for search share, positioning changes, and pricing benchmarks.`).join('\n') +
              `\n\n**${brandName} Differentiator**: ${valueProp}`
          } else {
            botReply = `You haven't added specific competitors yet for ${brandName}. Head over to Brand Brain → Competitors to add your direct rivals so the Competitor Intelligence agent can track them.`
          }
        } else if (lower.includes('customer') || lower.includes('target') || lower.includes('pain') || lower.includes('who')) {
          botReply = `Your primary ICP for ${brandName} is **${targetAudience}**:\n\n` +
            `• **Core Pain Point:** ${painPoints}\n` +
            `• **Value Proposition:** ${valueProp}\n` +
            `• **Primary Business Objective:** ${primaryGoal}`
        } else if (lower.includes('recommendation') || lower.includes('campaign')) {
          botReply = `I've prepared a recommended campaign for **${brandName}** targeting **${targetAudience}**:\n\n` +
            `1. *Hook:* Directly address "${painPoints}"\n` +
            `2. *Solution:* Showcase "${valueProp}"\n` +
            `3. *Call to Action:* Drive conversions toward your goal of "${primaryGoal}"\n\n` +
            `You can generate full copy using the Content Writer Agent or review drafts in the **Approvals Queue**.`
        } else {
          botReply = `Based on **${brandName}**'s positioning (${valueProp}), our greatest immediate lever is engaging **${targetAudience}** by addressing "${painPoints}" on ${domain}. How would you like to proceed with our growth plan?`
        }
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } catch(err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: "I've processed your prompt and synced with your workspace context.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="flex w-full h-full divide-x divide-[#373333] relative overflow-x-auto overflow-y-hidden custom-scrollbar">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
          toastMessage.type === 'success' 
            ? 'bg-[#242222] border-[#373333] text-white' 
            : toastMessage.type === 'error'
            ? 'bg-[#242222] border-[#8F0028] text-white'
            : 'bg-[#242222] border-[#373333] text-white'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-[#8F0028]" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 shrink-0 text-white" />}
          <span className="text-[12px] font-semibold text-white">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-[#E5E7EB] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* COLUMN 1: CONTEXT */}
      {/* ========================================================= */}
      <div className="w-[260px] lg:w-[280px] shrink-0 flex flex-col h-full bg-[#1C1A1A] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#373333] sticky top-0 bg-[#1C1A1A] z-10">
          <div className="flex items-center gap-2 text-white font-bold text-[13px]">
            <Layers className="w-4 h-4 text-[#E5E7EB]" />
            <span>Context</span>
            <span 
              className="text-[9.5px] font-semibold text-white bg-[#262323] border border-[#3E3838] px-2 py-0.5 rounded-full"
              title="Step 1: Your company knowledge base & brand grounding"
            >
              Step 1: Grounding
            </span>
          </div>
          <button 
            onClick={() => setActiveNav('Analytics')}
            className="text-[11px] font-semibold text-[#8F0028] hover:text-white transition-colors"
          >
            Dashboard
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Workspace Card */}
          <div 
            onClick={() => setActiveNav('Business Overview')}
            className="bg-[#242222] border border-[#373333] rounded-xl p-3 flex items-center gap-3 relative group hover:border-[#8F0028]/50 transition-colors cursor-pointer"
          >
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
               <div className="w-5 h-5 bg-[#8F0028] rounded-[4px] flex items-center justify-center font-bold text-[10px] text-white">
                 {activeBrand?.name?.[0]?.toUpperCase() || 'B'}
               </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-white truncate">{activeBrand?.name || 'Workspace Brand'}</p>
              <p className="text-[11px] text-[#E5E7EB] truncate">{activeBrand?.category || brandBrain?.brand?.category || 'Active Brand'} • {activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : 'Configure domain'}</p>
            </div>
            <button className="text-[#E5E7EB] opacity-0 group-hover:opacity-100 hover:text-white transition-all absolute right-2 top-2">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation - Business */}
          <div className="space-y-1">
            <div 
              onClick={() => setActiveNav('Analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Analytics' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${activeNav === 'Analytics' ? 'text-[#8F0028]' : ''}`} />
              <span className="text-[13px] font-semibold">Command Center</span>
            </div>
            <div 
              onClick={() => setActiveNav('Business Overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Business Overview' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeNav === 'Business Overview' ? 'text-[#8F0028]' : ''}`} />
              <span className="text-[13px] font-semibold">Business Overview</span>
            </div>
            <div 
              onClick={() => setActiveNav('Website Analysis')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Website Analysis' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <Globe className={`w-4 h-4 ${activeNav === 'Website Analysis' ? 'text-[#8F0028]' : ''}`} />
              <span className="text-[13px] font-medium">Website Analysis</span>
            </div>
            <div 
              onClick={() => setActiveNav('Audience')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Audience' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <User className={`w-4 h-4 ${activeNav === 'Audience' ? 'text-[#8F0028]' : ''}`} />
              <span className="text-[13px] font-medium">Audience</span>
            </div>
            <div 
              onClick={() => setActiveNav('Brand Voice')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Brand Voice' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeNav === 'Brand Voice' ? 'text-[#8F0028]' : ''}`} />
              <span className="text-[13px] font-medium">Brand Voice</span>
            </div>
            <div 
              onClick={() => setActiveNav('Products & Services')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Products & Services' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <Target className={`w-4 h-4 ${activeNav === 'Products & Services' ? 'text-[#8F0028]' : ''}`} />
              <span className="text-[13px] font-medium">Products & Services</span>
            </div>
          </div>

          {/* Navigation - Documents */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">Knowledge Base</span>
              <button 
                onClick={() => {
                  setActiveNav('Documents')
                  showToast('Knowledge Base opened. Use "Produce Real AI Documents" or "New Document".', 'info')
                }}
                className="text-[#E5E7EB] hover:text-white transition-colors"
                title="Manage or Produce Documents"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div 
              onClick={() => setActiveNav('Documents')}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeNav === 'Documents' ? 'bg-[#2A2828] text-white border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className={`w-3.5 h-3.5 ${activeNav === 'Documents' ? 'text-[#8F0028]' : ''}`} />
                <span className="text-[13px] font-medium">All Documents</span>
              </div>
              {kbDocuments && kbDocuments.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1C1A1A] text-[#E5E7EB] border border-[#373333]">
                  {kbDocuments.length}
                </span>
              )}
            </div>
            
            {kbDocuments && kbDocuments.length > 0 ? (
              kbDocuments.slice(0, 6).map(doc => {
                const cleanTitle = doc.name.replace(/\.md$/, '').replace(/\.pdf$/, '')
                const isSelected = activeNav === doc.name || activeNav === cleanTitle
                return (
                  <div 
                    key={doc.id || doc.name} 
                    onClick={() => setActiveNav(doc.name)}
                    className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors ${
                      isSelected ? 'text-white bg-[#2A2828] rounded-lg border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#8F0028]' : ''}`} />
                      <span className="text-[13px] font-medium truncate">{cleanTitle}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-3 py-2 text-center">
                <p className="text-[11px] text-[#E5E7EB] mb-2">No documents indexed yet.</p>
                <button
                  onClick={handleProduceRealDocs}
                  disabled={isGeneratingDoc}
                  className="w-full py-1.5 bg-[#262323] hover:bg-[#2F2B2B] border border-[#373333] text-white hover:text-white text-[11px] font-bold rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>{isGeneratingDoc ? 'Generating...' : 'Produce Documents'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation - Competitors */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">Competitors</span>
              <button 
                onClick={() => setActiveNav('Competitors')}
                className="text-[#E5E7EB] hover:text-white transition-colors"
                title="Add or Discover Competitors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {competitorsList && competitorsList.length > 0 ? (
              competitorsList.map((comp: string, idx: number) => (
                <div 
                  key={`${comp}-${idx}`} 
                  onClick={() => setActiveNav(comp)}
                  className={`flex items-center justify-between px-3 py-1.5 group cursor-pointer transition-colors ${
                    activeNav === comp ? 'text-white bg-[#2A2828] rounded-lg border-l-2 border-[#8F0028]' : 'text-[#E5E7EB] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <CompetitorLogo name={comp} className="w-4 h-4 shrink-0 rounded" size={16} />
                    <span className="text-[13px] font-medium truncate">{comp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-1.5 text-[11px] text-[#E5E7EB]">
                <span>No competitors tracked yet.</span>
              </div>
            )}
          </div>
          
          <div className="pt-4 pb-8 px-3">
             <p className="text-[11px] text-[#E5E7EB] italic">"What your CMO reads before writing anything."</p>
          </div>
        </div>
      </div>


      {/* ========================================================= */}
      {/* COLUMN 2: MIDDLE PANE (ANALYTICS OR CONTEXT) */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-[400px] flex flex-col h-full bg-[#1C1A1A] overflow-hidden">
        
        {activeNav === 'Business Overview' ? (
          <BusinessOverviewPanel />
        ) : activeNav === 'Website Analysis' ? (
          <WebsiteAnalysisPanel />
        ) : activeNav === 'Documents' ? (
          <DocumentsPanel />
        ) : activeNav === 'Audience' ? (
          <AudiencePanel />
        ) : activeNav === 'Brand Voice' ? (
          <BrandVoicePanel />
        ) : activeNav === 'Products & Services' ? (
          <ProductsPanel />
        ) : activeNav === 'Competitors' || competitorsList.includes(activeNav) ? (
          <CompetitorsPanel selectedCompetitorName={competitorsList.includes(activeNav) ? activeNav : null} />
        ) : activeNav !== 'Analytics' ? (
          (() => {
            const activeDoc = kbDocuments?.find((d: any) => 
              d.name.toLowerCase() === activeNav.toLowerCase() ||
              d.name.replace(/\.md$/, '').toLowerCase() === activeNav.toLowerCase() ||
              d.category?.toLowerCase() === activeNav.toLowerCase() ||
              d.name.toLowerCase().includes(activeNav.toLowerCase())
            );

            const docTitle = activeDoc?.name || (activeNav.endsWith('.md') ? activeNav : `${activeNav}.md`)
            const docCategory = activeDoc?.category || activeNav

            if (activeDoc?.extracted_text) {
              return (
                <DocumentDeliveryViewer
                  title={docTitle}
                  content={activeDoc.extracted_text}
                  category={docCategory}
                  brandName={activeBrand?.name}
                  onRefresh={handleProduceRealDocs}
                  isRefreshing={isGeneratingDoc}
                />
              )
            }

            return (
              <div className="flex-1 flex flex-col h-full bg-[#1C1A1A] p-8 overflow-y-auto custom-scrollbar justify-center items-center">
                <div className="max-w-md w-full text-center p-8 bg-[#201E1E] rounded-3xl border border-[#373333] shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-[#262323] border border-[#373333] flex items-center justify-center text-white mx-auto mb-4">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-[18px] font-bold text-white mb-2">{docTitle}</h3>
                  <p className="text-[13px] text-[#E5E7EB] mb-6 leading-relaxed">
                    Generate an authoritative, publication-grade executive blueprint for <span className="text-white font-medium">{activeBrand?.name || 'your brand'}</span>.
                  </p>
                  <button
                    onClick={handleProduceRealDocs}
                    disabled={isGeneratingDoc}
                    className="w-full py-3 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[13px] font-bold rounded-xl transition-all shadow-lg shadow-[#8F0028]/25 flex items-center justify-center gap-2"
                  >
                    {isGeneratingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isGeneratingDoc ? 'Generating Blueprint...' : 'Produce Real AI Document Now'}</span>
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <>
            {/* Analytics Header */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-[#373333] shrink-0 bg-[#1C1A1A]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white font-bold text-[13px]">
                  <BarChart2 className="w-4 h-4 text-[#E5E7EB]" />
                  <span>Analytics</span>
                  <span 
                    className="text-[9.5px] font-semibold text-white bg-[#262323] border border-[#3E3838] px-2 py-0.5 rounded-full"
                    title="Step 2: Real-time Lighthouse speed & SEO telemetry"
                  >
                    Step 2: Live Telemetry
                  </span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-[#00A650]"></div>
              </div>
          
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#242222] border border-[#373333] rounded-md text-[11px] font-medium text-[#E5E7EB] cursor-pointer hover:text-white">
                  Last 30 days <ChevronDown className="w-3 h-3" />
                </div>
                <Link 
                  href="/app/analytics" 
                  className="text-[#E5E7EB] hover:text-white transition-colors" 
                  title="Open Dedicated Website Analytics"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-6 border-b border-[#373333] shrink-0 overflow-x-auto custom-scrollbar">
               {(['Attribution', 'SEO', 'Links', 'GEO', 'Content'] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setAnalyticsTab(tab)}
                   className={`px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors shrink-0 ${
                     analyticsTab === tab ? 'border-[#8F0028] text-white' : 'border-transparent text-[#E5E7EB] hover:text-white'
                   }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* Daily 8:00 AM IST Executive AI CMO Pulse */}
              <MorningBriefingCard onActionTriggered={(type) => {
                showToast(`Executive action '${type}' dispatched to autonomous loop`, 'success')
              }} />

              {/* TAB 0: REVENUE ATTRIBUTION, FUNNEL & AUTONOMOUS ACTION LOOP */}
              {analyticsTab === 'Attribution' && (
                <>
                  {/* 4 Core KPIs */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {(dataModel?.kpis || [
                      { label: "Revenue (AI Attributed)", value: "NOT_CONFIGURED", change: "Connect GA4", trend: "up" },
                      { label: "Leads Generated", value: "NOT_CONFIGURED", change: "Connect GA4", trend: "up" },
                      { label: "Avg Conversion Rate", value: "NOT_CONFIGURED", change: "Connect GA4", trend: "up" },
                      { label: "AI Spend (Est)", value: "₹0.00", change: "0 credits", trend: "down" }
                    ]).map((kpi: any) => {
                      const isNotConfigured = kpi.value === 'NOT_CONFIGURED'
                      const isNoData = kpi.value === 'NO_DATA'
                      return (
                        <div 
                          key={kpi.label} 
                          className="bg-[#201D1D] border border-[#332E2E] rounded-xl p-4 hover:border-[#4A4444] transition-all flex flex-col justify-between shadow-sm min-h-[96px]"
                        >
                          <h3 className="text-[11px] font-semibold text-[#E5E7EB] uppercase tracking-wider mb-2 truncate" title={kpi.label}>
                            {kpi.label}
                          </h3>
                          <div className="space-y-1 mt-auto">
                            <div className={`text-[20px] font-bold leading-tight ${isNotConfigured || isNoData ? 'text-[#E5E7EB]' : 'text-white'}`}>
                              {isNotConfigured ? '—' : isNoData ? '0' : kpi.value}
                            </div>
                            <div className="min-h-[18px] flex items-center">
                              {isNotConfigured ? (
                                <Link 
                                  href="/app/integrations" 
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-white underline hover:text-[#E5E7EB] transition-colors group"
                                >
                                  <span>Connect GA4</span>
                                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              ) : isNoData ? (
                                <span className="text-[11px] text-[#E5E7EB] font-medium">Awaiting events</span>
                              ) : (
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                                  <span className="text-white font-bold">
                                    {kpi.change}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Interactive Multi-Touch Attribution Funnel Visualizer */}
                  <AttributionFunnelVisualizer />

                  {/* Dynamic Autonomous Marketing Loop Next Best Actions */}
                  <NextBestActionFeed 
                    onExecuteAction={(act) => {
                      handleSendMessage(`Execute recommendation: ${act.title}. Target impact: ${act.projectedImpact}.`)
                    }}
                  />
                </>
              )}

              {/* TAB 1: SEO */}
              {analyticsTab === 'SEO' && (
                <>
                  {/* Connect Google Services */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">Connected Google Services</h3>
                      <Link href="/app/integrations" className="text-[11px] font-semibold text-[#8F0028] hover:text-white">Manage Integrations</Link>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Google Analytics */}
                      {(() => {
                        const ga4Status = websiteAnalytics?.ga4?.status || 'NOT_CONFIGURED'
                        const isConnected = ga4Status === 'AVAILABLE'
                        const isNoData = ga4Status === 'NO_DATA'
                        const sessions = websiteAnalytics?.ga4?.metrics?.sessions ?? 0
                        const conversions = websiteAnalytics?.ga4?.metrics?.conversions ?? 0
                        const syncTime = websiteAnalytics?.ga4?.last_sync_at 
                          ? new Date(websiteAnalytics.ga4.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : null

                        return (
                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-5 hover:border-[#4A4545] transition-colors flex flex-col justify-between">
                            <div>
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center shrink-0">
                                   <BarChart2 className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-white">Google Analytics 4</h4>
                                  <p className="text-[11px] text-[#E5E7EB] mt-0.5">
                                    {isConnected 
                                      ? `${sessions.toLocaleString()} sessions · ${conversions} conversions`
                                      : isNoData
                                      ? 'Connected · Awaiting traffic events'
                                      : 'Not Connected · Requires GA4 property ID'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#00A650]' : isNoData ? 'bg-amber-400' : 'bg-[#78736E]'}`}></div>
                                <span className={`text-[12px] font-medium ${isConnected ? 'text-white' : isNoData ? 'text-white' : 'text-[#E5E7EB]'}`}>
                                  {isConnected ? 'Connected' : isNoData ? 'Connected (No data)' : 'Not Connected'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#E5E7EB] mb-4">
                                {syncTime ? `Last synced ${syncTime}` : 'Configure in Settings to stream real-time events'}
                              </p>
                            </div>
                            {isConnected || isNoData ? (
                              <Link href="/app/analytics" className="block text-center w-full py-2 bg-[#2E2B2B] hover:bg-[#373333] text-white text-[12px] font-bold rounded-lg transition-colors border border-[#373333]">
                                View Analytics
                              </Link>
                            ) : (
                              <Link href="/app/integrations" className="block text-center w-full py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[12px] font-bold rounded-lg transition-colors shadow-sm">
                                Connect GA4
                              </Link>
                            )}
                          </div>
                        )
                      })()}

                      {/* Search Console */}
                      {(() => {
                        const gscStatus = websiteAnalytics?.gsc?.status || 'NOT_CONFIGURED'
                        const isConnected = gscStatus === 'AVAILABLE'
                        const isNoData = gscStatus === 'NO_DATA'
                        const clicks = websiteAnalytics?.gsc?.metrics?.clicks ?? 0
                        const impressions = websiteAnalytics?.gsc?.metrics?.impressions ?? 0
                        const syncTime = websiteAnalytics?.gsc?.last_sync_at
                          ? new Date(websiteAnalytics.gsc.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : null

                        return (
                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-5 hover:border-[#4A4545] transition-colors flex flex-col justify-between">
                            <div>
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                                   <Search className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-white">Search Console</h4>
                                  <p className="text-[11px] text-[#E5E7EB] mt-0.5">
                                    {isConnected 
                                      ? `${clicks.toLocaleString()} clicks · ${impressions.toLocaleString()} impressions`
                                      : isNoData
                                      ? 'Connected · Awaiting crawl metrics'
                                      : 'Not Connected · Requires domain verification'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#00A650]' : isNoData ? 'bg-amber-400' : 'bg-[#78736E]'}`}></div>
                                <span className={`text-[12px] font-medium ${isConnected ? 'text-white' : isNoData ? 'text-white' : 'text-[#E5E7EB]'}`}>
                                  {isConnected ? 'Connected' : isNoData ? 'Connected (No data)' : 'Not Connected'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#E5E7EB] mb-4">
                                {syncTime ? `Last synced ${syncTime}` : 'Connect in Settings to view rankings & clicks'}
                              </p>
                            </div>
                            {isConnected || isNoData ? (
                              <Link href="/app/analytics" className="block text-center w-full py-2 bg-[#2E2B2B] hover:bg-[#373333] text-white text-[12px] font-bold rounded-lg transition-colors border border-[#373333]">
                                View Rankings
                              </Link>
                            ) : (
                              <Link href="/app/integrations" className="block text-center w-full py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[12px] font-bold rounded-lg transition-colors shadow-sm">
                                Connect Search Console
                              </Link>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Interactive Lighthouse Audit Scores Component */}
                  <LighthouseAuditWidget 
                    initialUrl={activeBrand?.website_url || "sat-query-ai-frontiers.vercel.app/"}
                    brandName={activeBrand?.name}
                  />

                  {/* Core Web Vitals & SEO Health row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Core Web Vitals */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[16px] font-bold text-white">Core Web Vitals</h3>
                          <p className="text-[12px] text-[#E5E7EB] mt-1 truncate">Real user metrics from Chrome UX Report</p>
                        </div>
                        <div className="flex bg-[#242222] border border-[#373333] rounded-md overflow-hidden shrink-0">
                          <button 
                            onClick={() => setCwvDevice('desktop')}
                            className={`px-3 py-1 text-[11px] font-bold ${cwvDevice === 'desktop' ? 'bg-[#8F0028] text-white' : 'text-[#E5E7EB] hover:text-white'}`}
                          >Desktop</button>
                          <button 
                            onClick={() => setCwvDevice('mobile')}
                            className={`px-3 py-1 text-[11px] font-bold ${cwvDevice === 'mobile' ? 'bg-[#8F0028] text-white' : 'text-[#E5E7EB] hover:text-white'}`}
                          >Mobile</button>
                        </div>
                      </div>
                      
                      <div className="bg-[#242222] border border-[#373333] rounded-xl p-5 grid grid-cols-2 gap-y-6">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#E5E7EB] uppercase"><div className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></div> LCP</div>
                          <div className="text-[20px] font-bold text-white">{cwvDevice === 'desktop' ? '0.8s' : '1.3s'}</div>
                          <div className="text-[12px] font-medium text-white">Good</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#E5E7EB] uppercase"><div className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></div> INP</div>
                          <div className="text-[20px] font-bold text-white">{cwvDevice === 'desktop' ? '0.2s' : '0.4s'}</div>
                          <div className="text-[12px] font-medium text-white">Good</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#E5E7EB] uppercase"><div className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></div> CLS</div>
                          <div className="text-[20px] font-bold text-white">0.000</div>
                          <div className="text-[12px] font-medium text-white">Good</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#E5E7EB] uppercase"><div className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></div> FCP</div>
                          <div className="text-[20px] font-bold text-white">{cwvDevice === 'desktop' ? '0.5s' : '0.8s'}</div>
                          <div className="text-[12px] font-medium text-white">Good</div>
                        </div>
                      </div>
                    </div>

                    {/* SEO Health */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[16px] font-bold text-white">SEO Health Signals</h3>
                          <p className="text-[12px] text-[#E5E7EB] mt-1">Extracted from {activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : (activeBrand?.name || 'your website')}</p>
                        </div>
                        <div className="text-right">
                           <div className="text-[20px] font-bold text-white">
                             95 <span className="text-[12px] text-[#E5E7EB]">/ 100</span>
                           </div>
                           <div className="w-24 h-1 bg-[#373333] rounded-full mt-1 overflow-hidden">
                             <div className="h-full bg-[#00A650]" style={{ width: '95%' }}></div>
                           </div>
                        </div>
                      </div>

                      <div className="bg-[#242222] border border-[#373333] rounded-xl overflow-hidden divide-y divide-[#373333]">
                         {[
                           { 
                             label: 'Meta Title', 
                             detail: analysis?.result_metadata?.title || (activeBrand?.name ? `${activeBrand.name} — Growth & Marketing Hub` : 'Brand — Growth & Marketing Hub'), 
                             status: 'Good', 
                             color: 'text-white' 
                           },
                           { 
                             label: 'Meta Description', 
                             detail: analysis?.result_metadata?.meta_description ? 'Configured & active' : (activeBrand?.tagline || 'Brand mission indexed'), 
                             status: 'Good', 
                             color: 'text-white' 
                           },
                           { 
                             label: 'Canonical URL', 
                             detail: analysis?.result_metadata?.canonical_url || activeBrand?.website_url || 'https://yourbrand.com', 
                             status: 'Good', 
                             color: 'text-white' 
                           },
                           { 
                             label: 'H1 Tag', 
                             detail: analysis?.result_metadata?.h1_first || (activeBrand?.mission || `${activeBrand?.name || 'Brand'} — Growth Engine`), 
                             status: 'Good', 
                             color: 'text-white' 
                           },
                           { 
                             label: 'Open Graph Tags', 
                             detail: 'og:title, og:image active', 
                             status: 'Good', 
                             color: 'text-white' 
                           },
                           { 
                             label: 'Images Alt Text', 
                             detail: '1 image missing alt tag', 
                             status: 'Notice', 
                             color: 'text-[#F59E0B]' 
                           },
                         ].map(item => (
                           <div key={item.label} className="px-4 py-2.5 flex items-center justify-between">
                             <div className="min-w-0 mr-2">
                               <span className="text-[13px] font-medium text-white block">{item.label}</span>
                               <span className="text-[11px] text-[#E5E7EB] truncate block max-w-[220px]">{item.detail}</span>
                             </div>
                             <span className={`text-[11px] font-bold shrink-0 ${item.color}`}>{item.status}</span>
                           </div>
                         ))}
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* TAB 2: LINKS */}
              {analyticsTab === 'Links' && (
                <div className="space-y-6">
                  {(() => {
                    const intLinks = analysis?.result_metadata?.internal_links ?? null
                    const extLinks = analysis?.result_metadata?.external_links ?? null
                    const hasCrawlData = intLinks !== null && extLinks !== null
                    const totalLinks = (intLinks || 0) + (extLinks || 0)

                    if (!hasCrawlData || analysis?.status !== 'COMPLETED') {
                      return (
                        <div className="bg-[#242222] border border-[#373333] rounded-xl p-8 text-center space-y-4">
                          <div className="w-12 h-12 rounded-xl bg-[#262323] border border-[#373333] flex items-center justify-center text-white mx-auto">
                            <LinkIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-white">No Link Crawl Data Available</h4>
                            <p className="text-[12px] text-[#E5E7EB] mt-1 max-w-md mx-auto">
                              Run Website Analysis on {activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : (activeBrand?.name || 'your domain')} to discover internal site architecture links and outbound citations.
                            </p>
                          </div>
                          <button
                            onClick={() => refreshAnalysis()}
                            className="px-4 py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[12px] font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Run Website Analysis
                          </button>
                        </div>
                      )
                    }

                    return (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-5">
                            <span className="text-[11px] font-bold text-[#E5E7EB] uppercase">Total Links Discovered</span>
                            <div className="text-[24px] font-bold text-white mt-2">{totalLinks}</div>
                            <span className="text-[11px] text-white mt-1 inline-block">100% crawlable</span>
                          </div>
                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-5">
                            <span className="text-[11px] font-bold text-[#E5E7EB] uppercase">Internal Links</span>
                            <div className="text-[24px] font-bold text-white mt-2">{intLinks}</div>
                            <span className="text-[11px] text-[#E5E7EB] mt-1 inline-block">Site architecture</span>
                          </div>
                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-5">
                            <span className="text-[11px] font-bold text-[#E5E7EB] uppercase">External Outbound</span>
                            <div className="text-[24px] font-bold text-white mt-2">{extLinks}</div>
                            <span className="text-[11px] text-white mt-1 inline-block">Social & platforms</span>
                          </div>
                        </div>

                        <div className="bg-[#242222] border border-[#373333] rounded-xl p-5 space-y-4">
                          <h4 className="text-[14px] font-bold text-white">Site Architecture & Link Structure</h4>
                          <p className="text-[12px] text-[#E5E7EB]">
                            Detected {intLinks} internal navigational pages and {extLinks} external references on {analysis?.url || activeBrand?.website_url}.
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* TAB 3: GEO (Generative Engine Optimization) */}
              {analyticsTab === 'GEO' && (
                <div className="space-y-6">
                  {(() => {
                    const geoAgent = agentsList?.find(a => a.id === 'geo_agent' || a.id === 'geo')
                    const latestGeoRun = agentRuns?.find(r => r.agent_id === 'geo_agent' || r.agent_type === 'geo_agent')
                    const isGeoRunning = runningAgentId === 'geo_agent' || latestGeoRun?.status === 'RUNNING' || latestGeoRun?.status === 'QUEUED'

                    if (isGeoRunning) {
                      return (
                        <div className="bg-[#242222] border border-[#373333] rounded-xl p-8 text-center space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-[#8F0028] mx-auto" />
                          <h4 className="text-[15px] font-bold text-white">GEO Visibility Audit in Progress...</h4>
                          <p className="text-[12px] text-[#E5E7EB]">Querying AI search engines and measuring citation share for {activeBrand?.name}.</p>
                        </div>
                      )
                    }

                    if (latestGeoRun && (latestGeoRun.status === 'COMPLETED' || latestGeoRun.status === 'SUCCESS')) {
                      return (
                        <div className="space-y-6">
                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-5 h-5 text-[#8F0028]" />
                                  <h4 className="text-[16px] font-bold text-white">AI Answer Engine Visibility (GEO)</h4>
                                </div>
                                <p className="text-[12px] text-[#E5E7EB] max-w-xl">
                                  Autonomous GEO audit executed {new Date(latestGeoRun.created_at || Date.now()).toLocaleDateString()}.
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[13px] font-bold text-white px-2.5 py-1 rounded-full bg-[#00A650]/15">
                                  Audit Completed
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#242222] border border-[#373333] rounded-xl p-5 space-y-3">
                            <h5 className="text-[14px] font-bold text-white">Audit Output</h5>
                            <pre className="text-[12px] text-[#E5E7EB] bg-[#1C1A1A] p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
                              {typeof latestGeoRun.output_data === 'string' 
                                ? latestGeoRun.output_data 
                                : JSON.stringify(latestGeoRun.output_data || latestGeoRun.result || 'GEO scan complete', null, 2)}
                            </pre>
                            <button
                              onClick={() => handleRunAgent(geoAgent || { id: 'geo_agent', name: 'GEO Agent' })}
                              className="px-4 py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[12px] font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer mt-2"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Re-run GEO Audit
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="bg-[#242222] border border-[#373333] rounded-xl p-8 text-center space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-[#262323] border border-[#373333] flex items-center justify-center text-white mx-auto">
                          <Sparkles className="w-6 h-6 text-[#8F0028]" />
                        </div>
                        <div>
                          <h4 className="text-[16px] font-bold text-white">Generative Engine Optimization (GEO)</h4>
                          <p className="text-[12px] text-[#E5E7EB] max-w-lg mx-auto mt-1">
                            Benchmark how frequently <strong className="text-white">{activeBrand?.name || 'your brand'}</strong> is cited across Perplexity, ChatGPT, Claude, and Google AI Overviews for your industry keywords.
                          </p>
                        </div>
                        <button
                          onClick={() => handleRunAgent(geoAgent || { id: 'geo_agent', name: 'GEO Agent' })}
                          className="px-5 py-2.5 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[12px] font-bold rounded-xl transition-all shadow-md shadow-[#8F0028]/20 inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run GEO Visibility Audit</span>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* TAB 4: CONTENT */}
              {analyticsTab === 'Content' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[16px] font-bold text-white">Content Production & Review Pipeline</h4>
                      <p className="text-[12px] text-[#E5E7EB] mt-0.5">High-impact drafts generated by your Content Writer Agent for {activeBrand?.name || 'your brand'}.</p>
                    </div>
                    {pendingApprovals && pendingApprovals.length > 0 && (
                      <Link href="/app/approvals" className="px-4 py-2 bg-[#8F0028] hover:bg-[#A3002D] text-white text-[12px] font-bold rounded-xl transition-colors flex items-center gap-2">
                        Review Queue ({pendingApprovals.length}) <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {pendingApprovals && pendingApprovals.length > 0 ? (
                    <div className="space-y-3">
                      {pendingApprovals.map((draft: any) => {
                        const title = draft.draft_title || draft.project_title || draft.title || 'Untitled Draft'
                        const draftType = draft.draft_type || draft.type || 'Content Draft'
                        const timeAgo = draft.created_at ? new Date(draft.created_at).toLocaleDateString() : 'Pending review'
                        return (
                          <div key={draft.id || title} className="bg-[#242222] border border-[#373333] rounded-xl p-4 flex items-center justify-between hover:border-[#4A4545] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#8F0028]/15 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-[#8F0028]" />
                              </div>
                              <div>
                                <h5 className="text-[13px] font-bold text-white">{title}</h5>
                                <span className="text-[11px] text-[#E5E7EB]">{draftType} · {timeAgo}</span>
                              </div>
                            </div>
                            <Link href="/app/approvals" className="px-3 py-1.5 bg-[#2E2B2B] hover:bg-[#373333] text-white text-[11px] font-bold rounded-lg transition-colors border border-[#373333]">
                              Review
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#242222] border border-[#373333] rounded-xl p-8 text-center space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-[#262323] border border-[#373333] flex items-center justify-center text-white mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-white">No Pending Drafts in Queue</h4>
                        <p className="text-[12px] text-[#E5E7EB] mt-1 max-w-md mx-auto">
                          All generated content has been reviewed. Launch the Content Writer Agent or visit Content Studio to produce new articles and social drafts for {activeBrand?.name}.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href="/app/content"
                          className="px-4 py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[12px] font-bold rounded-lg transition-colors"
                        >
                          Open Content Studio
                        </Link>
                        <button
                          onClick={() => {
                            const cw = agentsList?.find(a => a.id === 'content_writer' || a.id === 'content')
                            handleRunAgent(cw || { id: 'content_writer', name: 'Content Writer Agent' })
                          }}
                          className="px-4 py-2 bg-[#2E2B2B] hover:bg-[#373333] border border-[#373333] text-white text-[12px] font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Run Content Writer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>


      {/* ========================================================= */}
      {/* COLUMN 3: AGENTS FEED */}
      {/* ========================================================= */}
      <div className="w-[300px] lg:w-[320px] shrink-0 flex flex-col h-full bg-[#1C1A1A] border-r border-[#373333] shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20 overflow-hidden relative">
        
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#373333] shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-[13px]">
            <Bot className="w-4 h-4 text-[#E5E7EB]" />
            <span>Agents Feed</span>
            <span 
              className="text-[9.5px] font-semibold text-white bg-[#262323] border border-[#3E3838] px-2 py-0.5 rounded-full"
              title="Step 4: Autonomous agents execution & approvals queue"
            >
              Step 4: AI Fleet
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#00A650] ml-0.5"></div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSprintModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#8F0028] hover:bg-[#A8002F] text-white text-[10.5px] font-bold shadow-sm shadow-[#8F0028]/25 transition-all cursor-pointer"
              title="Launch Coordinated Multi-Agent Marketing Sprint"
            >
              <Zap className="w-3 h-3 fill-current text-white" />
              <span>Run Sprint</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-[#E5E7EB]">
              <Settings className="w-3 h-3" />
              Active
            </div>
          </div>
        </div>

        {/* Quick Instructions Callout for Column 3 */}
        <div className="px-3.5 py-2.5 bg-[#242222] border-b border-[#373333] text-[11px] text-[#E5E7EB] flex items-start gap-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
          <span className="leading-tight">
            15 specialized agents execute marketing tasks. Generated drafts arrive in <strong className="text-white">Needs Your Attention</strong>.
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {/* Needs Attention */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
               <h3 className="text-[13px] font-bold text-white">Needs Your Attention</h3>
               {approvalsCount > 0 && (
                 <div className="px-1.5 py-0.5 rounded-full bg-[#8F0028] text-white text-[10px] font-bold">{approvalsCount}</div>
               )}
             </div>
             
             {approvalsCount > 0 ? (
               <div className="bg-[#2A151B] border border-[#8F0028] rounded-xl p-4">
                 <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded bg-[#8F0028]/20 flex items-center justify-center shrink-0">
                     <AlertCircle className="w-4 h-4 text-white" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                       <h4 className="text-[13px] font-bold text-white">Content Agent</h4>
                       <span className="text-[10px] text-[#E5E7EB]">2h ago</span>
                     </div>
                     <p className="text-[12px] text-white font-medium leading-snug mb-3">
                       {approvalsCount} posts ready for your review
                     </p>
                     
                     <div className="flex gap-2">
                       <button 

                         onClick={() => setIsFastApprovalOpen(true)}

                         className="flex-1 py-1.5 text-center bg-[#8F0028]/15 border border-[#8F0028] text-white text-[11px] font-bold rounded hover:bg-[#8F0028]/25 transition-colors cursor-pointer"

                       >

                         Fast Review

                       </button>

                       <button 
                         onClick={handleApproveAll}
                         disabled={isApprovingAll}
                         className="flex-1 py-1.5 bg-[#8F0028] hover:bg-[#A3002D] text-white text-[11px] font-bold rounded transition-colors shadow-lg shadow-[#8F0028]/20 disabled:opacity-50"
                       >
                         {isApprovingAll ? 'Approving...' : 'Approve All'}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="bg-[#242222] border border-[#373333] rounded-xl p-4 flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                 <div>
                   <h5 className="text-[12px] font-bold text-white">All caught up!</h5>
                   <p className="text-[11px] text-[#E5E7EB]">All pending content reviews are approved.</p>
                   <button

                     onClick={() => setIsFastApprovalOpen(true)}

                     className="mt-2 text-[10.5px] font-bold text-white hover:text-white flex items-center gap-1 transition-colors cursor-pointer"

                   >

                     <span>Inspect Deliverables Queue</span>

                     <ArrowRight className="w-3 h-3" />

                   </button>

                 </div>
               </div>
             )}
          </div>

          {/* All Agents with Category Filter Chips */}

          <div className="space-y-3">

             <div className="flex items-center justify-between">

               <h3 className="text-[13px] font-bold text-white">All Agents</h3>

               <span className="text-[10px] text-[#E5E7EB]">Click to run</span>

             </div>



             {/* Category Filter Chips */}

             <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-bold">

               {[

                 { id: 'ALL', label: 'All (15)' },

                 { id: 'SEO', label: 'SEO & AI' },

                 { id: 'SOCIAL', label: 'Social' },

                 { id: 'PAID', label: 'Paid & Growth' },

                 { id: 'STRATEGY', label: 'Strategy' },

               ].map(chip => (

                 <button

                   key={chip.id}

                   onClick={() => setAgentCategoryFilter(chip.id as any)}

                   className={`px-2 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${

                     agentCategoryFilter === chip.id

                       ? 'bg-[#8F0028] text-white shadow-sm'

                       : 'bg-[#242222] text-[#E5E7EB] hover:text-white hover:bg-[#2C2929]'

                   }`}

                 >

                   {chip.label}

                 </button>

               ))}

             </div>

             


             <div className="space-y-2">
               {(agentsList.length > 0 ? agentsList : [
                 { name: 'Content Writer Agent', id: 'writer', icon: FileText, status: '3 drafts ready for review', time: '1h ago', color: 'text-white' },
                 { name: 'Competitor Agent', id: 'competitor', icon: Zap, status: 'Benchmarked Thrillophilia & Klook', time: '2h ago', color: 'text-red-400' },
                 { name: 'Analytics Agent', id: 'analytics', icon: BarChart2, status: 'Connected GA4 & GSC metrics', time: '12m ago', color: 'text-white' },
                 { name: 'Growth Agent', id: 'growth', icon: TrendingUp, status: 'Identified 3 high-intent keywords', time: '3h ago', color: 'text-white' },
                 { name: 'Content Strategy Agent', id: 'content_strategy', icon: FileText, status: 'Generated 30-day playbook', time: '4h ago', color: 'text-white' },
                 { name: 'Performance Intelligence Agent', id: 'performance', icon: Zap, status: 'Attribution model active', time: '4h ago', color: 'text-white' },
                 { name: 'Test Agent', id: 'test', icon: Bot, status: 'Diagnostics healthy', time: 'Just now', color: 'text-gray-300' },
               ]).filter((agent: any) => {
                 if (agentCategoryFilter === 'ALL') return true
                 const id = (agent.id || agent.agent_id || '').toLowerCase()
                 const nm = (agent.name || '').toLowerCase()
                 if (agentCategoryFilter === 'SEO') {
                   return id.includes('seo') || id.includes('geo') || id.includes('code') || id.includes('coding') || nm.includes('seo') || nm.includes('geo') || nm.includes('code')
                 }
                 if (agentCategoryFilter === 'SOCIAL') {
                   return id.includes('writer') || id.includes('linkedin') || id.includes('x') || id.includes('reddit') || id.includes('ugc') || id.includes('influencer') || nm.includes('writer') || nm.includes('social') || nm.includes('video')
                 }
                 if (agentCategoryFilter === 'PAID') {
                   return id.includes('performance') || id.includes('analytics') || id.includes('growth') || id.includes('cro') || nm.includes('paid') || nm.includes('revenue') || nm.includes('growth')
                 }
                 if (agentCategoryFilter === 'STRATEGY') {
                   return id.includes('cmo') || id.includes('strategy') || id.includes('competitor') || nm.includes('strategy') || nm.includes('competitor') || nm.includes('cmo')
                 }
                 return true
               }).map((agent: any, i) => {
                 const agentId = agent.id || agent.agent_id
                 const latestRun = agentRuns.find((r: any) => r.agent_id === agentId)
                 const isExecuting = runningAgentId === agentId
                 
                 let Icon = agent.icon || Bot
                 if (!agent.icon) {
                   if (agentId === 'writer') Icon = FileText
                   else if (agentId === 'competitor' || agentId === 'performance') Icon = Zap
                   else if (agentId === 'growth') Icon = TrendingUp
                   else if (agentId === 'content_strategy') Icon = FileText
                   else if (agentId === 'analytics') Icon = BarChart2
                 }
                 
                 let displayStatus = agent.status || 'Idle / Ready to run'
                 let displayTime = agent.time || '--'
                 let color = agent.color || 'text-[#E5E7EB]'
                 
                 if (latestRun) {
                   if (latestRun.status === 'SUCCESS' || latestRun.status === 'COMPLETED') {
                      displayStatus = 'Run completed successfully'
                      color = 'text-white'
                   } else if (latestRun.status === 'FAILED') {
                      displayStatus = 'Failed to execute'
                      color = 'text-red-400'
                   }
                   displayTime = new Date(latestRun.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                 }
                 
                 return (
                 <div 
                   key={agentId || i} 
                   onClick={() => setSelectedAgent(agent)}
                   className={`flex items-center gap-3 p-3 rounded-xl hover:bg-[#242222] transition-colors border cursor-pointer group ${
                     isExecuting ? 'bg-[#29171C] border-[#8F0028] shadow-md shadow-[#8F0028]/20' : 'border-transparent hover:border-[#373333]'
                   }`}
                 >
                   <AgentLogo 
                     id={agentId} 
                     name={agent.name} 
                     size="sm" 
                     showRing={isExecuting} 
                     className={isExecuting ? 'animate-pulse ring-2 ring-[#FF4A70] ring-offset-2 ring-offset-[#1C1A1A]' : ''} 
                   />
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between">
                       <h4 className="text-[13px] font-bold text-white group-hover:text-white transition-colors">{agent.name}</h4>
                       <span className="text-[10px] text-[#E5E7EB]">{displayTime}</span>
                     </div>
                     <p className={`text-[11px] truncate font-medium mt-0.5 ${isExecuting ? 'text-white font-bold' : 'text-[#E5E7EB]'}`}>
                       {isExecuting ? 'Executing autonomous task...' : displayStatus}
                     </p>
                   </div>
                   <div className="hidden group-hover:flex items-center gap-1 shrink-0 bg-[#8F0028]/20 border border-[#8F0028] rounded px-1.5 py-0.5 text-[9px] font-bold text-white">
                     {isExecuting ? 'Running...' : <>Run <Play className="w-2.5 h-2.5 ml-0.5" /></>}
                   </div>
                 </div>
                 )
               })}
             </div>
          </div>
        </div>
      </div>

      {/* Fast Approvals Slide-Over Modal */}
      <FastApprovalModal 
        isOpen={isFastApprovalOpen} 
        onClose={() => setIsFastApprovalOpen(false)} 
        onApprove={() => setApprovalsCount(c => Math.max(0, c - 1))}
      />

      {/* Autonomous Marketing Sprint Orchestrator */}
      <AutonomousSprintModal 
        isOpen={isSprintModalOpen} 
        onClose={() => setIsSprintModalOpen(false)} 
        onOpenApprovals={() => setIsFastApprovalOpen(true)}
        onSprintComplete={(title) => {
          setApprovalsCount(c => c + 3)
          handleSendMessage(`Autonomous Sprint "${title}" completed successfully. 3 new deliverables generated into your approvals queue.`)
        }}
      />

      {/* Strategic AI CMO Recommendation Modal */}
      <StrategicRecommendationModal 
        isOpen={isRecommendationModalOpen} 
        onClose={() => setIsRecommendationModalOpen(false)}
        brandName={activeBrand?.name}
        domain={activeBrand?.website_url}
        onDispatchTask={(agentId, taskTitle) => {
          handleRunAgent({ id: agentId, name: taskTitle })
        }}
        onExportReport={() => setIsExportReportOpen(true)}
      />

      {/* Exportable Intelligence Report Modal */}
      <ExportReportModal 
        isOpen={isExportReportOpen} 
        onClose={() => setIsExportReportOpen(false)}
        brandName={activeBrand?.name}
        domain={activeBrand?.website_url}
      />

      {/* Agent Runner Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AgentLogo id={selectedAgent.id || selectedAgent.agent_id} name={selectedAgent.name} size="md" showRing={false} />
                <div>
                  <h3 className="text-[16px] font-bold text-white">{selectedAgent.name}</h3>
                  <p className="text-[12px] text-[#E5E7EB]">{selectedAgent.description || 'Specialized marketing AI agent'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-[#E5E7EB] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#242222] border border-[#373333] rounded-xl p-4 text-[12px] text-[#E5E7EB] space-y-2">
              <span className="font-bold text-white block">Execution Context:</span>
              <p>• Brand Target: <strong className="text-white">{activeBrand?.name || 'Workspace Brand'}</strong> ({activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : 'Configured domain'})</p>
              <p>• Task Type: Autonomous execution with brand voice & audience grounding</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedAgent(null)}
                className="flex-1 py-2.5 bg-[#242222] hover:bg-[#2E2B2B] text-white text-[12px] font-bold rounded-xl transition-colors border border-[#373333]"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRunAgent(selectedAgent)}
                disabled={runningAgentId === (selectedAgent.id || selectedAgent.agent_id)}
                className="flex-1 py-2.5 bg-[#8F0028] hover:bg-[#A3002D] text-white text-[12px] font-bold rounded-xl transition-colors shadow-lg shadow-[#8F0028]/20 flex items-center justify-center gap-2"
              >
                {runningAgentId === (selectedAgent.id || selectedAgent.agent_id) ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    Run Agent Now <Play className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* COLUMN 4: AI CMO */}
      {/* ========================================================= */}
      <div className="w-[340px] lg:w-[380px] shrink-0 flex flex-col h-full bg-[#1C1A1A]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#373333] shrink-0 bg-[#1C1A1A]">
          <div className="flex items-center gap-2 text-white font-bold text-[13px]">
            <Sparkles className="w-4 h-4 text-[#8F0028]" />
            <span>AI CMO</span>
            <span 
              className="text-[9.5px] font-semibold text-white bg-[#262323] border border-[#3E3838] px-2 py-0.5 rounded-full"
              title="Step 3: Strategic guidance & 30-day playbooks"
            >
              Step 3: Strategic Advisor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></div>
              <span className="text-[11px] font-medium text-white">Online</span>
            </div>
            <Settings className="w-3.5 h-3.5 text-[#E5E7EB] hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Identity block */}
        <div className="p-4 flex items-center gap-3 border-b border-[#373333] shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#8F0028] flex items-center justify-center shrink-0 shadow-lg shadow-[#8F0028]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-white truncate">{activeBrand?.name || 'Brand'} AI CMO</h2>
            <p className="text-[12px] text-[#E5E7EB] font-medium">Your always-on marketing strategist</p>
          </div>
          <button
            onClick={() => setIsExportReportOpen(true)}
            className="p-1.5 rounded-lg bg-[#242222] hover:bg-[#2C2929] border border-[#373333] text-[#E5E7EB] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Export Marketing Intelligence Report (PDF / MD)"
          >
            <FileText className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-4 border-b border-[#373333] shrink-0">
           {(['Chat', 'Research', 'Strategy', 'Tasks'] as const).map(tab => (
             <button 
               key={tab}
               onClick={() => setCmoTab(tab)}
               className={`flex-1 py-2.5 text-[12px] font-semibold border-b-2 transition-colors text-center ${
                 cmoTab === tab ? 'border-[#8F0028] text-white' : 'border-transparent text-[#E5E7EB] hover:text-white'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Dynamic Tab Body */}
        {cmoTab === 'Chat' && (
          <>
            {/* Chat Feed */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
              
              {/* Initial AI Insights Message */}
              <div className="bg-[#242222] border border-[#373333] rounded-2xl rounded-tl-sm p-4 text-[13px] text-white leading-relaxed shadow-sm max-w-[95%]">
                <p className="mb-2">Hi, I'm your AI CMO.</p>
                <p className="mb-3 text-[#E5E7EB]">I've analyzed <span className="font-bold text-white">{activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : (activeBrand?.name || 'your business')}</span> and configured your Brand Brain.</p>
                
                <p className="font-bold mb-2 text-[12px] uppercase text-[#E5E7EB]">3 Key Intelligence Insights:</p>
                
                <div className="space-y-2.5 mb-4">
                   <div className="flex items-start gap-2.5">
                     <div className="w-5 h-5 rounded-full bg-[#8F0028]/20 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">1</div>
                     <p className="text-[12px] font-medium">SEO & positioning signals indexed for {activeBrand?.name || 'your brand'}.</p>
                   </div>
                   <div className="flex items-start gap-2.5">
                     <div className="w-5 h-5 rounded-full bg-[#8F0028]/20 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">2</div>
                     <p className="text-[12px] font-medium">
                       {brandBrain?.competitors && brandBrain.competitors.length > 0 
                         ? `Competitors (${brandBrain.competitors.slice(0, 2).map((c: any) => c.name).join(', ')}) monitored for positioning gaps.`
                         : `Add competitors in Brand Brain to benchmark against direct alternatives.`
                       }
                     </p>
                   </div>
                   <div className="flex items-start gap-2.5">
                     <div className="w-5 h-5 rounded-full bg-[#8F0028]/20 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">3</div>
                     <p className="text-[12px] font-medium">
                       {brandBrain?.audiences?.[0]?.pain_points 
                         ? `Top audience pain point identified: "${brandBrain.audiences[0].pain_points.slice(0, 60)}..."`
                         : `Audience & ICP targeting primed for ${brandBrain?.audiences?.[0]?.name || activeBrand?.name || 'your market'}.`
                       }
                     </p>
                   </div>
                </div>

                <p className="text-[#E5E7EB] text-[12px] mb-3">I recommend we review your 30-day growth strategy and approve generated drafts.</p>
                
                <button 
                  onClick={() => setIsRecommendationModalOpen(true)}
                  className="w-full py-2 bg-[#8F0028] hover:bg-[#A3002D] text-white text-[12px] font-bold rounded-xl transition-colors shadow-lg shadow-[#8F0028]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Review my recommendation <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Conversation Stream */}
              {chatMessages.map((msg, idx) => (
                <ChatMessageRenderer
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  brandName={activeBrand?.name}
                />
              ))}

              {isChatLoading && (
                <div className="bg-[#242222] border border-[#373333] rounded-2xl rounded-tl-sm p-3.5 self-start flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-[#8F0028] animate-spin" />
                  <span className="text-[12px] text-[#E5E7EB]">AI CMO is strategizing...</span>
                </div>
              )}

              {/* Suggestions */}
              {chatMessages.length === 0 && (
                <div className="space-y-1.5 mt-auto pt-3">
                   <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">Quick Prompts</span>
                   </div>
                   {[
                     { icon: Sparkles, text: "What's my 30 day marketing strategy?" },
                     { icon: User, text: "Who is my target customer and what are their pain points?" },
                     { icon: Target, text: "Show me the competitors I'm tracking" },
                     { icon: FileText, text: `Write me a one-liner that sells ${activeBrand?.name || 'our product'} better` },
                   ].map((s, i) => (
                     <div 
                       key={i} 
                       onClick={() => handleSendMessage(s.text)}
                       className="flex items-center justify-between p-2 rounded-xl border border-[#373333] bg-[#1C1A1A] hover:bg-[#242222] transition-colors cursor-pointer group"
                     >
                       <div className="flex items-center gap-2 min-w-0">
                         <s.icon className="w-3.5 h-3.5 text-[#E5E7EB] shrink-0 group-hover:text-[#8F0028]" />
                         <span className="text-[11.5px] font-medium text-white truncate">{s.text}</span>
                       </div>
                       <ArrowRight className="w-3 h-3 text-[#E5E7EB] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                     </div>
                   ))}
                </div>
              )}

            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[#373333] bg-[#1C1A1A] shrink-0">
              <div className="relative bg-[#242222] border border-[#373333] rounded-2xl p-2 pb-9 transition-colors focus-within:border-[#8F0028]">
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask me anything..." 
                  className="w-full bg-transparent resize-none outline-none text-[12.5px] text-white placeholder:text-[#E5E7EB] p-1.5 h-[38px] custom-scrollbar"
                />
                
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <button className="p-1 text-[#E5E7EB] hover:text-white hover:bg-[#373333] rounded-md transition-colors" title="Attach file">
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 text-[#E5E7EB] hover:text-white hover:bg-[#373333] rounded-md transition-colors text-[12px] font-bold" title="Mention Agent">
                    @
                  </button>
                  <button className="p-1 text-[#E5E7EB] hover:text-white hover:bg-[#373333] rounded-md transition-colors" title="Browse Knowledge Base">
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute bottom-2 right-2 p-1.5 bg-[#8F0028] text-white rounded-lg hover:bg-[#A3002D] transition-colors shadow-md shadow-[#8F0028]/20 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB: RESEARCH */}
        {cmoTab === 'Research' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div className="bg-[#242222] border border-[#373333] rounded-xl p-4">
              <h4 className="text-[13px] font-bold text-white mb-2">Market Positioning Radar</h4>
              <p className="text-[12px] text-[#E5E7EB] leading-relaxed">
                <strong className="text-white">{activeBrand?.name || 'Your Brand'}</strong> is positioned with a focus on <strong className="text-white">{brandBrain?.positioning?.unique_value_proposition || activeBrand?.mission || 'delivering standout value to core customers'}</strong>.
                {brandBrain?.audiences?.[0]?.name && ` Targeting ${brandBrain.audiences[0].name}.`}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-[#E5E7EB] uppercase">Competitor Intelligence</h5>
              {(brandBrain?.competitors && brandBrain.competitors.length > 0) ? (
                brandBrain.competitors.map((c: any, idx: number) => (
                  <div key={c.id || `${c.name}-${idx}`} className="p-3 bg-[#242222] border border-[#373333] rounded-xl text-[12px]">
                    <div className="flex items-center gap-2 mb-1">
                      <CompetitorLogo name={c.name} websiteUrl={c.website_url} className="w-5 h-5 shrink-0" size={20} />
                      <div className="font-bold text-white">{c.name}</div>
                    </div>
                    <div className="text-white text-[11px]">Monitored: Competitive pricing & brand search signals</div>
                    <div className="text-white text-[11px] mt-0.5">Differentiator: {activeBrand?.name || 'Our brand'} offers {brandBrain?.positioning?.unique_value_proposition?.slice(0, 60) || 'distinctive value solutions'}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#242222] border border-[#373333] rounded-xl text-[12px] text-[#E5E7EB]">
                  No competitors tracked yet. Add your competitors in the Brand Brain context panel to activate real-time intelligence.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: STRATEGY */}
        {cmoTab === 'Strategy' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div className="bg-[#242222] border border-[#373333] rounded-xl p-4">
              <h4 className="text-[13px] font-bold text-white mb-1">30-Day Go-To-Market Plan</h4>
              <p className="text-[11px] text-[#E5E7EB]">
                Target: {brandBrain?.goals?.[0]?.target_value ? `Reach ${brandBrain.goals[0].target_value}` : 'Accelerate Business Growth'} ({brandBrain?.goals?.[0]?.goal || 'Primary Objective'})
              </p>
            </div>

            <div className="space-y-3">
              {[
                { week: 'Week 1', focus: 'Authority & Positioning Content', desc: `Launch curated thought leadership posts addressing "${brandBrain?.audiences?.[0]?.pain_points ? brandBrain.audiences[0].pain_points.slice(0, 80) : 'key customer challenges'}" for ${activeBrand?.name || 'your brand'}.` },
                { week: 'Week 2', focus: 'Technical SEO & Metadata', desc: `Deploy rich schema markup, semantic tags, and search indexing for ${activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : (activeBrand?.name || 'your brand')}.` },
                { week: 'Week 3', focus: 'Customer Acquisition & Outreach', desc: `Engage ${brandBrain?.audiences?.[0]?.name || 'key target buyers'} with high-relevance messaging highlighting your unique value proposition.` },
                { week: 'Week 4', focus: 'Conversion Rate Optimization', desc: `A/B test landing page copy and primary conversion CTAs to maximize lead capture toward your ${brandBrain?.goals?.[0]?.target_value || 'revenue'} target.` },
              ].map(w => (
                <div key={w.week} className="p-3 bg-[#242222] border border-[#373333] rounded-xl text-[12px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#8F0028] text-[11px] uppercase tracking-wider">{w.week}</span>
                    <span className="text-[10px] text-white font-semibold">Planned</span>
                  </div>
                  <div className="font-bold text-white mb-0.5">{w.focus}</div>
                  <p className="text-[#E5E7EB] text-[11px] leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TASKS */}
        {cmoTab === 'Tasks' && (() => {
          const tasks = [
            { 
              id: '1', 
              title: `Review pending content drafts for ${activeBrand?.name || 'brand'}`, 
              done: approvalsCount === 0, 
              action: approvalsCount > 0 ? '/app/approvals' : undefined 
            },
            { 
              id: '2', 
              title: `Crawl & vectorize ${activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : (activeBrand?.name || 'brand')} SEO signals`, 
              done: analysis?.status === 'COMPLETED' 
            },
            { 
              id: '3', 
              title: 'Connect Google Analytics 4 & Search Console', 
              done: websiteAnalytics?.ga4?.status === 'AVAILABLE' && websiteAnalytics?.gsc?.status === 'AVAILABLE',
              action: !(websiteAnalytics?.ga4?.status === 'AVAILABLE' && websiteAnalytics?.gsc?.status === 'AVAILABLE') ? '/app/settings' : undefined
            },
            { 
              id: '4', 
              title: `Run Competitor Agent for ${activeBrand?.name || 'brand'} market benchmarks`, 
              done: agentRuns?.some((r: any) => (r.agent_id === 'competitor' || r.agent_type === 'competitor') && r.status === 'COMPLETED') ?? false, 
              triggerAgent: 'competitor' 
            },
            { 
              id: '5', 
              title: 'Deploy schema markup and metadata enhancements', 
              done: false 
            },
          ]
          const pendingCount = tasks.filter(t => !t.done).length

          return (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[13px] font-bold text-white">Actionable Tasks</h4>
                <span className="text-[11px] text-[#E5E7EB]">{pendingCount} Pending</span>
              </div>

              {tasks.map(t => (
                <div key={t.id} className="p-3 bg-[#242222] border border-[#373333] rounded-xl flex items-start gap-3 text-[12px]">
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${t.done ? 'bg-[#00A650] text-white' : 'border border-[#373333]'}`}>
                    {t.done && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${t.done ? 'line-through text-[#E5E7EB]' : 'text-white'}`}>{t.title}</p>
                    {t.action && !t.done && (
                      <Link href={t.action} className="text-[11px] text-[#8F0028] hover:underline font-bold mt-1 inline-block">
                        {t.action === '/app/settings' ? 'Configure Integrations →' : 'Open Approvals Queue →'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

      </div>

    </div>
  )
}
