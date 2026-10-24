"use client"

import React, { useState } from 'react'
import { 
  TrendingUp, ChevronDown, ChevronUp, Layers, Sparkles, 
  ArrowRight, BarChart3, Filter, Zap, Target, DollarSign, 
  Globe, CheckCircle2, Info, ArrowUpRight, ShieldCheck, 
  Activity, Eye, HelpCircle, Download
} from 'lucide-react'

import { HoverScrollText } from '@/components/ui/HoverScrollText'

export type AttributionModelType = 'DATA_DRIVEN' | 'W_SHAPED' | 'FIRST_TOUCH' | 'LAST_TOUCH'
export type TimeframeType = '7D' | '30D' | 'QTD'

export const MODEL_LABELS: Record<AttributionModelType, string> = {
  DATA_DRIVEN: 'Data-Driven AI',
  W_SHAPED: 'W-Shaped (40/20/40)',
  FIRST_TOUCH: 'First-Touch',
  LAST_TOUCH: 'Last-Touch'
}

interface ChannelData {
  id: string
  name: string
  share: number
  revenue: number
  cac: number
  roas: number
  avgCycleDays: number
  color: string
  accentDot: string
  badgeText: string
}

interface FunnelStage {
  step: string
  name: string
  metric: string
  numericValue: number
  label: string
  conversionToNext: string
  dropoffRate: string
  accentColor: string
  channels: string
  periodDelta: string
}

