"use client"

import React, { useState } from 'react'
import { 
  X, Check, Edit3, ArrowRight, Share2, AlertCircle, 
  Sparkles, CheckCircle2, RotateCcw, Copy, ExternalLink,
  Flame, ShieldCheck, Clock, Eye, FileText
} from 'lucide-react'
import { AgentLogo } from '@/components/agents/AgentLogo'
import { MultiChannelPreview } from '@/components/content/MultiChannelPreview'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

export interface PendingDeliverable {
  id: string
  title: string
  agentId: string
  agentName: string
  channel: string
  createdAt: string
  summary: string
  content: string
  riskLevel: 'LOW' | 'MEDIUM' | 'SAFE'
}

interface FastApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  deliverables?: PendingDeliverable[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

const DEFAULT_DELIVERABLES: PendingDeliverable[] = [
  {
    id: 'deliv-1',
    title: 'LinkedIn Carousel Post: 5 Breakthrough Growth Trends in AI Marketing',
    agentId: 'content_writer',
    agentName: 'High-Velocity Content Writer Agent',
    channel: 'LinkedIn Thought Leadership',
    createdAt: '15m ago',
    riskLevel: 'SAFE',
    summary: 'High-converting viral hook crafted with brand voice grounding and technical credibility.',
    content: `🚀 **5 Breakthrough Growth Trends Reshaping AI Marketing in 2026**

Most marketing teams are still treating AI like a glorified copywriter.
The top 1% are using it as an **autonomous execution fleet**.

Here is what the real shift looks like:

1️⃣ **Multi-Touch Revenue Attribution > Vanity ROAS**
Pixel-less server-side telemetry is replacing last-click illusions.
If your AI doesn't connect CRM revenue to inbound content, you're flying blind.

2️⃣ **Generative Engine Optimization (GEO)**
Perplexity and ChatGPT Search are the new front page of Google.
Optimizing for semantic entity citations is now 3x more critical than old-school backlink spam.

3️⃣ **Hyper-Specific Competitor Spy Radios**
Monitoring pricing and ad copy pivots in real time—not monthly quarterly reviews.

4️⃣ **Automated Video Hook Ideation**
Testing 10 hook variations in the first 3 seconds before spending ₹100 on ad spend.

5️⃣ **Human-in-the-Loop Governance**
Autonomous drafting + 1-click human executive approval = 10x output with zero brand hallucination risk.

👉 *Which shift are you prioritizing this quarter?*
#MarketingStrategy #B2BMarketing #GrowthHacking #StandBharat`
  },
  {
    id: 'deliv-2',
    title: 'Competitor Counter-Battlecard: StandBharat vs Thrillophilia & Klook',
    agentId: 'competitor',
    agentName: 'Competitor Radar & Spy Agent',
    channel: 'Sales & SEO Comparison Landing Pages',
    createdAt: '45m ago',
    riskLevel: 'LOW',
    summary: 'Competitive teardown analyzing pricing transparency, autonomous agent capabilities, and local SEO gaps.',
    content: `### 🎯 Competitive Intelligence Battlecard: StandBharat vs Traditional Alternatives

**Primary Competitor Moves Detected:**
- Competitor recently updated package pricing by +18% on enterprise tiers.
- Weakness: Lack of autonomous 24/7 competitor radar and no generative engine (GEO) citation tracking.

**Recommended Counter-Positioning Angles:**
- **Value Proposition**: 15 autonomous agents operating concurrently for the price of 1 junior freelancer.
- **Speed to Value**: 5-minute Brand Brain indexing vs 3-week traditional agency onboarding.
- **Conversion Hook**: "Stop paying legacy agency retainers. Put 15 specialized marketing agents to work."`
  },
  {
    id: 'deliv-3',
    title: '30-Day Pillar-Cluster Editorial Plan & High-Intent Target SERPs',
    agentId: 'content_strategy',
    agentName: 'Content Strategy & Roadmap Agent',
    channel: 'Brand Brain & Organic Search Roadmap',
    createdAt: '2h ago',
    riskLevel: 'SAFE',
    summary: 'Topic clustering blueprint covering 12 high-intent organic keywords with estimated 18.5k monthly search volume.',
    content: `### 🗺️ 30-Day Editorial Pillar Plan

**Cluster 1: AI Marketing Fleet Automation**
- Core Pillar: *The Complete Guide to Autonomous Marketing Agents (3,200 words)*
- Sub-Cluster 1: *How to Replace Fragmented Marketing Tools with Unified AI*
- Sub-Cluster 2: *GA4 & Search Console Revenue Attribution Setup*

**Cluster 2: Generative Engine Optimization (GEO)**
- Core Pillar: *How to Get Your SaaS Cited on Perplexity and ChatGPT Search*
- Sub-Cluster 1: *Entity Schema Markup: Technical Implementation Guide*
- Sub-Cluster 2: *Comparing Traditional SEO vs AI Answer Engines*`
  }
]

export function FastApprovalModal({
  isOpen,
  onClose,
  deliverables = DEFAULT_DELIVERABLES,
  onApprove,
  onReject
}: FastApprovalModalProps) {
  const [items, setItems] = useState<PendingDeliverable[]>(deliverables)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [justApproved, setJustApproved] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const currentItem = items[currentIndex] || items[0]

  const handleApprove = () => {
    if (!currentItem) return
    setJustApproved(true)
    setTimeout(() => {
      onApprove?.(currentItem.id)
      const nextItems = items.filter(i => i.id !== currentItem.id)
      setItems(nextItems)
      setJustApproved(false)
      setIsEditing(false)
      if (nextItems.length === 0) {
        onClose()
      } else {
        setCurrentIndex(Math.min(currentIndex, nextItems.length - 1))
      }
    }, 600)
  }

  const handleReject = () => {
    if (!currentItem) return
    onReject?.(currentItem.id)
    const nextItems = items.filter(i => i.id !== currentItem.id)
    setItems(nextItems)
    setIsEditing(false)
    if (nextItems.length === 0) {
      onClose()
    } else {
      setCurrentIndex(Math.min(currentIndex, nextItems.length - 1))
    }
  }

  const handleStartEdit = () => {
    setEditedContent(currentItem.content)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (!currentItem) return
    currentItem.content = editedContent
    setIsEditing(false)
  }

  const handleCopy = () => {
    if (!currentItem) return
    navigator.clipboard.writeText(currentItem.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#1C1A1A] border border-[#373333] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#373333] flex items-center justify-between bg-[#201D1D] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 bg-[#8F0028] text-white rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Fast Approval Queue
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#E5E7EB] bg-[#2A2727] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#3E3838]">
              {items.length} {items.length === 1 ? 'draft' : 'drafts'} pending
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2727] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-white" />
            <h3 className="text-xl font-bold text-white">All Deliverables Approved!</h3>
            <p className="text-sm text-[#E5E7EB] max-w-md">
              Everything in your queue has been approved and dispatched to publishing channels.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#8F0028] text-white font-bold text-xs rounded-xl"
            >
              Back to Command Center
            </button>
          </div>
        ) : (
          <>
            {/* Multi-Draft Selector Tabs */}
            {items.length > 1 && (
              <div className="flex items-center gap-2 px-6 py-2.5 border-b border-[#2E2A2A] bg-[#191717] overflow-x-auto custom-scrollbar shrink-0">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentIndex(idx); setIsEditing(false); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      currentIndex === idx 
                        ? 'bg-[#2A2727] text-white border border-[#443F3F] shadow-sm'
                        : 'text-[#E5E7EB] hover:text-white hover:bg-[#221F1F]'
                    }`}
                  >
                    <AgentLogo id={item.agentId} size="sm" showRing={false} className="w-5 h-5 !rounded-md shrink-0" />
                    <HoverScrollText text={item.title} className="text-xs font-bold block" wrapperClassName="min-w-0 max-w-[150px]" />
                  </button>
                ))}
              </div>
            )}

            {/* Current Draft Header Info */}
            <div className="px-6 py-4 bg-[#201D1D] border-b border-[#2E2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <AgentLogo id={currentItem.agentId} name={currentItem.agentName} size="md" showRing={false} />
                <div className="min-w-0">
                  <HoverScrollText text={currentItem.title} className="text-base font-bold text-white block" />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#E5E7EB] mt-0.5">
                    <span className="text-white font-semibold">{currentItem.agentName}</span>
                    <span>•</span>
                    <span className="bg-[#2A2727] px-2 py-0.5 rounded text-[10px] text-white font-mono">{currentItem.channel}</span>
                    <span>•</span>
                    <span className="text-[10px] text-white flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-white" /> {currentItem.riskLevel} Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-2 shrink-0">
                {/* View Mode Toggle: Live Preview vs Raw */}
                <div className="flex items-center bg-[#171515] p-0.5 rounded-lg border border-[#3E3838]">
                  <button
                    type="button"
                    onClick={() => { setViewMode('preview'); setIsEditing(false); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === 'preview' && !isEditing
                        ? 'bg-[#2E2A2A] text-white shadow-sm'
                        : 'text-[#E5E7EB] hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-white" />
                    Live Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('raw')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === 'raw' && !isEditing
                        ? 'bg-[#2E2A2A] text-white shadow-sm'
                        : 'text-[#E5E7EB] hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Raw Copy
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-[#262323] hover:bg-[#302B2B] text-xs font-semibold text-[#E5E7EB] hover:text-white flex items-center gap-1.5 border border-[#3E3838] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {!isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className="px-3 py-1.5 rounded-lg bg-[#262323] hover:bg-[#302B2B] text-xs font-semibold text-[#E5E7EB] hover:text-white flex items-center gap-1.5 border border-[#3E3838] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                    <span>Quick Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 rounded-lg bg-[#2A2727] hover:bg-[#332E2E] text-xs font-bold text-white flex items-center gap-1.5 border border-[#443F3F] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Deliverable Body Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 bg-[#171515]">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#E5E7EB]">Editing Deliverable Copy:</div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="w-full bg-[#1C1A1A] border border-[#3E3838] rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:border-[#8F0028] leading-relaxed custom-scrollbar"
                  />
                </div>
              ) : viewMode === 'preview' ? (
                <MultiChannelPreview 
                  title={currentItem.title}
                  content={currentItem.content}
                  authorName={currentItem.agentName}
                  brandName="StandBharat"
                />
              ) : (
                <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-2xl p-5 shadow-inner">
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-white leading-relaxed select-text space-y-2">
                    {currentItem.content}
                  </div>
                </div>
              )}

              {/* Rationale & Safety Callout */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#201D1D] border border-[#302B2B] text-xs text-[#E5E7EB] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Execution & Governance Note</span>
                  <p>
                    {currentItem.summary} Upon approval, this draft will be scheduled into the distribution queue.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Approval Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#373333] bg-[#201D1D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0 safe-area-pb">
              <button
                onClick={handleReject}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-transparent hover:bg-[#2A2727] text-white text-xs font-bold border border-[#443F3F] transition-colors order-2 sm:order-1"
              >
                Reject / Request Rewrite
              </button>

              <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-semibold border border-[#3E3838] transition-colors"
                >
                  Review Later
                </button>
                <button
                  onClick={handleApprove}
                  disabled={justApproved}
                  className="flex-2 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#8F0028]/25 transition-all transform active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {justApproved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                      <span>Approved & Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <span>Approve & Dispatch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
