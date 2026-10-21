"use client"
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Swords, 
  ShieldCheck, 
  Target, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Flame,
  Zap,
  RefreshCw
} from 'lucide-react'

interface CompetitorBattlecardModalProps {
  isOpen: boolean
  onClose: () => void
  competitor: {
    id?: string
    name: string
    website_url?: string | null
    description?: string | null
    strengths?: string | null
    weaknesses?: string | null
    positioning?: string | null
  } | null
  brandName?: string
  onDeployCounterAttack?: (campaignName: string) => void
}

export function CompetitorBattlecardModal({
  isOpen,
  onClose,
  competitor,
  brandName = 'StandBharat',
  onDeployCounterAttack
}: CompetitorBattlecardModalProps) {
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)

  if (!isOpen || !competitor) return null

  const compName = competitor.name || 'Competitor'

  const objectionScripts = [
    {
      objection: `"Why should we choose ${brandName} over ${compName}?"`,
      rebuttal: `${compName} requires extensive manual prompt engineering and separate point tools for SEO, Social, and Ads. ${brandName} is a unified, autonomous Marketing Operating System where 15 specialized agents coordinate directly with an AI CMO, driving full revenue attribution without the agency bloat.`,
      tag: "Positioning Gap"
    },
    {
      objection: `"Isn't ${compName} more established in this space?"`,
      rebuttal: `They are established on legacy workflows built before multi-agent reasoning. While they give you templates, ${brandName} actively monitors your Google Search Console, creates autonomous sprints, and routes risky actions through human-in-the-loop governance.`,
      tag: "Tech Architecture"
    },
    {
      objection: `"How do your pricing models compare?"`,
      rebuttal: `${compName} charges exorbitant per-seat add-ons and agency retainers. ${brandName} provides an entire autonomous marketing department starting at predictable SaaS tiers with verifiable pipeline attribution.`,
      tag: "Pricing Moat"
    }
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedScript(id)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  const handleDeploy = () => {
    setIsDeploying(true)
    setTimeout(() => {
      setIsDeploying(false)
      setDeployed(true)
      onDeployCounterAttack?.(`Counter-Positioning Attack vs ${compName}`)
      setTimeout(() => {
        setDeployed(false)
        onClose()
      }, 1200)
    }, 800)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#171515] border border-[#2E2A2A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Solid background, NO gradient */}
        <div className="px-6 py-4 bg-[#1F1C1C] border-b border-[#2E2A2A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8F0028] text-white flex items-center justify-center font-bold">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Competitive Battlecard: <span className="text-white font-bold">{compName}</span>
                </h3>
                <Badge className="bg-[#262323] text-white border border-[#3E3838] text-[10px] py-0">
                  Active Radar Intel
                </Badge>
              </div>
              <p className="text-xs text-[#E5E7EB]">
                Head-to-head positioning, vulnerability vectors, and sales objection kill-shots.
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2727] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#171515]">
          {/* Head to Head Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Our Brand StandBharat */}
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2E2A2A] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#8F0028] text-white font-bold text-xs flex items-center justify-center">
                    SB
                  </div>
                  <span className="font-bold text-sm text-white">{brandName} (Your Brand)</span>
                </div>
                <Badge className="bg-[#242222] text-white border border-[#373333] text-[10px]">
                  Advantage
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Core Moat</span>
                  <p className="text-white mt-0.5">
                    Autonomous 15-Agent Fleet governed by AI CMO with native revenue attribution.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Delivery Speed</span>
                  <p className="text-white font-semibold mt-0.5">
                    Minutes per multi-channel sprint with 1-click Fast Approvals.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Pricing</span>
                  <p className="text-white mt-0.5">
                    Fixed SaaS tiers with unlimited autonomous execution tasks.
                  </p>
                </div>
              </div>
            </div>

            {/* Rival Brand */}
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2E2A2A] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#2A2727] text-[#E5E7EB] font-bold text-xs flex items-center justify-center border border-[#3E3838]">
                    {compName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-white">{compName}</span>
                </div>
                <Badge className="bg-[#242222] text-white border border-[#373333] text-[10px]">
                  Target Rival
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Known Weakness</span>
                  <p className="text-white mt-0.5">
                    {competitor.weaknesses || 'Fragmented toolchain requiring manual prompting and external agencies.'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Positioning Claim</span>
                  <p className="text-[#E5E7EB] mt-0.5">
                    {competitor.positioning || 'Legacy marketing suite built for point-and-click manual marketing.'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Observed Vulnerability</span>
                  <p className="text-[#E5E7EB] mt-0.5">
                    No closed-loop revenue attribution connecting copy drafts to CRM customer pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Objection Handling Scripts (Kill-Shots) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-white" />
              Field-Tested Objection Handling Scripts
            </h4>

            <div className="space-y-2.5">
              {objectionScripts.map((script, idx) => (
                <div key={idx} className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {script.objection}
                    </span>
                    <Badge variant="outline" className="bg-[#242222] border-[#3E3838] text-[10px] text-[#E5E7EB]">
                      {script.tag}
                    </Badge>
                  </div>

                  <p className="text-xs text-white leading-relaxed bg-[#171515] p-3 rounded-lg border border-[#262323]">
                    {script.rebuttal}
                  </p>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(script.rebuttal, `script-${idx}`)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#E5E7EB] hover:text-white rounded bg-[#242222] hover:bg-[#2C2929] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedScript === `script-${idx}` ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span className="text-white">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Rebuttal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions - Solid background */}
        <div className="px-6 py-4 bg-[#1F1C1C] border-t border-[#2E2A2A] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#E5E7EB]">
            Autonomous fleet ready to launch counter-attack campaign.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#373333] text-[#E5E7EB] hover:text-white bg-[#242222] text-xs"
            >
              Close
            </Button>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                deployed
                  ? 'bg-[#8F0028] text-white'
                  : 'bg-[#8F0028] hover:bg-[#A3002D] text-white shadow-lg'
              }`}
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Orchestrating Counter-Campaign...
                </>
              ) : deployed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Counter-Campaign Dispatched!
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Deploy Counter-Campaign vs {compName}
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
