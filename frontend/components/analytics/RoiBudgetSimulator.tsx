"use client"
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  PieChart,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

interface RoiBudgetSimulatorProps {
  initialMonthlyBudget?: number
  onApplyBudget?: (allocation: any) => void
  className?: string
}

export function RoiBudgetSimulator({
  initialMonthlyBudget = 100000,
  onApplyBudget,
  className = ''
}: RoiBudgetSimulatorProps) {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(initialMonthlyBudget)
  
  // Channel allocations (percentages totaling 100%)
  const [allocations, setAllocations] = useState({
    seo: 35,
    googleAds: 30,
    paidSocial: 25,
    community: 10
  })

  const [applied, setApplied] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  // Recalculate projections dynamically
  const metrics = useMemo(() => {
    const seoBudget = (monthlyBudget * allocations.seo) / 100
    const googleBudget = (monthlyBudget * allocations.googleAds) / 100
    const socialBudget = (monthlyBudget * allocations.paidSocial) / 100
    const communityBudget = (monthlyBudget * allocations.community) / 100

    // Organic content yields higher compounding ROI, paid yields immediate velocity
    const seoVisitors = Math.round(seoBudget / 12) // ~₹12 blended CPC long term
    const googleVisitors = Math.round(googleBudget / 42) // ~₹42 CPC
    const socialVisitors = Math.round(socialBudget / 28) // ~₹28 CPC
    const communityVisitors = Math.round(communityBudget / 18) // ~₹18 CPC

    const totalVisitors = seoVisitors + googleVisitors + socialVisitors + communityVisitors
    const mqls = Math.round(totalVisitors * 0.042) // 4.2% visitor to lead
    const deals = Math.max(1, Math.round(mqls * 0.15)) // 15% lead to customer
    const averageOrderValue = 36000 // ₹36,000 average ACV / customer
    const projectedPipeline = deals * averageOrderValue
    const blendedCac = Math.round(monthlyBudget / deals)
    const roas = (projectedPipeline / monthlyBudget).toFixed(1)
    const paybackMonths = (blendedCac / (averageOrderValue / 12)).toFixed(1)

    return {
      seoBudget,
      googleBudget,
      socialBudget,
      communityBudget,
      totalVisitors,
      mqls,
      deals,
      projectedPipeline,
      blendedCac,
      roas,
      paybackMonths
    }
  }, [monthlyBudget, allocations])

  const handleSliderChange = (channel: 'seo' | 'googleAds' | 'paidSocial' | 'community', newVal: number) => {
    // Normalise other sliders so total is always 100%
    const currentVal = allocations[channel]
    const diff = newVal - currentVal
    const otherKeys = (['seo', 'googleAds', 'paidSocial', 'community'] as const).filter(k => k !== channel)
    const otherSum = otherKeys.reduce((acc, k) => acc + allocations[k], 0)

    if (otherSum <= 0) return

    const newAlloc = { ...allocations, [channel]: newVal }
    let remaining = 100 - newVal
    otherKeys.forEach((k, idx) => {
      if (idx === otherKeys.length - 1) {
        newAlloc[k] = Math.max(0, remaining)
      } else {
        const share = Math.round((allocations[k] / otherSum) * (100 - newVal))
        newAlloc[k] = Math.max(0, share)
        remaining -= share
      }
    })

    setAllocations(newAlloc)
    setApplied(false)
  }

  const handleApply = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      setApplied(true)
      onApplyBudget?.({
        monthlyBudget,
        allocations,
        metrics
      })
    }, 700)
  }

  return (
    <div className={`bg-[#171515] border border-[#2E2A2A] rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Header bar - 100% solid, NO gradient */}
      <div className="px-6 py-4 bg-[#1F1C1C] border-b border-[#2E2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8F0028] text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Predictive ROI & Budget Allocation Simulator
              <Badge className="bg-[#262323] text-white border border-[#3E3838] text-[10px] py-0">
                Live Model
              </Badge>
            </h3>
            <p className="text-xs text-[#E5E7EB]">
              Simulate CAC, pipeline return, and payback velocity before auto-allocating agent capital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="bg-[#242222] border-[#373333] text-xs text-white py-1 px-3">
            Target Pipeline: <strong className="text-white ml-1 font-bold">₹{(metrics.projectedPipeline / 100000).toFixed(2)}L</strong>
          </Badge>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#171515]">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Budget Master Slider */}
          <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-white" />
                Total Monthly Marketing Budget
              </label>
              <span className="text-base font-mono font-black text-white bg-[#262323] px-3 py-1 rounded-lg border border-[#3E3838]">
                ₹{monthlyBudget.toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min={25000}
              max={1000000}
              step={25000}
              value={monthlyBudget}
              onChange={(e) => { setMonthlyBudget(Number(e.target.value)); setApplied(false); }}
              className="w-full h-2 bg-[#2E2A2A] rounded-lg appearance-none cursor-pointer accent-[#8F0028]"
            />

            <div className="flex justify-between text-[10px] text-[#E5E7EB] font-mono">
              <span>₹25K (Seed)</span>
              <span>₹2.5L (Growth)</span>
              <span>₹5L (Scale)</span>
              <span>₹10L (Enterprise)</span>
            </div>
          </div>

          {/* Channel Mix Sliders */}
          <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Autonomous Channel Distribution</span>
              <span className="text-[11px] text-[#E5E7EB] font-mono">Total: 100%</span>
            </h4>

            {/* SEO & GEO Content */}
            <div className="space-y-1.5" data-hover-group="true">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-white font-medium flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <HoverScrollText text="SEO & AI Generative Engine Optimization (GEO)" className="text-white font-medium block" />
                </span>
                <span className="font-mono text-white font-bold shrink-0">{allocations.seo}% (₹{(metrics.seoBudget).toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={allocations.seo}
                onChange={(e) => handleSliderChange('seo', Number(e.target.value))}
                className="w-full h-1.5 bg-[#2A2727] rounded-lg appearance-none cursor-pointer accent-[#8F0028]"
              />
            </div>

            {/* Google Search Ads */}
            <div className="space-y-1.5" data-hover-group="true">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-white font-medium flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <HoverScrollText text="High-Intent Google Search Ads" className="text-white font-medium block" />
                </span>
                <span className="font-mono text-white font-bold shrink-0">{allocations.googleAds}% (₹{(metrics.googleBudget).toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={allocations.googleAds}
                onChange={(e) => handleSliderChange('googleAds', Number(e.target.value))}
                className="w-full h-1.5 bg-[#2A2727] rounded-lg appearance-none cursor-pointer accent-[#8F0028]"
              />
            </div>

            {/* Meta & LinkedIn Paid */}
            <div className="space-y-1.5" data-hover-group="true">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-white font-medium flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full bg-[#8F0028] shrink-0" />
                  <HoverScrollText text="Paid Social (LinkedIn & Meta B2B)" className="text-white font-medium block" />
                </span>
                <span className="font-mono text-white font-bold shrink-0">{allocations.paidSocial}% (₹{(metrics.socialBudget).toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={allocations.paidSocial}
                onChange={(e) => handleSliderChange('paidSocial', Number(e.target.value))}
                className="w-full h-1.5 bg-[#2A2727] rounded-lg appearance-none cursor-pointer accent-[#8F0028]"
              />
            </div>

            {/* Community & Thought Leadership */}
            <div className="space-y-1.5" data-hover-group="true">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-white font-medium flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full bg-[#8F0028] shrink-0" />
                  <HoverScrollText text="Community & Founder Thought Leadership" className="text-white font-medium block" />
                </span>
                <span className="font-mono text-white font-bold shrink-0">{allocations.community}% (₹{(metrics.communityBudget).toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={allocations.community}
                onChange={(e) => handleSliderChange('community', Number(e.target.value))}
                className="w-full h-1.5 bg-[#2A2727] rounded-lg appearance-none cursor-pointer accent-[#8F0028]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Predictive Outputs */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Blended CAC */}
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-[#E5E7EB] font-medium">Estimated CAC</span>
              <div className="text-xl font-bold font-mono text-white">
                ₹{metrics.blendedCac.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-white font-semibold block">
                vs Industry ₹14,200 avg
              </span>
            </div>

            {/* Projected ROAS */}
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-[#E5E7EB] font-medium">Projected Return</span>
              <div className="text-xl font-bold font-mono text-white">
                {metrics.roas}x ROAS
              </div>
              <span className="text-[10px] text-[#E5E7EB] block">
                Payback: {metrics.paybackMonths} mo
              </span>
            </div>

            {/* Target MQLs */}
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-[#E5E7EB] font-medium">Monthly Qualified Leads</span>
              <div className="text-xl font-bold font-mono text-white">
                {metrics.mqls} MQLs
              </div>
              <span className="text-[10px] text-[#E5E7EB] block">
                ~{metrics.totalVisitors.toLocaleString('en-IN')} visits
              </span>
            </div>

            {/* Projected Deals Closed */}
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-[#E5E7EB] font-medium">Closed Accounts</span>
              <div className="text-xl font-bold font-mono text-white">
                {metrics.deals} Customers
              </div>
              <span className="text-[10px] text-[#E5E7EB] block">
                @ ₹36K ACV
              </span>
            </div>
          </div>

          {/* Model Rationale Box */}
          <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-3.5 text-xs text-[#E5E7EB] space-y-1.5">
            <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              StandBharat Autonomous Attribution Model
            </div>
            <p className="text-[11px] leading-relaxed">
              Allocating <strong className="text-white">{allocations.seo}% to SEO/GEO</strong> compounds organic domain authority over 90 days, while <strong className="text-white">{allocations.googleAds}% Paid Search</strong> captures immediate high-intent buyers.
            </p>
          </div>

          {/* Apply Execution CTA */}
          <button
            type="button"
            onClick={handleApply}
            disabled={isSimulating}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              applied
                ? 'bg-[#8F0028] text-white'
                : 'bg-[#8F0028] hover:bg-[#A3002D] text-white shadow-lg'
            }`}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Applying Allocation to Agent Fleet...
              </>
            ) : applied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Budget Applied & Dispatched to Active Agents!
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Apply Allocation & Auto-Dispatch Campaigns
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
