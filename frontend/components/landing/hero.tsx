'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useRef } from 'react'
import { useAuth } from '@/lib/providers/MockProvider'

export function InteractiveDashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { login } = useAuth()
  const [rotation, setRotation] = useState({ x: 12, y: -16, z: 4 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Base isometric rotation + slight mouse tracking
    const rotateX = 12 + ((y - centerY) / centerY) * -4
    const rotateY = -16 + ((x - centerX) / centerX) * 4
    
    setRotation({ x: rotateX, y: rotateY, z: 4 })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 12, y: -16, z: 4 })
  }

  return (
    <>
      {/* Mobile-Native Smartphone Preview (< lg) */}
      <div 
        onClick={async () => {
          try {
            await login('demo@standbharat.ai', 'demo')
            router.push('/app')
          } catch (e) {
            console.error('Mockup demo login error:', e)
          }
        }}
        className="lg:hidden w-full max-w-[340px] mx-auto bg-[#1C1A1A] border-2 border-[#373333] rounded-[36px] p-4 shadow-2xl shadow-black/40 relative overflow-hidden text-white cursor-pointer group hover:border-[#8F0028] transition-all active:scale-95"
      >
        {/* Phone Speaker Notch */}
        <div className="w-24 h-3.5 bg-[#141212] rounded-full mx-auto mb-3 flex items-center justify-center gap-1.5 border border-[#302B2B]">
          <div className="w-2 h-2 rounded-full bg-[#373333]" />
          <div className="w-8 h-1 rounded-full bg-[#262323]" />
        </div>

        {/* Mobile Mockup Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#302B2B]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#8F0028] flex items-center justify-center font-bold text-xs text-white shadow-sm">
              SB
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Kalyan Silks
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A650] animate-pulse" />
              </div>
              <div className="text-[10px] text-[#A39E9E]">Brand Brain Synced</div>
            </div>
          </div>
          <div className="text-[10px] bg-[#242222] border border-[#373333] px-2 py-0.5 rounded-md text-white font-mono">
            LIVE
          </div>
        </div>

        {/* AI CMO Daily Briefing Card */}
        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-[#242222] to-[#1C1A1A] border border-[#373333] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8F0028] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8F0028]" />
              AI CMO Pulse
            </span>
            <span className="text-[9px] text-[#A39E9E]">8:00 AM IST</span>
          </div>
          <p className="text-xs font-semibold text-white leading-snug">
            Diwali Growth Sprint: 3 WhatsApp broadcasts and 5 social carousels generated for review.
          </p>
        </div>

        {/* 2x2 Mobile Live Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-2.5 rounded-xl bg-[#242222] border border-[#373333]">
            <div className="text-[10px] text-[#A39E9E] font-medium">Attributed Revenue</div>
            <div className="text-sm font-extrabold text-white mt-0.5">₹42.8 Lakh</div>
            <div className="text-[9px] text-[#00A650] font-bold">+34% vs last mo</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#242222] border border-[#373333]">
            <div className="text-[10px] text-[#A39E9E] font-medium">Autonomous Agents</div>
            <div className="text-sm font-extrabold text-white mt-0.5">15 Active</div>
            <div className="text-[9px] text-[#00A650] font-bold">0 Pipeline Errors</div>
          </div>
        </div>

        {/* Floating Tap Indicator */}
        <div className="mt-3 py-2 px-3 rounded-xl bg-[#8F0028] text-white text-center text-xs font-bold shadow-lg shadow-[#8F0028]/30 flex items-center justify-center gap-1.5 group-hover:bg-[#A8002F] transition-colors">
          <span>Tap to Enter Live Demo Workspace</span>
          <span className="text-sm">&rarr;</span>
        </div>
      </div>

      {/* Desktop 3D Isometric Mockup (lg:flex) */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={async () => {
          try {
            await login('demo@standbharat.ai', 'demo')
            router.push('/app')
          } catch (e) {
            console.error('Mockup demo login error:', e)
          }
        }}
        className="hidden lg:flex relative z-10 w-full h-[550px] perspective-[2000px] group items-center justify-center transform scale-[0.85] origin-center -translate-x-10 transition-transform cursor-pointer"
      >
      {/* Background shadow layer for depth */}
      <div 
        className="absolute w-[90%] h-[450px] bg-black/5 rounded-3xl blur-2xl transition-transform ease-out duration-700"
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) translateZ(-100px) translateY(50px)` }}
      ></div>

      <div 
        className="w-[105%] h-[480px] rounded-[24px] border border-[#E8E4DC] dark:border-[#373333] bg-white dark:bg-[#1C1A1A] shadow-2xl shadow-[#800020]/5 flex transition-transform ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transitionDuration: isHovered ? '100ms' : '700ms'
        }}
      >
        <div className="flex w-full h-full rounded-[24px] overflow-hidden bg-white dark:bg-[#1C1A1A] relative" style={{ transform: 'translateZ(0px)' }}>
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-[#800020]/5 backdrop-blur-[2px] z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <div className="bg-[#800020] text-white px-6 py-3 rounded-xl font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Enter Live Demo &rarr;
             </div>
          </div>
          
          {/* Dark Sidebar */}
          <div className="w-48 bg-[#111111] text-white flex flex-col shrink-0">
            <div className="h-14 flex items-center px-5 border-b border-white/10">
              <div className="flex gap-2 items-center">
                <Image src="/logo-icon.png" alt="StandBharat Logo" width={20} height={20} className="object-contain" />
                <span className="font-bold text-sm tracking-tight">StandBharat</span>
              </div>
            </div>
            <div className="p-3 space-y-1 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-2 py-1.5 mt-2">System</div>
              <div className="bg-white dark:bg-[#1C1A1A]/10 text-white rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2.5 shadow-sm"><span className="w-2.5 h-2.5 rounded text-[#800020] bg-[#800020]/20"></span>Command Center</div>
              <div className="text-white/60 hover:bg-white dark:hover:bg-[#2A2828]/5 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded border border-white/20"></span>AI CMO Chat</div>
              <div className="text-white/60 hover:bg-white dark:hover:bg-[#2A2828]/5 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded border border-white/20"></span>Brand Brain</div>
              <div className="text-white/60 hover:bg-white dark:hover:bg-[#2A2828]/5 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded border border-white/20"></span>Content Studio</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-2 py-1.5 mt-4">Execution</div>
              <div className="text-white/60 hover:bg-white dark:hover:bg-[#2A2828]/5 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded border border-white/20"></span>Agents</div>
              <div className="text-white/60 hover:bg-white dark:hover:bg-[#2A2828]/5 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded border border-white/20"></span>Analytics</div>
              <div className="text-white/60 hover:bg-white dark:hover:bg-[#2A2828]/5 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded border border-white/20"></span>Campaigns</div>
            </div>
            <div className="mt-auto p-4 border-t border-white/10">
               <div className="bg-white dark:bg-[#1C1A1A]/5 rounded-xl p-3">
                 <div className="text-xs font-bold text-white mb-1">Pro Plan Active</div>
                 <div className="text-[10px] text-white/50">12/100 generations used</div>
               </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-[#FAF8F3] dark:bg-[#171515] flex flex-col overflow-hidden relative">
            <div className="h-14 bg-white dark:bg-[#1C1A1A] border-b border-[#E8E4DC] dark:border-[#373333] flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
              <span className="font-semibold text-sm text-[#111111] dark:text-white">app.standbharat.ai/dashboard</span>
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 rounded-md bg-[#E8E4DC]"></div>
                 <div className="w-6 h-6 rounded-full bg-[#111111]"></div>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              
              <div>
                 <h2 className="text-2xl font-bold text-[#111111] dark:text-white mb-1">Brand Command Center</h2>
                 <p className="text-sm text-[#5A5A5A] dark:text-[#E5E7EB] font-medium max-w-xs">Real-time intelligence and autonomous agents.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div className="bg-white dark:bg-[#1C1A1A] border border-[#E8E4DC] dark:border-[#373333] rounded-[16px] p-5 shadow-sm">
                  <div className="text-xs font-bold text-[#E5E7EB] dark:text-[#E5E7EB] mb-2">Brand Visibility</div>
                  <div className="text-3xl font-extrabold text-[#111111] dark:text-white mb-2">78</div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-bold text-white leading-tight">+12%<br/>this<br/>week</div>
                    {/* Tiny line chart */}
                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                      <path d="M2 14C6 14 8 8 12 8C16 8 18 12 22 12C26 12 30 4 38 4" stroke="#800020" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1C1A1A] border border-[#E8E4DC] dark:border-[#373333] rounded-[16px] p-5 shadow-sm">
                  <div className="text-xs font-bold text-[#E5E7EB] dark:text-[#E5E7EB] mb-2">Audience Sentiment</div>
                  <div className="text-3xl font-extrabold text-[#111111] dark:text-white mb-2">92%</div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-bold text-white leading-tight">+8%<br/>vs<br/>last mo</div>
                    {/* Tiny line chart */}
                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                      <path d="M2 12C8 12 10 4 16 4C22 4 26 10 32 10C36 10 38 2 38 2" stroke="#168A5B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#1C1A1A] border border-[#E8E4DC] dark:border-[#373333] rounded-[16px] p-5 shadow-sm max-w-sm">
                 <div className="text-sm font-bold text-[#111111] dark:text-white mb-1">Active AI Agents</div>
                 <div className="h-4 w-full bg-[#FAF8F3] dark:bg-[#171515] rounded mt-4"></div>
                 <div className="h-4 w-5/6 bg-[#FAF8F3] dark:bg-[#171515] rounded mt-2"></div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Popout 1: Growth Opportunity (Top Right) */}
        <div 
          className="absolute -right-12 top-6 bg-white dark:bg-[#1C1A1A]/95 backdrop-blur-md border border-[#E8E4DC] dark:border-[#373333] rounded-[24px] p-6 shadow-2xl shadow-[#111111]/10 w-64 pointer-events-none transition-all duration-700 ease-out"
          style={{
            transform: isHovered ? 'translateZ(90px) translateX(10px) translateY(-5px)' : 'translateZ(60px)',
          }}
        >
          <div className="flex gap-2 items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-[#168A5B]/10 flex items-center justify-center text-white">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div className="text-xs font-bold text-[#111111] dark:text-white">Growth Opportunity</div>
          </div>
          <div className="text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight mb-4">+42%</div>
          <div className="flex items-end gap-1.5 h-16 w-full">
            <div className="w-1/6 bg-[#E8E4DC] rounded-t-md h-[30%]"></div>
            <div className="w-1/6 bg-[#E8E4DC] rounded-t-md h-[40%]"></div>
            <div className="w-1/6 bg-[#E8E4DC] rounded-t-md h-[35%]"></div>
            <div className="w-1/6 bg-[#E8E4DC] rounded-t-md h-[50%]"></div>
            <div className="w-1/6 bg-[#800020] rounded-t-md h-[80%]"></div>
            <div className="w-1/6 bg-[#800020] rounded-t-md h-[100%] animate-pulse"></div>
          </div>
        </div>

        {/* Popout 2: Brand Sentiment (Middle Right) */}
        <div 
          className="absolute -right-2 top-44 bg-white dark:bg-[#1C1A1A]/95 backdrop-blur-md border border-[#E8E4DC] dark:border-[#373333] rounded-[24px] p-5 shadow-2xl shadow-[#111111]/10 w-56 pointer-events-none transition-all duration-700 ease-out delay-75"
          style={{
            transform: isHovered ? 'translateZ(130px) translateX(15px) translateY(5px)' : 'translateZ(100px)',
          }}
        >
          <div className="text-[10px] font-bold text-[#E5E7EB] dark:text-[#E5E7EB] uppercase tracking-wider mb-1">BRAND SENTIMENT</div>
          <div className="flex items-end gap-3 mb-2">
            <div className="text-3xl font-extrabold text-[#111111] dark:text-white leading-none">92%</div>
            <div className="text-[10px] font-bold text-white bg-[#168A5B]/10 px-1.5 py-0.5 rounded flex items-center mb-1">↑ 8%</div>
          </div>
          <svg className="w-full h-12" viewBox="0 0 100 30" fill="none">
             <path d="M0 25C20 25 30 15 50 15C70 15 80 5 100 5" stroke="#800020" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Popout 3: AI Agents Active (Bottom Right/Center) */}
        <div 
          className="absolute right-12 bottom-6 bg-[#111111] border border-white/10 rounded-[24px] p-5 shadow-2xl shadow-black/30 w-72 pointer-events-none transition-all duration-700 ease-out delay-150"
          style={{
            transform: isHovered ? 'translateZ(180px) translateX(-5px) translateY(10px)' : 'translateZ(140px)',
          }}
        >
          <div className="flex gap-2 items-center mb-4">
            <div className="w-2 h-2 rounded-full bg-[#168A5B] animate-pulse"></div>
            <div className="text-[10px] font-bold text-white uppercase tracking-wider">AI AGENTS ACTIVE</div>
          </div>
          <div className="space-y-3">
             <div className="bg-white dark:bg-[#1C1A1A]/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div className="text-xs text-white/90 font-medium">Analyzing market trends...</div>
             </div>
             <div className="bg-white dark:bg-[#1C1A1A]/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div className="text-xs text-white/90 font-medium">Processing competitor data...</div>
             </div>
             <div className="bg-white dark:bg-[#1C1A1A]/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 opacity-70">
                <div className="text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div className="text-xs text-white/90 font-medium">Generating content drafts...</div>
             </div>
          </div>
        </div>

      </div>
    </div>
    </>
  )
}

export function HeroSection() {
  const { login } = useAuth()
  const router = useRouter()
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  const handleDemoLogin = async () => {
    if (isDemoLoading) return
    setIsDemoLoading(true)
    try {
      await login('demo@standbharat.ai', 'demo')
      router.push('/app')
    } catch (err) {
      console.error('Failed to log into demo account:', err)
      setIsDemoLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 px-4 sm:px-6 lg:px-8 bg-transparent flex items-center min-h-[max(calc(100vh-140px),600px)]">
      <div className="max-w-[1400px] w-full mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-8 pointer-events-none">
        
        {/* Left Column 42% */}
        <div className="w-full lg:w-[42%] space-y-5 sm:space-y-6 pointer-events-auto lg:ml-10 text-center lg:text-left">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '0.0s' }}>
            <div className="inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5C0017] bg-[#F5E6E8]">
              THE AI MARKETING OPERATING SYSTEM • BUILT FOR BHARAT 🇮🇳
            </div>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-[32px] xs:text-[38px] sm:text-[48px] lg:text-[64px] font-extrabold tracking-tight text-[#111111] leading-[1.1] sm:leading-[1.05]">
              Your marketing team,<br className="hidden sm:inline" />
              with an <span className="text-[#800020]">AI CMO</span><br className="hidden sm:inline" />
              at the center.
            </h1>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm sm:text-base lg:text-lg text-[#5A5A5A] leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              StandBharat connects your brand intelligence, Indic voice presets, WhatsApp Business, AI agents, 1-click publishing, and INR revenue attribution into one continuous marketing system.
            </p>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-signup')) }} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-6 sm:px-8 text-sm sm:text-base bg-[#800020] text-white hover:bg-[#5C0017] rounded-xl font-bold border-none shadow-lg shadow-[#800020]/25">
                  Start Building Your System &rarr;
                </Button>
              </Link>
              <Button 
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-12 px-6 sm:px-8 text-sm sm:text-base bg-white text-[#111111] border-[#E8E4DC] hover:bg-[#FAF8F3] rounded-xl font-bold shadow-sm"
              >
                {isDemoLoading ? 'Entering Workspace...' : 'Try Demo Account'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column 58% - Product Mockup */}
        <div className="w-full lg:w-[58%] pointer-events-auto mt-4 lg:mt-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '0.4s' }}>
            <InteractiveDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

export function CapabilityStrip() {
  const topItems = [
    "Brand Intelligence",
    "AI Agents",
    "Content & Publishing",
    "Analytics & Revenue",
    "Continuous Learning"
  ]

  const bottomItems = [
    "Research & Analytics",
    "Strategy & Planning",
    "Content Creation",
    "Publishing & Scheduling",
    "Approvals & Collaboration",
    "Performance & Reporting",
    "Revenue & Attribution"
  ]

  return (
    <div className="border-b border-[#E8E4DC] overflow-hidden bg-white/80 backdrop-blur-sm">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }
      `}</style>
      
      <div className="border-t border-[#E8E4DC] py-4 relative flex items-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both w-full" style={{ animationDelay: '0.5s' }}>
          <div className="flex w-[200%] animate-marquee">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex-1 flex justify-around items-center px-4">
                {topItems.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 text-[#111111] font-semibold text-sm whitespace-nowrap px-8">
                    <span className="text-[#800020] text-xs">●</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#FAF8F3] py-3 relative flex items-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both w-full" style={{ animationDelay: '0.6s' }}>
          <div className="flex w-[200%] animate-marquee-reverse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex-1 flex justify-around items-center px-4">
                {bottomItems.map((item, j) => (
                  <div key={j} className="flex items-center gap-8 text-[#E5E7EB] font-medium text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap px-8">
                    <span>{item}</span>
                    <span className="text-[#E8E4DC]">|</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


