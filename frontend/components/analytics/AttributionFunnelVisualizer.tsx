"use client"

import React, { useState } from 'react'
import { 
  TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react'

export function AttributionFunnelVisualizer() {
  const [isExpanded, setIsExpanded] = useState(true)

  const STAGES = [
    {
      step: '01',
      name: 'Omni Reach',
      metric: '124,500',
      label: 'Impressions',
      conversion: '100%',
      textColor: 'text-white',
      accentDot: 'bg-[#38BDF8]',
      channels: 'SEO, LinkedIn, X, GEO'
    },
    {
      step: '02',
      name: 'Intent Traffic',
      metric: '18,240',
      label: 'Clicks & Visits',
      conversion: '14.6% CTR',
      textColor: 'text-white',
      accentDot: 'bg-[#A855F7]',
      channels: 'Search & Social referrals'
    },
    {
      step: '03',
      name: 'Qualified Leads',
      metric: '616',
      label: 'Inbound Inquiries',
      conversion: '3.38% Conv.',
      textColor: 'text-white',
      accentDot: 'bg-[#F5A623]',
      channels: 'Landing page demo signups'
    },
    {
      step: '04',
      name: 'Attributed ARR',
      metric: '₹23,71,600',
      label: 'Closed Revenue',
      conversion: '9.4% Close',
      textColor: 'text-white',
      accentDot: 'bg-[#00A650]',
      channels: 'Multi-touch closed pipeline'
    }
  ]

  return (
    <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 transition-all">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer group select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#242222] border border-[#373333] text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white group-hover:text-white transition-colors">
                Multi-Touch Revenue Attribution Funnel
              </h4>
              <span className="text-[9px] font-semibold text-white bg-[#242222] border border-[#373333] px-2 py-0.5 rounded-full">
                Telemetry Active
              </span>
            </div>
            <p className="text-[11px] text-[#E5E7EB] truncate mt-0.5">
              Real-time conversion path from initial AI impression to closed revenue
            </p>
          </div>
        </div>

        <button type="button" className="text-[#E5E7EB] group-hover:text-white p-1 shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsible Funnel Body */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-[#2E2A2A] space-y-3 animate-in fade-in duration-150">
          
          {/* 4 Funnel Stages - 2x2 grid tailored for Column 2 width, zero text squishing */}
          <div className="grid grid-cols-2 gap-2.5">
            {STAGES.map((st) => (
              <div
                key={st.step}
                className="p-3 rounded-lg border border-[#373333] bg-[#242222] flex flex-col justify-between min-w-0"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] text-[#E5E7EB] mb-1.5">
                    <span className="font-semibold flex items-center gap-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.accentDot}`} />
                      <span className="truncate">{st.name}</span>
                    </span>
                    <span className="font-mono text-[9.5px] text-[#D8D4D0] font-bold shrink-0 bg-[#1C1A1A] px-1.5 py-0.2 rounded border border-[#2E2A2A]">
                      {st.conversion}
                    </span>
                  </div>

                  <div className={`text-base sm:text-lg font-bold font-mono tracking-tight ${st.textColor} truncate`}>
                    {st.metric}
                  </div>

                  <span className="text-[10.5px] text-[#E5E7EB] font-medium block mt-0.5 truncate">
                    {st.label}
                  </span>
                </div>

                <div className="text-[9.5px] text-[#6E6A67] border-t border-[#2E2A2A] pt-1.5 mt-2 truncate">
                  {st.channels}
                </div>
              </div>
            ))}
          </div>

          {/* Attribution Channel Split Footer - Normal dark background */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] bg-[#242222] border border-[#373333] rounded-lg px-3 py-2 gap-2">
            <span className="text-[#E5E7EB] font-medium shrink-0">Channel Revenue Split:</span>
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span>SEO & GEO: <strong>42%</strong></span>
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                <span>LinkedIn: <strong>38%</strong></span>
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-[#FF4560]" />
                <span>Paid Ads: <strong>20%</strong></span>
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
