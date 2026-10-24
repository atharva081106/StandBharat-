"use client"

import React, { useState } from 'react'
import { 
  X, Sparkles, ArrowRight, Play, CheckCircle2, 
  Download, FileText, ShieldCheck, Zap, TrendingUp,
  Target, ChevronRight, Check
} from 'lucide-react'
import { AgentLogo } from '@/components/agents/AgentLogo'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

interface StrategicRecommendationModalProps {
  isOpen: boolean
  onClose: () => void
  brandName?: string
  domain?: string
  onDispatchTask?: (agentId: string, taskTitle: string) => void
  onExportReport?: () => void
}

interface StrategyPillar {
  id: string
  title: string
  rationale: string
  agentId: string
  agentName: string
  actionLabel: string
  dispatched: boolean
}

export function StrategicRecommendationModal({
  isOpen,
  onClose,
  brandName = 'StandBharat Global',
  domain = 'standbharat.ai',
  onDispatchTask,
  onExportReport
}: StrategicRecommendationModalProps) {
  const [pillars, setPillars] = useState<StrategyPillar[]>([
    {
      id: 'step-1',
      title: 'Counter Competitor Price Hike & Publish Comparison Landing Pages',
      rationale: 'Competitors recently increased enterprise package rates by +18%. High intent searchers are actively querying alternative solutions.',
      agentId: 'competitor',
      agentName: 'Competitor Radar & Spy Agent',
      actionLabel: 'Generate Counter-Positioning Battlecard',
      dispatched: false
    },
    {
      id: 'step-2',
      title: 'Capture Generative Engine Optimization (GEO) AI Citations',
      rationale: 'AI Answer Engines (Perplexity, ChatGPT Search) are driving 3.2x higher conversion rates than standard organic search. Your brand entity citations require structured JSON-LD schemas.',
      agentId: 'geo',
      agentName: 'AI Answer Engine (GEO) Agent',
      actionLabel: 'Audit & Index Entity Markup',
      dispatched: false
    },
    {
      id: 'step-3',
      title: 'Deploy High-Authority LinkedIn Thought Leadership Carousel',
      rationale: 'Top audience pain point is "fragmented marketing software and slow delivery". A 5-slide viral breakdown directly addresses buyer skepticism.',
      agentId: 'linkedin',
      agentName: 'LinkedIn Thought Leadership Agent',
      actionLabel: 'Draft Multi-Slide B2B Carousel',
      dispatched: false
    }
  ])

  if (!isOpen) return null

  const handleDispatch = (pillarId: string, agentId: string, taskTitle: string) => {
    setPillars(prev => prev.map(p => p.id === pillarId ? { ...p, dispatched: true } : p))
    onDispatchTask?.(agentId, taskTitle)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#1C1A1A] border border-[#373333] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#373333] flex items-center justify-between bg-[#201D1D] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 bg-[#8F0028] text-white rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Strategic Recommendation
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#E5E7EB] bg-[#282424] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#3A3535] truncate max-w-[140px] sm:max-w-none">
              {brandName}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2727] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Executive Thesis Box */}
          <div className="p-5 rounded-2xl bg-[#241F21] border border-[#8F0028]/40 shadow-inner space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Target className="w-4 h-4 text-white" />
              <span>30-Day Growth Thesis & Strategic Direction</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              Exploit Competitor Pricing Shifts & Claim GEO AI Citations for {brandName}
            </h3>
            <p className="text-xs text-[#E5E7EB] leading-relaxed">
              Based on telemetry indexed for <strong className="text-white">{domain}</strong>, your highest-ROI opportunity is to combine competitive comparison teardowns with generative entity markup, executed autonomously across our 15-agent fleet.
            </p>
          </div>

          {/* Actionable Strategic Pillars */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center justify-between">
              <span>🎯 Prioritized Autonomous Action Steps:</span>
              <span className="text-[10px] text-[#E5E7EB]">1-Click Agent Execution</span>
            </div>

            <div className="space-y-3">
              {pillars.map((pillar, idx) => (
                <div
                  key={pillar.id}
                  data-hover-group="true"
                  className="p-4 rounded-2xl bg-[#201D1D] border border-[#332F2F] hover:border-[#443F3F] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <AgentLogo id={pillar.agentId} name={pillar.agentName} size="md" showRing={false} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#E5E7EB] bg-[#2A2727] px-2 py-0.5 rounded shrink-0">
                          Priority 0{idx + 1}
                        </span>
                        <HoverScrollText text={pillar.agentName} className="text-xs font-bold text-white block" wrapperClassName="min-w-0 max-w-[160px]" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 leading-snug">{pillar.title}</h4>
                      <p className="text-xs text-[#E5E7EB] leading-relaxed">{pillar.rationale}</p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleDispatch(pillar.id, pillar.agentId, pillar.title)}
                      disabled={pillar.dispatched}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        pillar.dispatched
                          ? 'bg-[#2A2727] text-white border border-[#443F3F] cursor-default'
                          : 'bg-[#8F0028] hover:bg-[#A8002F] text-white shadow-md shadow-[#8F0028]/25 cursor-pointer active:scale-95'
                      }`}
                    >
                      {pillar.dispatched ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Task Dispatched!</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>{pillar.actionLabel}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#373333] bg-[#201D1D] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0 safe-area-pb">
          <button
            onClick={() => { onClose(); onExportReport?.(); }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-bold border border-[#3E3838] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Report (PDF / MD)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold transition-all shadow-md shadow-[#8F0028]/20 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