const MODEL_DATA: Record<AttributionModelType, {
  name: string
  description: string
  totalRevenue: number
  totalLeads: number
  blendedCac: number
  overallRoas: number
  channels: ChannelData[]
}> = {
  DATA_DRIVEN: {
    name: 'AI Data-Driven (Algorithmic)',
    description: 'Machine learning weights every touchpoint dynamically based on incremental conversion lift.',
    totalRevenue: 2371600,
    totalLeads: 616,
    blendedCac: 1240,
    overallRoas: 6.8,
    channels: [
      { id: 'seo_geo', name: 'Organic Search & GEO (AI Engine)', share: 42, revenue: 996072, cac: 710, roas: 8.4, avgCycleDays: 14, color: 'from-[#38BDF8] to-[#0284C7]', accentDot: 'bg-[#38BDF8]', badgeText: 'Highest Organic Margin' },
      { id: 'linkedin', name: 'LinkedIn Thought Leadership', share: 38, revenue: 901208, cac: 1840, roas: 6.2, avgCycleDays: 21, color: 'from-[#A855F7] to-[#7E22CE]', accentDot: 'bg-[#A855F7]', badgeText: 'Highest Deal Size' },
      { id: 'paid', name: 'Targeted Search & Meta Ads', share: 14, revenue: 332024, cac: 3900, roas: 3.8, avgCycleDays: 7, color: 'from-[#FF4560] to-[#E11D48]', accentDot: 'bg-[#FF4560]', badgeText: 'Fastest Pipeline Velocity' },
      { id: 'whatsapp', name: 'WhatsApp Broadcasts & Referrals', share: 6, revenue: 142296, cac: 450, roas: 14.2, avgCycleDays: 3, color: 'from-[#00A650] to-[#059669]', accentDot: 'bg-[#00A650]', badgeText: 'Highest Direct Conversion' }
    ]
  },
  W_SHAPED: {
    name: 'W-Shaped Position Based',
    description: 'Attributes 40% to First Touch discovery, 20% to Lead Creation, and 40% to Opportunity Conversion.',
    totalRevenue: 2371600,
    totalLeads: 616,
    blendedCac: 1240,
    overallRoas: 6.8,
    channels: [
      { id: 'seo_geo', name: 'Organic Search & GEO (AI Engine)', share: 46, revenue: 1090936, cac: 680, roas: 9.1, avgCycleDays: 14, color: 'from-[#38BDF8] to-[#0284C7]', accentDot: 'bg-[#38BDF8]', badgeText: 'First-Touch Dominated' },
      { id: 'linkedin', name: 'LinkedIn Thought Leadership', share: 32, revenue: 758912, cac: 2100, roas: 5.4, avgCycleDays: 21, color: 'from-[#A855F7] to-[#7E22CE]', accentDot: 'bg-[#A855F7]', badgeText: 'Mid-Funnel Validation' },
      { id: 'paid', name: 'Targeted Search & Meta Ads', share: 12, revenue: 284592, cac: 4200, roas: 3.2, avgCycleDays: 7, color: 'from-[#FF4560] to-[#E11D48]', accentDot: 'bg-[#FF4560]', badgeText: 'Lead Creation Assist' },
      { id: 'whatsapp', name: 'WhatsApp Broadcasts & Referrals', share: 10, revenue: 237160, cac: 420, roas: 16.0, avgCycleDays: 3, color: 'from-[#00A650] to-[#059669]', accentDot: 'bg-[#00A650]', badgeText: 'Bottom-Funnel Closure' }
    ]
  },
  FIRST_TOUCH: {
    name: 'First-Touch Discovery',
    description: 'Allocates 100% of pipeline credit to the initial brand discovery entry point.',
    totalRevenue: 2371600,
    totalLeads: 616,
    blendedCac: 1240,
    overallRoas: 6.8,
    channels: [
      { id: 'seo_geo', name: 'Organic Search & GEO (AI Engine)', share: 58, revenue: 1375528, cac: 520, roas: 11.2, avgCycleDays: 14, color: 'from-[#38BDF8] to-[#0284C7]', accentDot: 'bg-[#38BDF8]', badgeText: 'Primary Discovery Driver' },
      { id: 'linkedin', name: 'LinkedIn Thought Leadership', share: 26, revenue: 616616, cac: 2450, roas: 4.8, avgCycleDays: 21, color: 'from-[#A855F7] to-[#7E22CE]', accentDot: 'bg-[#A855F7]', badgeText: 'Social Discovery' },
      { id: 'paid', name: 'Targeted Search & Meta Ads', share: 13, revenue: 308308, cac: 4100, roas: 3.4, avgCycleDays: 7, color: 'from-[#FF4560] to-[#E11D48]', accentDot: 'bg-[#FF4560]', badgeText: 'Paid Inbound Entry' },
      { id: 'whatsapp', name: 'WhatsApp Broadcasts & Referrals', share: 3, revenue: 71148, cac: 920, roas: 8.1, avgCycleDays: 3, color: 'from-[#00A650] to-[#059669]', accentDot: 'bg-[#00A650]', badgeText: 'Word of Mouth / Direct' }
    ]
  },
  LAST_TOUCH: {
    name: 'Last-Touch Conversion',
    description: 'Allocates 100% of credit to the final channel interacted with immediately before checkout or contract signing.',
    totalRevenue: 2371600,
    totalLeads: 616,
    blendedCac: 1240,
    overallRoas: 6.8,
    channels: [
      { id: 'whatsapp', name: 'WhatsApp Broadcasts & Referrals', share: 44, revenue: 1043504, cac: 380, roas: 18.4, avgCycleDays: 3, color: 'from-[#00A650] to-[#059669]', accentDot: 'bg-[#00A650]', badgeText: 'Direct Payment Link' },
      { id: 'linkedin', name: 'LinkedIn Thought Leadership', share: 28, revenue: 664048, cac: 2200, roas: 5.1, avgCycleDays: 21, color: 'from-[#A855F7] to-[#7E22CE]', accentDot: 'bg-[#A855F7]', badgeText: 'Executive DM Closure' },
      { id: 'seo_geo', name: 'Organic Search & GEO (AI Engine)', share: 16, revenue: 379456, cac: 1400, roas: 4.2, avgCycleDays: 14, color: 'from-[#38BDF8] to-[#0284C7]', accentDot: 'bg-[#38BDF8]', badgeText: 'Direct Branded Search' },
      { id: 'paid', name: 'Targeted Search & Meta Ads', share: 12, revenue: 284592, cac: 4300, roas: 3.1, avgCycleDays: 7, color: 'from-[#FF4560] to-[#E11D48]', accentDot: 'bg-[#FF4560]', badgeText: 'Retargeting Click' }
    ]
  }
}

