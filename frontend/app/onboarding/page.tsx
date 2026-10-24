"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/providers/MockProvider'
import { 
  Sparkles, Bot, CheckCircle2, ChevronDown, ChevronUp, 
  ArrowRight, Globe, Building2, Target, ShieldCheck,
  Layers, Check, Loader2, Compass, TrendingUp
} from 'lucide-react'

interface IndustryPreset {
  id: string
  label: string
  icon: string
  description: string
}

const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'd2c',
    label: 'D2C & Retail',
    icon: '🛍️',
    description: 'Direct-to-consumer lifestyle, fashion, and retail brand.'
  },
  {
    id: 'saas',
    label: 'SaaS & Tech',
    icon: '💻',
    description: 'Modern B2B software and technology productivity platform.'
  },
  {
    id: 'wellness',
    label: 'Health & Wellness',
    icon: '🌿',
    description: 'Natural health, diagnostics, and holistic wellness solutions.'
  },
  {
    id: 'fintech',
    label: 'Fintech & BFSI',
    icon: '💳',
    description: 'Modern financial services, wealthtech, and digital payments.'
  },
  {
    id: 'services',
    label: 'Agency & Services',
    icon: '⚡',
    description: 'High-touch creative, digital marketing, and growth consultancy services.'
  },
  {
    id: 'fmcg',
    label: 'Food & FMCG',
    icon: '🍲',
    description: 'Packaged foods, organic groceries, and artisanal culinary products.'
  }
]

