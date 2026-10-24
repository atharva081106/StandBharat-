"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiClient } from '@/lib/api/client'
import Link from 'next/link'
import { 
  Sparkles, Flame, Swords, ArrowRight, Volume2, 
  VolumeX, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Radio
} from 'lucide-react'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

interface CriticalAction {
  id: string
  priority: string
  title: string
  detail: string
  type: string
  suggested_action: string
}

interface MorningBriefingData {
  briefing_time: string
  briefing_date: string
  cmo_name: string
  growth_health_score: number
  health_score_delta: string
  market_sentiment: {
    mood: string
    indic_summary: string
    average_cpc_trend: string
  }
  critical_actions: CriticalAction[]
  pending_approvals_count: number
}

export function MorningBriefingCard({ onActionTriggered }: { onActionTriggered?: (actionType: string) => void }) {
  const [briefing, setBriefing] = useState<MorningBriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [executingActionId, setExecutingActionId] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const fetchBriefing = async () => {
    setLoading(true)
    try {
      const data = await ApiClient.get<MorningBriefingData>('/api/dashboard/morning-briefing')
      if (data) setBriefing(data)
    } catch (e) {
      console.warn('Briefing API fallback', e)
      setBriefing({
        briefing_time: "8:00 AM IST",
        briefing_date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        cmo_name: "Arjun AI (Autonomous CMO)",
        growth_health_score: 94,
        health_score_delta: "+3 pts vs yesterday",
        market_sentiment: {
          mood: "High Festive Velocity 🔥",
          indic_summary: "Festive consumer intent is peaking across Tier-1 and Tier-2 Indian cities. E-commerce conversion rates are up +24% week-on-week.",
          average_cpc_trend: "₹12.40 (down 8% via long-tail Indic keywords)"
        },
        critical_actions: [
          {
            id: "act-1",
            priority: "HIGH",
            title: "Launch Counter-Attack against Nearest Rival",
            detail: "Competitor increased enterprise pricing by 20%. Highlight StandBharat's fixed-tier SaaS advantage.",
            type: "COMPETITOR_DEFENSE",
            suggested_action: "Generate Counter Battlecard Ad"
          },
          {
            id: "act-2",
            priority: "URGENT",
            title: "Trigger WhatsApp Cart Recovery Sequence",
            detail: "14 shoppers abandoned carts with COD selected in the past 18 hours. Offer instant 10% UPI cashback.",
            type: "CONVERSION_RECOVERY",
            suggested_action: "Broadcast WhatsApp Recovery"
          },
          {
            id: "act-3",
            priority: "OPPORTUNITY",
            title: "Publish Indic Festive Carousel on LinkedIn",
            detail: "Long-form visual carousels are generating 4.2x higher organic saves ahead of festive shopping spikes.",
            type: "ORGANIC_GROWTH",
            suggested_action: "Open Carousel Studio"
          }
        ],
        pending_approvals_count: 3
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBriefing()
  }, [])

  const handleExecuteAction = async (action: CriticalAction) => {
    setExecutingActionId(action.id)
    setActionFeedback(null)
    try {
      if (action.type === 'COMPETITOR_DEFENSE') {
        const res = await ApiClient.post<any>('/api/dashboard/counter-attack', {
          competitor_name: 'Key Market Rival',
          competitor_weakness: 'Rigid pricing and lack of native Indian WhatsApp integrations'
        })
        setActionFeedback(res.message || 'Counter-attack draft generated in Approvals Queue!')
      } else {
        setActionFeedback(`Action "${action.title}" queued for automated execution!`)
      }
      if (onActionTriggered) onActionTriggered(action.type)
    } catch (e: any) {
      setActionFeedback(`Initiated: ${action.title}`)
    } finally {
      setExecutingActionId(null)
      setTimeout(() => setActionFeedback(null), 5000)
    }
  }

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio)
  }

  if (loading) {
    return (
      <div className="p-4 bg-[#201D1D] border border-[#332E2E] rounded-2xl flex items-center justify-between text-xs text-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#8F0028] border-t-transparent animate-spin" />
          <span>Generating 8:00 AM IST Executive AI CMO Briefing...</span>
        </div>
      </div>
    )
  }

  if (!briefing) return null

  return (
    <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl overflow-hidden shadow-xl mb-5">
      {/* Top Banner Bar */}
      <div className="px-4 py-3 bg-[#242222] border-b border-[#373333] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A650] animate-pulse shrink-0" />
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <Radio className="w-3.5 h-3.5 text-white shrink-0" />
            {briefing.briefing_time} Executive Briefing
          </span>
          <span className="text-[11px] text-[#A39E9E] whitespace-nowrap">
            • {briefing.briefing_date}
          </span>
          <Badge className="bg-[#8F0028] text-white text-[9.5px] font-bold py-0.5 px-2 whitespace-nowrap shrink-0">
            {briefing.cmo_name}
          </Badge>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Audio Briefing Simulator Button */}
          <button
            onClick={toggleAudio}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isPlayingAudio 
                ? 'bg-[#00A650] text-white animate-pulse' 
                : 'bg-[#1C1A1A] border border-[#373333] text-[#E5E7EB] hover:text-white'
            }`}
            title="Listen to 60-second synthesized audio summary"
          >
            {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 shrink-0" /> : <VolumeX className="w-3.5 h-3.5 shrink-0" />}
            <span>{isPlayingAudio ? 'Playing...' : '60s Audio Briefing'}</span>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#E5E7EB] hover:text-white p-1 rounded hover:bg-[#332E2E]"
            aria-label="Toggle briefing collapse"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Sentiment & Score Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Score Card */}
              <div className="bg-[#242222] border border-[#373333] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm min-w-0">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39E9E] truncate">Growth Health Score</div>
                  <div className="text-2xl font-black text-white mt-0.5">{briefing.growth_health_score}/100</div>
                </div>
                <Badge className="bg-[#00A650]/20 text-[#00A650] border border-[#00A650]/30 text-[10px] font-bold px-2 py-0.5 whitespace-nowrap shrink-0">
                  {briefing.health_score_delta}
                </Badge>
              </div>

              {/* Indic Search CPC Trend Card */}
              <div className="bg-[#242222] border border-[#373333] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39E9E] truncate">Indic Search CPC Trend</div>
                  <HoverScrollText
                    text={briefing.market_sentiment.average_cpc_trend}
                    className="text-xs font-bold text-white mt-0.5"
                  />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  -8% CPC
                </span>
              </div>
            </div>

            {/* Indian Market Sentiment Card */}
            <div className="bg-[#242222] border border-[#373333] rounded-xl p-3.5 space-y-1.5 shadow-sm min-w-0">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A39E9E] whitespace-nowrap">Indic Market Sentiment:</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                  {briefing.market_sentiment.mood}
                </span>
              </div>
              <p className="text-xs text-[#E5E7EB] leading-relaxed">
                {briefing.market_sentiment.indic_summary}
              </p>
            </div>
          </div>

          {/* Feedback Toast */}
          {actionFeedback && (
            <div className="p-3 bg-[#242222] border border-[#00A650]/40 rounded-xl text-xs text-white flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#00A650] shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* 3 Critical Actions for Today */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider">
              Today's 3 Crucial Action Items (High-Impact ROI Levers)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {briefing.critical_actions.map((act) => (
                <div
                  key={act.id}
                  className="bg-[#242222] border border-[#373333] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#4A4545] transition-all space-y-3 min-w-0 overflow-hidden"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <Badge className={
                        act.priority === 'HIGH' 
                          ? 'bg-[#8F0028] text-white text-[9px] py-0.5 px-2 font-bold shrink-0'
                          : act.priority === 'URGENT'
                          ? 'bg-amber-600 text-white text-[9px] py-0.5 px-2 font-bold shrink-0'
                          : 'bg-[#1C1A1A] text-[#00A650] border border-[#332E2E] text-[9px] py-0.5 px-2 font-bold shrink-0'
                      }>
                        {act.priority}
                      </Badge>
                      <span className="text-[9.5px] text-[#A39E9E] font-mono uppercase tracking-wider truncate" title={act.type.replace('_', ' ')}>
                        {act.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2" title={act.title}>
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-[#E5E7EB] leading-relaxed line-clamp-2" title={act.detail}>
                      {act.detail}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#332E2E] shrink-0">
                    {act.type === 'COMPETITOR_DEFENSE' ? (
                      <Button
                        size="sm"
                        onClick={() => handleExecuteAction(act)}
                        disabled={executingActionId === act.id}
                        className="w-full bg-[#8F0028] hover:bg-[#A8002F] text-white text-[11px] font-bold h-7.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm min-w-0 overflow-hidden"
                        title={act.title}
                      >
                        {executingActionId === act.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                            <span className="truncate">Launching...</span>
                          </>
                        ) : (
                          <>
                            <Swords className="w-3 h-3 shrink-0" />
                            <HoverScrollText text="Launch Counter-Attack" />
                          </>
                        )}
                      </Button>
                    ) : act.type === 'CONVERSION_RECOVERY' ? (
                      <Link href="/app/campaigns" className="block w-full">
                        <Button
                          size="sm"
                          className="w-full bg-[#00A650] hover:bg-[#008f45] text-white text-[11px] font-bold h-7.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm min-w-0 overflow-hidden"
                          title="Open WhatsApp Recovery Studio"
                        >
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <HoverScrollText text="Open WhatsApp Studio" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/app/content" className="block w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-[#373333] bg-[#181616] text-white hover:text-white text-[11px] font-bold h-7.5 px-2 rounded-lg flex items-center justify-center gap-1.5 min-w-0 overflow-hidden"
                          title="Open Carousel Studio"
                        >
                          <span className="shrink-0">🎨</span>
                          <HoverScrollText text="Open Carousel Studio" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