const SAMPLE_JOURNEYS = [
  {
    id: 'J-891',
    customer: 'Enterprise B2B SaaS (Bengaluru)',
    dealValue: '₹4,50,000 ARR',
    cycle: '8 Days',
    touches: [
      { channel: 'GEO Citation', title: 'Perplexity AI Search mention', time: 'Day 1' },
      { channel: 'Technical Blog', title: 'Read comparison vs legacy agency', time: 'Day 3' },
      { channel: 'AI CMO Chat', title: 'Configured automated sprint demo', time: 'Day 5' },
      { channel: 'WhatsApp / Call', title: 'Contract signed via GST billing', time: 'Day 8' }
    ]
  },
  {
    id: 'J-892',
    customer: 'Leading D2C Apparel Brand (Mumbai)',
    dealValue: '₹2,80,000 ARR',
    cycle: '2 Days',
    touches: [
      { channel: 'Organic SEO', title: 'Google #1 for "autonomous festive campaigns"', time: 'Day 1 (10 AM)' },
      { channel: 'WhatsApp Studio', title: 'Tested Diwali broadcast generator', time: 'Day 1 (4 PM)' },
      { channel: 'Razorpay Checkout', title: 'Annual Growth Plan subscription', time: 'Day 2 (11 AM)' }
    ]
  },
  {
    id: 'J-893',
    customer: 'Fintech Infrastructure Scaleup (Delhi NCR)',
    dealValue: '₹6,20,000 ARR',
    cycle: '16 Days',
    touches: [
      { channel: 'LinkedIn Carousel', title: '5 Breakthrough Growth Trends PDF', time: 'Day 1' },
      { channel: 'Competitor Radar', title: 'Evaluated Battlecard teardown', time: 'Day 7' },
      { channel: 'Fast Review Queue', title: 'Approved 3 sample agent drafts', time: 'Day 12' },
      { channel: 'Direct Invoicing', title: 'Executed enterprise SLA onboarding', time: 'Day 16' }
    ]
  }
]