export default function ExpressOnboarding() {
  const router = useRouter()
  const { user, authState, setAuthState, activeWorkspace, activeBrand, checkAuth, setAuthModalOpen } = useAuth()

  // Core Express State
  const [businessName, setBusinessName] = useState('')
  const [website, setWebsite] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('d2c')

  // Launching & Progress Animation State
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchStep, setLaunchStep] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect users who already have configured workspace & brand
  useEffect(() => {
    if (authState === 'loggedIn' && activeWorkspace && activeBrand) {
      router.push('/app')
    }
  }, [authState, activeWorkspace, activeBrand, router])

  // Handle Industry Preset Selection
  const handleSelectIndustry = (preset: IndustryPreset) => {
    setSelectedIndustry(preset.id)
  }

  // Handle Form Submission / Express Launch
  const handleLaunch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!businessName.trim()) {
      setErrorMessage('Please enter your business or brand name')
      return
    }

    setErrorMessage(null)
    setIsLaunching(true)
    setLaunchStep(1)

    const payload = {
      businessName: businessName.trim(),
      website: website.trim(),
      description: INDUSTRY_PRESETS.find(p => p.id === selectedIndustry)?.description || `Workspace for ${businessName.trim()}`,
      valueProposition: '',
      brandVoice: ['Professional'],
      targetDemographic: '',
      customerPainPoints: '',
      primaryObjective: 'Accelerate Business Growth',
      targetRevenue: '',
      competitors: []
    }

    // Persist to local storage for immediate client-side availability
    try {
      localStorage.setItem('onboardingData', JSON.stringify(payload))
    } catch (err) {}

    const isApi = process.env.NEXT_PUBLIC_DATA_MODE === 'api'

    try {
      // Visual step 2: Agent provisioning
      setTimeout(() => setLaunchStep(2), 600)
      // Visual step 3: Synthesis & playbook
      setTimeout(() => setLaunchStep(3), 1200)

      if (isApi) {
        if (!user) {
          setIsLaunching(false)
          setErrorMessage('Please sign up or log in to create your workspace and launch your AI CMO.')
          setAuthModalOpen(true)
          return
        }

        const { ApiClient } = await import('@/lib/api/client')
        const result = await ApiClient.post<any>('/api/onboarding/complete', payload)

        if (result?.workspace_id) {
          ApiClient.defaultHeaders['X-Workspace-ID'] = result.workspace_id
        }
        if (result?.brand_id) {
          ApiClient.defaultHeaders['X-Brand-ID'] = result.brand_id
        }

        await checkAuth()
      }

      setAuthState('onboardingComplete')

      // Short delay to let user see final stage before transition
      setTimeout(() => {
        router.push('/app')
      }, 1600)

    } catch (err: any) {
      setIsLaunching(false)
      const msg = err?.message || 'Failed to complete setup'
      setErrorMessage(msg)
      if (msg.toLowerCase().includes('not authenticated') || msg.toLowerCase().includes('log in') || msg.toLowerCase().includes('user not found')) {
        setAuthModalOpen(true)
      }
    }
  }

  const activePreset = INDUSTRY_PRESETS.find(p => p.id === selectedIndustry) || INDUSTRY_PRESETS[0]

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden flex flex-col bg-[#0E0D0D] text-white selection:bg-[#800020] selection:text-white relative">
      
      {/* Background Architectural Vector Grid & Coordinates */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Crisp Vector Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#443C3C" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#800020" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid)" />
        </svg>

        {/* Technical Coordinate Watermarks */}
        <div className="absolute top-3 left-6 text-[9.5px] font-mono text-[#524B4B] tracking-widest hidden md:block select-none">
          ENGINE.ID // SB-BHARAT-2026 // NODE.01
        </div>
        <div className="absolute top-3 right-6 text-[9.5px] font-mono text-[#524B4B] tracking-widest hidden md:block select-none">
          SYSTEM_STATE: STANDBY [LATENCY: 18ms]
        </div>
        <div className="absolute bottom-3 left-6 text-[9.5px] font-mono text-[#524B4B] tracking-widest hidden md:block select-none">
          CALIBRATION // 15 AGENT FLEET READY
        </div>
        <div className="absolute bottom-3 right-6 text-[9.5px] font-mono text-[#524B4B] tracking-widest hidden md:block select-none">
          100% PRIVATE DATA ISOLATION
        </div>
      </div>

      {/* Compact Header */}
      <header className="px-5 py-2.5 sm:py-3 border-b border-[#2A2626] bg-[#161414] shrink-0 flex items-center justify-between z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image 
            src="/logo-icon.png" 
            alt="StandBharat Logo" 
            width={28} 
            height={28} 
            className="object-contain shrink-0 group-hover:scale-105 transition-transform" 
            priority 
          />
          <div>
            <span className="font-bold text-[15px] tracking-tight text-white block leading-tight">StandBharat</span>
            <span className="text-[9.5px] text-[#A09898] font-medium block">Autonomous Marketing Engine</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!user ? (
            <Button
              variant="ghost"
              onClick={() => setAuthModalOpen(true)}
              className="text-[12px] font-semibold text-[#D1CCCC] hover:text-white h-7.5 px-2.5 rounded-lg"
            >
              Sign In
            </Button>
          ) : (
            <span className="text-[11.5px] font-medium text-[#A09898] truncate max-w-[140px]">
              {user.name || user.email}
            </span>
          )}

          <Link href="/landingpage" className="text-[11.5px] text-[#A09898] hover:text-white font-medium transition-colors">
            Exit
          </Link>
        </div>
      </header>

      {/* Main Content Area - Center Card flanked by Solid Graphic Panels */}
      <main className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-5 lg:p-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-6xl flex items-center justify-center gap-5 sm:gap-6">

          {/* LEFT GRAPHIC PANEL: ARCHITECTURE & VECTOR DIAGRAM */}
          <div className="hidden xl:flex w-[270px] 2xl:w-[285px] shrink-0 flex-col justify-between p-5 rounded-2xl bg-[#161414] border border-[#2B2525] shadow-2xl h-[510px] relative">
            <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t-2 border-l-2 border-[#800020]" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t-2 border-r-2 border-[#800020]" />
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b-2 border-l-2 border-[#800020]" />
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b-2 border-r-2 border-[#800020]" />

            <div>
              <div className="flex items-center justify-between border-b border-[#282222] pb-2.5 mb-3.5">
                <span className="text-[10px] font-mono font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A650] shrink-0 animate-pulse"></span>
                  SYSTEM TOPOLOGY
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#201D1D] text-[#8E8787] border border-[#352F2F]">v2.4</span>
              </div>

              {/* Graphic Vector Diagram */}
              <div className="p-3 rounded-xl bg-[#100E0E] border border-[#241F1F] mb-3.5">
                <svg viewBox="0 0 240 150" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Central Node */}
                  <rect x="85" y="42" width="70" height="66" rx="12" fill="#1C1818" stroke="#800020" strokeWidth="2" />
                  <circle cx="120" cy="75" r="16" fill="#800020" />
                  <text x="120" y="79" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">BRAIN</text>
                  
                  {/* Connectors */}
                  <line x1="40" y1="32" x2="85" y2="58" stroke="#3A3333" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="200" y1="32" x2="155" y2="58" stroke="#3A3333" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="40" y1="118" x2="85" y2="92" stroke="#3A3333" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="200" y1="118" x2="155" y2="92" stroke="#3A3333" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Satellite Nodes */}
                  <circle cx="40" cy="32" r="14" fill="#1C1818" stroke="#00A650" strokeWidth="1.5" />
                  <text x="40" y="35" textAnchor="middle" fill="#E5E7EB" fontSize="7" fontWeight="bold" fontFamily="sans-serif">SEO</text>

                  <circle cx="200" cy="32" r="14" fill="#1C1818" stroke="#800020" strokeWidth="1.5" />
                  <text x="200" y="35" textAnchor="middle" fill="#E5E7EB" fontSize="7" fontWeight="bold" fontFamily="sans-serif">CMO</text>

                  <circle cx="40" cy="118" r="14" fill="#1C1818" stroke="#3A3333" strokeWidth="1.5" />
                  <text x="40" y="121" textAnchor="middle" fill="#E5E7EB" fontSize="7" fontWeight="bold" fontFamily="sans-serif">DATA</text>

                  <circle cx="200" cy="118" r="14" fill="#1C1818" stroke="#00A650" strokeWidth="1.5" />
                  <text x="200" y="121" textAnchor="middle" fill="#E5E7EB" fontSize="7" fontWeight="bold" fontFamily="sans-serif">ROAS</text>
                </svg>
              </div>

              {/* Solid Specs */}
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-[#141212] border border-[#252020] flex items-center justify-between text-[11px]">
                  <span className="text-[#8E8787]">Orchestrator:</span>
                  <span className="font-mono text-white font-bold">15 AI Agents</span>
                </div>
                <div className="p-2 rounded-lg bg-[#141212] border border-[#252020] flex items-center justify-between text-[11px]">
                  <span className="text-[#8E8787]">Execution:</span>
                  <span className="font-mono text-white font-bold">Deterministic</span>
                </div>
                <div className="p-2 rounded-lg bg-[#141212] border border-[#252020] flex items-center justify-between text-[11px]">
                  <span className="text-[#8E8787]">Attribution:</span>
                  <span className="font-mono text-[#00A650] font-bold">Real-Time GA4</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#241F1F] flex items-center gap-2 text-[10.5px] text-[#8E8787]">
              <ShieldCheck className="w-4 h-4 text-[#00A650] shrink-0" />
              <span>Full Private Brand Vector DNA</span>
            </div>
          </div>

          {/* CENTER CARD: MAIN SETUP FORM */}
          <div className="w-full max-w-lg bg-[#161414] border border-[#2B2525] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 relative shrink-0">
            {/* Corner Tech Brackets */}
            <div className="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-[#800020]" />
            <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-[#800020]" />
            <div className="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-[#800020]" />
            <div className="absolute bottom-3 right-3 w-2 h-2 border-b-2 border-r-2 border-[#800020]" />

            <form onSubmit={handleLaunch} className="space-y-4">
              
              {/* Header with Solid Graphic Emblem */}
              <div className="text-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#800020] border border-[#9E0028] flex items-center justify-center mx-auto mb-2.5 shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#201D1D] border border-[#332E2E] text-[10px] font-mono text-[#D1CCCC] mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></span>
                  <span>STEP 01 // INSTANT CALIBRATION</span>
                </div>
                <h1 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight leading-tight">
                  Launch your Autonomous Marketing Engine
                </h1>
                <p className="text-[12px] text-[#A09898] mt-1 leading-normal">
                  Configure your brand to generate your autonomous workspace.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-2.5 bg-[#251216] border border-[#800020] text-white rounded-xl text-[11.5px] flex items-center gap-2 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Business Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1.5">
                  Brand or Business Name <span className="text-[#800020]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#807676]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <Input 
                    placeholder="e.g. BharatOrganics, VedaSpices, UrbanKicks" 
                    value={businessName} 
                    onChange={e => {
                      setBusinessName(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }} 
                    autoFocus
                    required 
                    className="h-10 pl-10 bg-[#1F1C1C] border-[#332D2D] text-white focus-visible:ring-1 focus-visible:ring-[#800020] text-[13px] placeholder:text-[#6D6565] rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Website URL */}
              <div>
                <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1.5">
                  Website URL <span className="text-[10px] text-[#807676] lowercase font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#807676]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <Input 
                    placeholder="https://yourbrand.in" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    className="h-10 pl-10 bg-[#1F1C1C] border-[#332D2D] text-white focus-visible:ring-1 focus-visible:ring-[#800020] text-[13px] placeholder:text-[#6D6565] rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Field 3: Industry Presets */}
              <div>
                <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1.5">
                  Industry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INDUSTRY_PRESETS.map(preset => {
                    const isSelected = selectedIndustry === preset.id
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => handleSelectIndustry(preset)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#2B131A] border-[#800020] text-white shadow-sm'
                            : 'bg-[#1F1C1C] border-[#312B2B] text-[#D1CCCC] hover:border-[#463E3E] hover:text-white'
                        }`}
                      >
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-[11.5px] font-bold block truncate">{preset.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-1.5">
                <Button 
                  type="submit"
                  disabled={isLaunching || !businessName.trim()}
                  className="w-full h-11 bg-[#800020] hover:bg-[#990026] text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.99] disabled:opacity-50"
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating AI Engine ({launchStep}/3)...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Autonomous AI Engine</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>

            </form>

          </div>

          {/* RIGHT GRAPHIC PANEL: LIVE FLEET READINESS */}
          <div className="hidden xl:flex w-[270px] 2xl:w-[285px] shrink-0 flex-col justify-between p-5 rounded-2xl bg-[#161414] border border-[#2B2525] shadow-2xl h-[510px] relative">
            <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t-2 border-l-2 border-[#800020]" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t-2 border-r-2 border-[#800020]" />
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b-2 border-l-2 border-[#800020]" />
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b-2 border-r-2 border-[#800020]" />

            <div>
              <div className="flex items-center justify-between border-b border-[#282222] pb-2.5 mb-3.5">
                <span className="text-[10px] font-mono font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#00A650]" />
                  FLEET PROVISIONING
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#201D1D] text-[#00A650] border border-[#352F2F]">READY</span>
              </div>

              {/* Agent Readiness Graphic Cards */}
              <div className="space-y-2 mb-3.5">
                {[
                  { name: 'Executive CMO Agent', role: 'Strategic Guidance', status: 'ACTIVE' },
                  { name: 'SEO & GEO Agent', role: 'Search Discovery', status: 'STANDBY' },
                  { name: 'Content Engine', role: 'Creative Drafts', status: 'STANDBY' },
                  { name: 'Growth Hacker', role: 'Funnel Optimization', status: 'STANDBY' },
                  { name: 'Attribution Loop', role: 'ROAS Measurement', status: 'STANDBY' }
                ].map((agent, i) => (
                  <div key={i} className="p-2 rounded-xl bg-[#100E0E] border border-[#241F1F] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight">{agent.name}</div>
                      <div className="text-[9.5px] text-[#7E7777]">{agent.role}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#181515] border border-[#312B2B] text-[#00A650]">
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Bar Graphic */}
            <div className="pt-3 border-t border-[#241F1F] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8E8787]">ENGINE CAPACITY</span>
                <span className="text-[#00A650] font-bold">100% ONLINE</span>
              </div>
              <div className="w-full h-1.5 bg-[#201D1D] rounded-full overflow-hidden flex gap-0.5">
                <div className="h-full bg-[#800020] w-1/3 rounded-full"></div>
                <div className="h-full bg-[#800020] w-1/3 rounded-full"></div>
                <div className="h-full bg-[#00A650] w-1/3 rounded-full"></div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================= */}
      {/* LAUNCHING OVERLAY ANIMATION */}
      {/* ========================================================= */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1C1A1A] border border-[#383333] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            
            <div className="w-16 h-16 rounded-2xl bg-[#800020] border border-[#9E0028] flex items-center justify-center mx-auto shadow-xl shadow-[#800020]/25">
              <Image src="/logo-icon.png" alt="StandBharat Logo" width={34} height={34} className="object-contain animate-pulse" priority />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-white">Synthesizing AI Workspace</h2>
              <p className="text-[12px] text-[#A09898] mt-1">Calibrating your brand intelligence for {businessName}...</p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-3 text-left">
              <div className="p-3 rounded-xl bg-[#242222] border border-[#332E2E] flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${launchStep >= 1 ? 'bg-[#00A650] text-white' : 'border border-[#443E3E]'}`}>
                  {launchStep >= 1 ? <Check className="w-3 h-3 stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#807676]" />}
                </div>
                <span className={`text-[12px] font-semibold ${launchStep >= 1 ? 'text-white' : 'text-[#807676]'}`}>
                  Grounding Brand Brain DNA & domain signals
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#242222] border border-[#332E2E] flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${launchStep >= 2 ? 'bg-[#00A650] text-white' : 'border border-[#443E3E]'}`}>
                  {launchStep >= 2 ? <Check className="w-3 h-3 stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#807676]" />}
                </div>
                <span className={`text-[12px] font-semibold ${launchStep >= 2 ? 'text-white' : 'text-[#807676]'}`}>
                  Assembling 15 specialized marketing agents
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#242222] border border-[#332E2E] flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${launchStep >= 3 ? 'bg-[#00A650] text-white' : 'border border-[#443E3E]'}`}>
                  {launchStep >= 3 ? <Check className="w-3 h-3 stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#807676]" />}
                </div>
                <span className={`text-[12px] font-semibold ${launchStep >= 3 ? 'text-white' : 'text-[#807676]'}`}>
                  Generating 30-day attribution & content playbook
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#A09898] flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8F0028]" />
              <span>Redirecting to Command Center...</span>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
