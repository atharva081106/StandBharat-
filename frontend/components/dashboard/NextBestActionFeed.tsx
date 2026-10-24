"use client"
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  RefreshCw,
  Compass,
  Check
} from 'lucide-react'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

export interface NextActionItem {
  id: string
  title: string
  rationale: string
  projectedImpact: string
  convictionScore: number
  category: 'SEO' | 'SOCIAL' | 'PAID' | 'COMPETITIVE'
  actionLabel: string
  agentName: string
}

interface NextBestActionFeedProps {
  onExecuteAction?: (action: NextActionItem) => void
  className?: string
}

export function NextBestActionFeed({
  onExecuteAction,
  className = ''
}: NextBestActionFeedProps) {
  const [actions, setActions] = useState<NextActionItem[]>([
    {
      id: 'act-1',
      title: 'Rewrite Meta Descriptions for 3 High-Volume Keywords',
      rationale: 'Google Search Console detects 3 keywords with high impressions (>14K) but below-average CTR (1.2%).',
      projectedImpact: '+1,400 monthly organic visits',
      convictionScore: 94,
      category: 'SEO',
      actionLabel: 'Rewrite Meta',
      agentName: 'SEO & Technical Keyword Agent'
    },
    {
      id: 'act-2',
      title: 'Schedule 2 Founder Thought Leadership Carousels',
      rationale: 'Audience telemetry indicates LinkedIn engagement peaks on Tuesdays 10:30 AM IST for B2B founders.',
      projectedImpact: '+320 high-intent profile visits',
      convictionScore: 91,
      category: 'SOCIAL',
      actionLabel: 'Queue 2 Carousels',
      agentName: 'LinkedIn Thought Leadership Agent'
    },
    {
      id: 'act-3',
      title: 'Reallocate ₹15,000 from High-CPA Ads to SEO Cluster',
      rationale: 'Paid search CAC spiked to ₹1,850 on generic broad match keywords. Reallocating to SEO pillar compounding.',
      projectedImpact: '-18% blended CAC reduction',
      convictionScore: 86,
      category: 'PAID',
      actionLabel: 'Reallocate ₹15K',
      agentName: 'Paid Ads & ROAS Optimization Agent'
    },
    {
      id: 'act-4',
      title: 'Deploy Counter-Positioning Sprint vs Competitor Price Hike',
      rationale: 'Competitor Activity Radar detected a 20% price hike on enterprise tiers across rival products.',
      projectedImpact: '+₹3.2L pipeline capture',
      convictionScore: 89,
      category: 'COMPETITIVE',
      actionLabel: 'Launch Counter-Sprint',
      agentName: 'Competitive Intelligence Agent'
    }
  ])

  const [executingId, setExecutingId] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({})

  const handleExecute = (item: NextActionItem) => {
    setExecutingId(item.id)
    setTimeout(() => {
      setExecutingId(null)
      setCompletedIds(prev => ({ ...prev, [item.id]: true }))
      onExecuteAction?.(item)
    }, 700)
  }

  const categoryTextColor = (cat: string) => {
    return 'text-white'
  }

  return (
    <div className={`bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl overflow-hidden shadow-lg ${className}`}>
      {/* Header Bar - Normal uniform dark background (#201D1D) */}
      <div className="px-5 py-3.5 bg-[#201D1D] border-b border-[#2E2A2A] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#242222] border border-[#373333] text-white flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Autonomous Marketing Loop: Next Best Actions
              </h3>
              <span className="text-[9px] font-semibold text-white bg-[#242222] border border-[#373333] px-2 py-0.5 rounded-full">
                AI CMO Prioritized
              </span>
            </div>
            <p className="text-[11px] text-[#E5E7EB] truncate mt-0.5">
              Continuous telemetry evaluation recommending highest ROI interventions.
            </p>
          </div>
        </div>

        <span className="text-[10px] text-[#E5E7EB] font-mono hidden sm:inline shrink-0">
          {actions.length - Object.keys(completedIds).length} actions pending
        </span>
      </div>

      {/* Action Items List - Normal uniform dark background (#1C1A1A) */}
      <div className="p-3.5 space-y-2.5 bg-[#1C1A1A]">
        {actions.map((item) => {
          const isDone = completedIds[item.id]
          const isCurrent = executingId === item.id

          return (
            <div 
              key={item.id}
              data-hover-group="true"
              className={`p-3.5 rounded-lg border border-[#373333] bg-[#242222] transition-all ${
                isDone ? 'opacity-60' : 'hover:border-[#4A4545]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded bg-[#1C1A1A] border border-[#332E2E] text-white shrink-0">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug break-words">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-[#E5E7EB] font-mono shrink-0">
                      ({item.convictionScore}% Conviction)
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[#E5E7EB] leading-relaxed">
                    {item.rationale}
                  </p>

                  <div className="flex items-center gap-3 text-[10.5px] pt-0.5 flex-wrap">
                    <span className="text-white font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      Impact: {item.projectedImpact}
                    </span>
                    <span className="text-[#6E6A67]">•</span>
                    <span className="text-white font-medium">
                      Agent: {item.agentName}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleExecute(item)}
                    disabled={isDone || isCurrent}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isDone
                        ? 'bg-[#1C1A1A] text-white border border-[#443F3F]'
                        : 'bg-[#8F0028] hover:bg-[#A3002D] text-white shadow-md'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Dispatching...
                      </>
                    ) : isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Dispatched
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <HoverScrollText text={item.actionLabel} />
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