export function AttributionFunnelVisualizer() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeModel, setActiveModel] = useState<AttributionModelType>('DATA_DRIVEN')
  const [timeframe, setTimeframe] = useState<TimeframeType>('30D')
  const [activeView, setActiveView] = useState<'funnel' | 'matrix' | 'journeys'>('funnel')

  const currentData = MODEL_DATA[activeModel]

  // Timeframe multiplier for demo fidelity
  const tfMultiplier = timeframe === '7D' ? 0.28 : timeframe === 'QTD' ? 2.65 : 1.0
  const adjustedRevenue = Math.round(currentData.totalRevenue * tfMultiplier)
  const adjustedLeads = Math.round(currentData.totalLeads * tfMultiplier)

  const STAGES: FunnelStage[] = [
    {
      step: '01',
      name: 'Omni Reach',
      metric: Math.round(124500 * tfMultiplier).toLocaleString(),
      numericValue: 100,
      label: 'Impressions & Signals',
      conversionToNext: '14.6% CTR',
      dropoffRate: '85.4% bounce',
      accentColor: '#38BDF8',
      channels: 'SEO, GEO, LinkedIn, X, Meta Ads',
      periodDelta: '+14.2%'
    },
    {
      step: '02',
      name: 'Intent Visits',
      metric: Math.round(18240 * tfMultiplier).toLocaleString(),
      numericValue: 46,
      label: 'Engaged Visitors',
      conversionToNext: '3.38% Conv.',
      dropoffRate: '96.6% exit',
      accentColor: '#A855F7',
      channels: 'Referral, Social, Direct organic',
      periodDelta: '+8.7%'
    },
    {
      step: '03',
      name: 'Qualified Leads',
      metric: adjustedLeads.toLocaleString(),
      numericValue: 18,
      label: 'Inbound Opportunities',
      conversionToNext: '9.4% Close',
      dropoffRate: '90.6% pipeline loss',
      accentColor: '#F5A623',
      channels: 'Audit requests, Bookings, DMs',
      periodDelta: '+22.4%'
    },
    {
      step: '04',
      name: 'Attributed ARR',
      metric: `₹${adjustedRevenue.toLocaleString()}`,
      numericValue: 8,
      label: 'Closed Revenue in ₹',
      conversionToNext: '100% Attributed',
      dropoffRate: '0% leakage',
      accentColor: '#00A650',
      channels: 'Verified closed contracts & checkout',
      periodDelta: '+18.9%'
    }
  ]

  return (
    <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-2xl p-4 sm:p-5 shadow-xl transition-all">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2E2A2A]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8F0028] to-[#B80033] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#8F0028]/25">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Multi-Touch Revenue Attribution Engine
              </h3>
              <span className="text-[9.5px] font-semibold text-[#00A650] bg-[#16291C] border border-[#1E4D2B] px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A650] animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-[11px] text-[#E5E7EB] truncate mt-0.5">
              Closed-loop attribution connecting autonomous AI copy to validated pipeline revenue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Timeframe pill selector */}
          <div className="flex items-center bg-[#242222] border border-[#373333] rounded-lg p-0.5 text-[10px] font-bold">
            {(['7D', '30D', 'QTD'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-[#8F0028] text-white shadow-sm'
                    : 'text-[#E5E7EB] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#242222] border border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#2C2929] transition-colors"
            title={isExpanded ? "Collapse Attribution Engine" : "Expand Attribution Engine"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Collapsible Body */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-in fade-in duration-200">
          
          {/* Top Control Strip: View Mode & Attribution Model Selector */}
          <div className="bg-[#201D1D] p-3 rounded-xl border border-[#302B2B] space-y-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <Layers className="w-3.5 h-3.5 text-[#8F0028]" /> Mode:
              </span>
              <div className="flex items-center gap-1 bg-[#272424] p-0.5 rounded-lg border border-[#3E3838] overflow-x-auto custom-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveView('funnel')}
                  className={`px-3 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeView === 'funnel' ? 'bg-[#8F0028] text-white shadow-sm' : 'text-[#E5E7EB] hover:text-white'
                  }`}
                >
                  Funnel Flow
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('matrix')}
                  className={`px-3 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeView === 'matrix' ? 'bg-[#8F0028] text-white shadow-sm' : 'text-[#E5E7EB] hover:text-white'
                  }`}
                >
                  Channel Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('journeys')}
                  className={`px-3 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeView === 'journeys' ? 'bg-[#8F0028] text-white shadow-sm' : 'text-[#E5E7EB] hover:text-white'
                  }`}
                >
                  Live Journeys
                </button>
              </div>
            </div>

            {/* Model Selector Bar */}
            <div className="pt-2 border-t border-[#2B2626] flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
              <span className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#8F0028]" /> Model:
              </span>
              {[
                { id: 'DATA_DRIVEN', label: 'Data-Driven (AI)' },
                { id: 'W_SHAPED', label: 'W-Shaped' },
                { id: 'FIRST_TOUCH', label: 'First-Touch' },
                { id: 'LAST_TOUCH', label: 'Last-Touch' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveModel(m.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeModel === m.id
                      ? 'bg-[#8F0028] text-white shadow-sm shadow-[#8F0028]/30'
                      : 'bg-[#272424] text-[#E5E7EB] hover:text-white hover:bg-[#322E2E] border border-[#3E3838]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attribution Model Description Banner */}
          <div className="p-3 rounded-xl bg-[#241C1E] border border-[#8F0028]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-[#8F0028] shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-[11px] text-[#E5E7EB] leading-relaxed">
                <strong className="text-white font-semibold">{currentData.name}:</strong>{' '}
                <span>{currentData.description}</span>
              </div>
            </div>
            <div className="shrink-0 self-start sm:self-auto flex items-center gap-1.5 bg-[#16291C] border border-[#1E4D2B] px-2.5 py-1 rounded-lg">
              <span className="text-[9.5px] font-semibold text-[#8E8A85] uppercase tracking-wider">Blended CAC:</span>
              <span className="text-xs font-mono font-bold text-[#00A650]">
                ₹{currentData.blendedCac.toLocaleString()}
              </span>
            </div>
          </div>

          {/* VIEW 1: FUNNEL FLOW DIAGRAM */}
          {activeView === 'funnel' && (
            <div className="space-y-3">
              {/* 4 Funnel Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STAGES.map((st) => (
                  <div
                    key={st.step}
                    data-hover-group="true"
                    className="p-3.5 rounded-xl border border-[#373333] bg-[#242222] hover:border-[#524B4B] transition-all flex flex-col justify-between relative group shadow-sm hover:shadow-md"
                  >
                    {/* Top Step Number & Stage Name */}
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] text-[#E5E7EB] mb-2">
                        <div className="font-bold flex items-center gap-1.5 min-w-0 pr-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.accentColor }} />
                          <HoverScrollText 
                            text={st.name} 
                            className="font-bold text-white text-[11px]" 
                          />
                        </div>
                        <span className="font-mono text-[9.5px] text-[#E5E7EB] font-bold bg-[#1A1818] px-1.5 py-0.5 rounded border border-[#373333] shrink-0">
                          Step {st.step}
                        </span>
                      </div>

                      {/* Metric Display with Period-over-Period Delta */}
                      <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white whitespace-nowrap">
                          {st.metric}
                        </div>
                        <span className="text-[9.5px] font-bold font-mono text-[#00A650] bg-[#16291C] px-1.5 py-0.5 rounded border border-[#1E4D2B] shrink-0" title={`${st.periodDelta} vs previous period`}>
                          {st.periodDelta}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#A39E9E] font-medium block mt-0.5">
                        {st.label}
                      </span>
                    </div>

                    {/* Funnel Width Visual Indicator */}
                    <div className="my-2.5">
                      <div className="w-full h-1.5 bg-[#1A1818] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${st.numericValue}%`,
                            backgroundColor: st.accentColor
                          }}
                        />
                      </div>
                    </div>

                    {/* Step-to-Step Transition Badge & Channels */}
                    <div className="pt-2 border-t border-[#302B2B] flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-[#00A650] font-bold font-mono shrink-0 whitespace-nowrap bg-[#16291C] px-2 py-0.5 rounded border border-[#1E4D2B] text-[9.5px]">
                        {st.conversionToNext}
                      </span>
                      <div className="min-w-0 text-right flex-1">
                        <HoverScrollText 
                          text={st.channels} 
                          className="text-[#8E8A85] hover:text-[#E5E7EB] text-[9.5px] transition-colors"
                          title={`Channels: ${st.channels}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Channel Contribution Mini-Bar */}
              <div className="p-3.5 bg-[#242222] border border-[#373333] rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-white min-w-0">
                    <BarChart3 className="w-3.5 h-3.5 text-[#8F0028] shrink-0" />
                    <span className="truncate">Revenue Contribution Distribution</span>
                    <span className="text-[9.5px] font-semibold text-[#8F0028] bg-[#8F0028]/10 border border-[#8F0028]/30 px-1.5 py-0.5 rounded shrink-0">
                      {MODEL_LABELS[activeModel] || activeModel}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#A39E9E] font-mono shrink-0">
                    Total: <strong className="text-white">₹{adjustedRevenue.toLocaleString()}</strong>
                  </span>
                </div>

                {/* Stacked Percentage Bar */}
                <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-[#1A1818] border border-[#373333] p-0.5 gap-0.5 relative group">
                  {currentData.channels.map(ch => (
                    <div
                      key={ch.id}
                      className={`h-full rounded-sm bg-gradient-to-r ${ch.color} transition-all duration-300 hover:opacity-90 hover:scale-y-110 cursor-pointer`}
                      style={{ width: `${ch.share}%` }}
                      title={`${ch.name}\n• Share: ${ch.share}%\n• Attributed Revenue: ₹${Math.round(ch.revenue * tfMultiplier).toLocaleString()}\n• Avg CAC: ₹${ch.cac}\n• ROAS: ${ch.roas}x\n• Deal Velocity: ${ch.avgCycleDays} days`}
                    />
                  ))}
                </div>

                {/* Channel Labels 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  {currentData.channels.map(ch => (
                    <div 
                      key={ch.id} 
                      data-hover-group="true"
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#1F1C1C] border border-[#302B2B] hover:border-[#423C3C] transition-colors min-w-0"
                      title={`${ch.name}\n• Attributed Revenue: ₹${Math.round(ch.revenue * tfMultiplier).toLocaleString()}\n• Avg CAC: ₹${ch.cac}\n• ROAS: ${ch.roas}x\n• Deal Velocity: ${ch.avgCycleDays} days`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ch.accentDot}`} />
                      <div className="min-w-0 flex-1">
                        <HoverScrollText
                          text={ch.name}
                          className="text-white font-semibold block text-[10.5px]"
                        />
                        <div className="flex items-center justify-between text-[10px] font-mono mt-0.5">
                          <span className="text-[#A39E9E]">{ch.share}% share</span>
                          <span className="text-[#00A650] font-semibold">₹{Math.round(ch.revenue * tfMultiplier).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CHANNEL PERFORMANCE MATRIX */}
          {activeView === 'matrix' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentData.channels.map(ch => {
                  const chRev = Math.round(ch.revenue * tfMultiplier)
                  return (
                    <div
                      key={ch.id}
                      data-hover-group="true"
                      className="p-3.5 rounded-xl border border-[#373333] bg-[#242222] hover:border-[#4D4747] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ch.accentDot}`} />
                          <div className="min-w-0 flex-1">
                            <HoverScrollText text={ch.name} className="text-xs font-bold text-white block" />
                            <span className="text-[10px] text-[#00A650] font-semibold block truncate">{ch.badgeText}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-white bg-[#1A1818] px-2 py-0.5 rounded border border-[#373333] shrink-0">
                          {ch.share}%
                        </span>
                      </div>

                      {/* Performance Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#302B2B] text-center my-1.5">
                        <div className="bg-[#1C1A1A] p-1.5 rounded-lg">
                          <span className="text-[9px] uppercase font-bold text-[#A39E9E] block">Attributed</span>
                          <span className="text-xs font-bold font-mono text-white truncate block">₹{chRev.toLocaleString()}</span>
                        </div>
                        <div className="bg-[#1C1A1A] p-1.5 rounded-lg">
                          <span className="text-[9px] uppercase font-bold text-[#A39E9E] block">Avg CAC</span>
                          <span className="text-xs font-bold font-mono text-[#00A650] truncate block">₹{ch.cac}</span>
                        </div>
                        <div className="bg-[#1C1A1A] p-1.5 rounded-lg">
                          <span className="text-[9px] uppercase font-bold text-[#A39E9E] block">ROAS</span>
                          <span className="text-xs font-bold font-mono text-white truncate block">{ch.roas}x</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#A39E9E] pt-1 gap-2">
                        <span className="truncate">Avg Velocity: <strong className="text-white">{ch.avgCycleDays}d</strong></span>
                        <span className="text-white font-medium shrink-0">Rank #{currentData.channels.indexOf(ch) + 1}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: LIVE MULTI-TOUCH JOURNEYS */}
          {activeView === 'journeys' && (
            <div className="space-y-3">
              <div className="px-2 pb-1 text-[11px] text-[#A39E9E] flex items-center justify-between">
                <span>Verified End-to-End Multi-Touch Paths (Audit Sample):</span>
                <span className="text-[10px] font-mono text-[#00A650] bg-[#16291C] px-2 py-0.5 rounded border border-[#1E4D2B]">
                  Full Privacy Preserved
                </span>
              </div>

              <div className="space-y-2.5">
                {SAMPLE_JOURNEYS.map(j => (
                  <div
                    key={j.id}
                    className="p-3.5 rounded-xl border border-[#373333] bg-[#242222] space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00A650] shrink-0" />
                        <span className="font-bold text-white truncate">{j.customer}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold font-mono text-[#00A650] bg-[#16291C] border border-[#1E4D2B] px-2 py-0.5 rounded">
                          {j.dealValue}
                        </span>
                        <span className="text-[10px] text-[#A39E9E] font-mono">
                          {j.cycle}
                        </span>
                      </div>
                    </div>

                    {/* Touchpoint Chain */}
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[10.5px]">
                      {j.touches.map((tch, idx) => (
                        <React.Fragment key={idx}>
                          <div 
                            data-hover-group="true"
                            className="flex flex-col bg-[#1C1A1A] border border-[#373333] hover:border-[#4D4747] rounded-lg p-2 shrink-0 min-w-[130px] max-w-[170px] transition-colors"
                          >
                            <span className="text-[9px] font-bold text-[#8F0028] uppercase">{tch.channel}</span>
                            <HoverScrollText text={tch.title} className="font-medium text-white text-[10px] mt-0.5 block" />
                            <span className="text-[9px] text-[#A39E9E] mt-1">{tch.time}</span>
                          </div>
                          {idx < j.touches.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#8F0028] shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Executive Attribution Summary Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] bg-[#201D1D] border border-[#302B2B] rounded-xl px-3.5 py-2.5 gap-2">
            <div className="flex items-center gap-2 text-[#E5E7EB]">
              <ShieldCheck className="w-4 h-4 text-[#00A650] shrink-0" />
              <span>
                Attribution Telemetry synced with <strong className="text-white">GA4 Measurement Protocol & Server Signals</strong>.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <span className="text-[10px] text-[#A39E9E]">99.4% Match Rate</span>
              <span className="h-3 w-px bg-[#373333]" />
              <span className="text-[#00A650] font-mono font-bold bg-[#16291C] px-2 py-0.5 rounded border border-[#1E4D2B]">
                ROAS: {currentData.overallRoas}x
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
