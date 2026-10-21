"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Lightbulb, 
  Layers, 
  BarChart2, 
  Bot, 
  Brain,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GettingStartedBannerProps {
  onAskCmo?: (prompt: string) => void;
  onSelectNav?: (nav: string) => void;
}

export function GettingStartedBanner({ onAskCmo, onSelectNav }: GettingStartedBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Track step completion
  const [stepsState, setStepsState] = useState({
    step1: true,  // Brand Brain is pre-initialized on onboarding
    step2: false, // Telemetry checked
    step3: false, // CMO consulted
    step4: false  // Agent run
  })

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('standbharat_banner_dismissed')
      if (dismissed === 'true') setIsDismissed(true)

      const collapsed = localStorage.getItem('standbharat_banner_collapsed')
      if (collapsed === 'true') setIsCollapsed(true)

      const storedSteps = localStorage.getItem('standbharat_getting_started_steps')
      if (storedSteps) {
        setStepsState(prev => ({ ...prev, ...JSON.parse(storedSteps) }))
      }
    } catch (e) {}
  }, [])

  const updateStep = (key: keyof typeof stepsState, val: boolean) => {
    const updated = { ...stepsState, [key]: val }
    setStepsState(updated)
    try {
      localStorage.setItem('standbharat_getting_started_steps', JSON.stringify(updated))
    } catch (e) {}
  }

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    try {
      localStorage.setItem('standbharat_banner_collapsed', String(next))
    } catch (e) {}
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      localStorage.setItem('standbharat_banner_dismissed', 'true')
    } catch (e) {}
  }

  if (isDismissed) return null

  const completedCount = Object.values(stepsState).filter(Boolean).length
  const progressPercent = Math.round((completedCount / 4) * 100)

  // Collapsed Minimalist Pill Bar
  if (isCollapsed) {
    return (
      <div className="bg-[#201D1D] border border-[#373333] hover:border-[#8F0028]/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-white transition-all shadow-sm">
        <div 
          onClick={toggleCollapse}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-5 h-5 rounded-md bg-[#8F0028] text-white flex items-center justify-center font-bold text-[10px]">
            {completedCount}/4
          </div>
          <span className="font-bold text-white group-hover:text-white transition-colors">
            New User Getting Started ({completedCount} of 4 steps completed)
          </span>
          <span className="text-[11px] text-[#E5E7EB] hidden sm:inline">• Click to expand instructions</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#E5E7EB] group-hover:text-white" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="text-[#E5E7EB] hover:text-white p-1 rounded hover:bg-[#2C2929]"
            title="Dismiss Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // Expanded Rich Interactive Banner
  return (
    <div className="bg-[#201E1E] border border-[#373333] rounded-2xl p-4 sm:p-5 shadow-xl text-white relative space-y-4 animate-in fade-in duration-200">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 border-b border-[#373333] pb-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8F0028] text-white flex items-center justify-center shadow-lg shadow-[#8F0028]/30 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                New User Quick Start: The 4-Step Marketing Loop
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#262323] text-white border border-[#3E3838]">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-[#E5E7EB] mt-0.5">
              Follow these 4 simple steps to understand how Brand Brain, live data, AI CMO, and 15 agents work together.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          <button
            onClick={toggleCollapse}
            className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2C2929] transition-colors"
            title="Collapse Banner"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={handleDismiss}
            className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2C2929] transition-colors"
            title="Dismiss Permanently"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#2A2626] h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-[#8F0028] h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Interactive Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        
        {/* Step 1 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
          stepsState.step1 
            ? 'bg-[#221F1F] border-emerald-900/60' 
            : 'bg-[#221F1F] border-[#373333]'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Step 1 • Col 1</span>
              {stepsState.step1 ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Circle className="w-4 h-4 text-[#E5E7EB]" />
              )}
            </div>
            <h3 className="text-xs font-bold text-white">Brand Brain Grounding</h3>
            <p className="text-[11px] text-[#E5E7EB] leading-relaxed">
              Verify your USP, audience ICP, voice, and tracked competitors.
            </p>
          </div>
          <div className="pt-2.5">
            <button
              onClick={() => {
                if (onSelectNav) onSelectNav('Business Overview')
                updateStep('step1', true)
              }}
              className="w-full py-1.5 px-2 bg-[#2C2828] hover:bg-[#383333] text-white hover:text-white text-[11px] font-semibold rounded-lg border border-[#3E3838] transition-colors text-center cursor-pointer"
            >
              Inspect Context
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
          stepsState.step2 
            ? 'bg-[#221F1F] border-emerald-900/60' 
            : 'bg-[#221F1F] border-[#373333]'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Step 2 • Col 2</span>
              {stepsState.step2 ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Circle className="w-4 h-4 text-[#E5E7EB]" />
              )}
            </div>
            <h3 className="text-xs font-bold text-white">Live Telemetry & SEO</h3>
            <p className="text-[11px] text-[#E5E7EB] leading-relaxed">
              Check Lighthouse speed audit, on-page SEO tags & GEO visibility.
            </p>
          </div>
          <div className="pt-2.5">
            <button
              onClick={() => {
                if (onSelectNav) onSelectNav('Analytics')
                updateStep('step2', true)
              }}
              className="w-full py-1.5 px-2 bg-[#2C2828] hover:bg-[#383333] text-white hover:text-white text-[11px] font-semibold rounded-lg border border-[#3E3838] transition-colors text-center cursor-pointer"
            >
              View Telemetry
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
          stepsState.step3 
            ? 'bg-[#221F1F] border-emerald-900/60' 
            : 'bg-[#221F1F] border-[#373333]'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Step 3 • Col 4</span>
              {stepsState.step3 ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Circle className="w-4 h-4 text-[#E5E7EB]" />
              )}
            </div>
            <h3 className="text-xs font-bold text-white">Consult AI CMO</h3>
            <p className="text-[11px] text-[#E5E7EB] leading-relaxed">
              Ask for your 30-day marketing playbook & competitor differentiation.
            </p>
          </div>
          <div className="pt-2.5">
            <button
              onClick={() => {
                if (onAskCmo) onAskCmo("What is our 30-day growth playbook and top strategic priorities?")
                updateStep('step3', true)
              }}
              className="w-full py-1.5 px-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-[11px] font-bold rounded-lg transition-colors text-center cursor-pointer shadow-sm"
            >
              Ask 30-Day Strategy
            </button>
          </div>
        </div>

        {/* Step 4 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
          stepsState.step4 
            ? 'bg-[#221F1F] border-emerald-900/60' 
            : 'bg-[#221F1F] border-[#373333]'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Step 4 • Col 3</span>
              {stepsState.step4 ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Circle className="w-4 h-4 text-[#E5E7EB]" />
              )}
            </div>
            <h3 className="text-xs font-bold text-white">Run 15 AI Agents</h3>
            <p className="text-[11px] text-[#E5E7EB] leading-relaxed">
              Execute SEO, content & competitor agents to generate real deliverables.
            </p>
          </div>
          <div className="pt-2.5">
            <Link href="/app/agents">
              <button
                onClick={() => updateStep('step4', true)}
                className="w-full py-1.5 px-2 bg-[#2C2828] hover:bg-[#383333] text-white hover:text-white text-[11px] font-semibold rounded-lg border border-[#3E3838] transition-colors text-center cursor-pointer"
              >
                Explore Agents Fleet
              </button>
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
