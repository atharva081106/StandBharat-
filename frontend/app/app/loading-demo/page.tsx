"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Play, RefreshCw, Layout, Smartphone, Shield, Sparkles, 
  Terminal, Bot, ArrowLeft, Check, Layers, Sliders, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WebsiteLoadingMotion } from '@/components/ui/website-loading-motion'

export default function LoadingDemoPage() {
  const [fullscreenActive, setFullscreenActive] = useState(false)
  const [activePreset, setActivePreset] = useState<'os' | 'crawler' | 'agent'>('os')
  const [duration, setDuration] = useState(5000)
  const [inlineKey, setInlineKey] = useState(0)

  const PRESETS = {
    os: {
      title: "Initializing StandBharat OS",
      subtitle: "Autonomous Marketing Operating System with 15 Agent Nodes",
      steps: [
        "Connecting secure TLS 1.3 telemetry stream...",
        "Grounding Brand Brain & canonical memory vectors...",
        "Calibrating 15 autonomous marketing agents...",
        "Synthesizing live SERP & generative AI citation radar...",
        "Command Center workspace initialized."
      ]
    },
    crawler: {
      title: "Analyzing Target Website Architecture",
      subtitle: "Deep autonomous crawl of technical SEO, meta schemas, and performance",
      steps: [
        "Sending crawler requests across canonical root URL...",
        "Extracting OpenGraph tags, JSON-LD schemas, and viewport metrics...",
        "Benchmarking Core Web Vitals (LCP, FID, CLS)...",
        "Synthesizing audience personas and competitor positioning...",
        "Synthesis complete. Generating brand strategic briefing."
      ]
    },
    agent: {
      title: "Executing Autonomous Agent Sprint",
      subtitle: "Multi-agent coordination across SEO, Content Strategy, and AI CMO",
      steps: [
        "Ingesting recent search queries and keyword difficulty indices...",
        "Formulating 3 high-intent content briefs in Content Studio...",
        "Drafting competitor conquesting battlecards against rivals...",
        "Queuing deliverables for human-in-the-loop sign-off...",
        "Agent execution completed with 100% brand voice alignment."
      ]
    }
  }

  const selectedPreset = PRESETS[activePreset]

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto w-full custom-scrollbar bg-[#141212] text-white p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">
      
      {/* Fullscreen Loader Modal Overlay when triggered */}
      {fullscreenActive && (
        <WebsiteLoadingMotion 
          fullscreen={true}
          title={selectedPreset.title}
          subtitle={selectedPreset.subtitle}
          customSteps={selectedPreset.steps}
          targetDurationMs={duration}
          onFinish={() => setFullscreenActive(false)}
        />
      )}

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2828] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href="/app" 
              className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Command Center</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Website Loading Motion UI</span>
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#262323] text-white border border-[#3E3838]">
              Motion Spec v2.4
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#E5E7EB] mt-1">
            Production-grade loading motion UI component with dual-direction aperture animation, radar sweep, and live telemetry steps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setFullscreenActive(true)}
            className="bg-[#8F0028] hover:bg-[#A8002F] text-white font-semibold text-xs px-4 h-9 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Fullscreen Preview</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setInlineKey(k => k + 1)}
            className="border-[#383333] bg-[#221F1F] hover:bg-[#2C2929] text-white text-xs h-9 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restart Inline</span>
          </Button>
        </div>
      </div>

      {/* Control Panel & Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Preset Selector & Controls */}
        <div className="space-y-5">
          <div className="bg-[#1C1A1A] border border-[#302B2B] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E5E7EB] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-white" />
              <span>Motion Configuration</span>
            </h3>

            {/* Scenario Presets */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#E5E7EB] uppercase font-semibold">
                Operational Scenario
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'os', name: 'StandBharat OS Boot', desc: 'Main app initial load & workspace hydration' },
                  { id: 'crawler', name: 'Website Architecture Crawl', desc: 'Onboarding & technical SEO ingestion' },
                  { id: 'agent', name: 'Autonomous Agent Sprint', desc: 'Cross-agent task execution & briefing' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePreset(p.id as any)
                      setInlineKey(k => k + 1)
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      activePreset === p.id 
                        ? 'bg-[#242121] border-white/60 text-white shadow-sm' 
                        : 'bg-[#181616] border-[#2E2A2A] text-[#E5E7EB] hover:text-white hover:bg-[#201D1D]'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[11px] text-[#E5E7EB] mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#2A2626]">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#E5E7EB]">Target Duration</span>
                <span className="text-white font-bold">{duration}ms</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="15000" 
                step="500"
                value={duration}
                onChange={e => {
                  setDuration(parseInt(e.target.value))
                  setInlineKey(k => k + 1)
                }}
                className="w-full accent-white bg-[#2A2626] rounded h-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Feature Architecture Card */}
          <div className="bg-[#1C1A1A] border border-[#302B2B] rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Design System Adherence</span>
            </h4>
            <ul className="space-y-2 text-[#E5E7EB]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
                <span><strong className="text-white">Solid Neutral Charcoal (#141212)</strong>: Zero gradients in backgrounds, maintaining high-contrast executive visual clarity.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
                <span><strong className="text-white">Hardware-Accelerated 60fps</strong>: Pure CSS keyframe animations for aperture rotation and radar sweep without CPU lock.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
                <span><strong className="text-white">Next.js 16 Route Compatible</strong>: Ready in <code className="text-white">app/loading.tsx</code> and <code className="text-white">app/app/loading.tsx</code> for automatic Suspense.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Embedded Live Inline Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5E7EB] flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>Live Embedded Canvas (Inline Mode)</span>
            </span>
            <span className="text-[10px] text-[#E5E7EB] font-mono">
              Auto-eases to 100%
            </span>
          </div>

          {/* The Live Component in Inline Mode */}
          <WebsiteLoadingMotion 
            key={inlineKey}
            inline={true}
            fullscreen={false}
            title={selectedPreset.title}
            subtitle={selectedPreset.subtitle}
            customSteps={selectedPreset.steps}
            targetDurationMs={duration}
            simulateProgress={true}
          />
        </div>

      </div>

    </div>
  )
}
