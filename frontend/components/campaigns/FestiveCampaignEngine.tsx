"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiClient } from '@/lib/api/client'
import { 
  Sparkles, Calendar, TrendingUp, Zap, Clock, 
  CheckCircle2, ArrowRight, Share2, Flame, Gift, ShoppingBag
} from 'lucide-react'

interface Festival {
  id: string
  name: string
  date: string
  days_left: number
  category: string
  spending_uplift: string
  urgency: string
  themes: string[]
  suggested_discount: string
  indic_greetings: string
  primary_channels: string[]
}

export function FestiveCampaignEngine({ onSprintLaunched }: { onSprintLaunched?: () => void }) {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null)
  
  // Sprint Configurator State
  const [discount, setDiscount] = useState('30% OFF')
  const [budget, setBudget] = useState(75000)
  const [targetMarket, setTargetMarket] = useState('Pan-India (Tier 1 & Tier 2)')
  const [launching, setLaunching] = useState(false)
  const [launchSuccess, setLaunchSuccess] = useState<any>(null)

  useEffect(() => {
    async function loadFestivals() {
      try {
        const data = await ApiClient.get<Festival[]>('/api/campaigns/festivals')
        if (data && data.length > 0) {
          setFestivals(data)
          setSelectedFestival(data[0])
          setDiscount(data[0].suggested_discount || '30% OFF')
        }
      } catch (e) {
        console.warn('Failed to fetch festival calendar, using defaults', e)
        const defaults: Festival[] = [
          {
            id: 'diwali',
            name: 'Diwali & Dhanteras (Deepavali)',
            date: '2026-11-08',
            days_left: 16,
            category: 'Mega Shopping Season',
            spending_uplift: '+340% E-Commerce Surge',
            urgency: 'CRITICAL',
            themes: ['Gifting', 'Gold & Wealth', 'Home Makeover', 'Festive Discounts'],
            suggested_discount: '30% OFF',
            indic_greetings: 'शुभ दीपावली (Shubh Deepavali)',
            primary_channels: ['WhatsApp Broadcast', 'Instagram Reels', 'Google Shopping', 'YouTube Shorts']
          },
          {
            id: 'navratri',
            name: 'Navratri & Dussehra',
            date: '2026-10-28',
            days_left: 5,
            category: 'Cultural & Fashion Spike',
            spending_uplift: '+210% Retail Demand',
            urgency: 'HIGH',
            themes: ['Ethnic Fashion', 'Celebration', 'Victory of Good'],
            suggested_discount: 'Flat 25% OFF',
            indic_greetings: 'शुभ नवरात्रि (Shubh Navratri)',
            primary_channels: ['Instagram Carousels', 'WhatsApp Alerts', 'Meta Ads']
          },
          {
            id: 'republic_day',
            name: 'Republic Day (Ganatantra Diwas)',
            date: '2027-01-26',
            days_left: 95,
            category: 'National Pride & Electronics',
            spending_uplift: '+180% Patriotic Mega Sale',
            urgency: 'UPCOMING',
            themes: ['Made in India', 'Vocal for Local', 'Stand with Bharat'],
            suggested_discount: 'Up to 50% OFF',
            indic_greetings: 'गणतंत्र दिवस की हार्दिक शुभकामनाएं',
            primary_channels: ['LinkedIn Thought Leadership', 'YouTube Shorts', 'WhatsApp']
          }
        ]
        setFestivals(defaults)
        setSelectedFestival(defaults[0])
      } finally {
        setLoading(false)
      }
    }
    loadFestivals()
  }, [])

  const handleLaunchSprint = async () => {
    if (!selectedFestival) return
    setLaunching(true)
    setLaunchSuccess(null)
    try {
      const payload = {
        festival_id: selectedFestival.id,
        festival_name: selectedFestival.name,
        budget,
        discount,
        target_market: targetMarket
      }
      const res = await ApiClient.post<any>('/api/campaigns/festive-sprint', payload)
      setLaunchSuccess(res)
      if (onSprintLaunched) onSprintLaunched()
    } catch (err: any) {
      alert('Failed to launch sprint: ' + (err.message || 'Error'))
    } finally {
      setLaunching(false)
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'CRITICAL':
        return <Badge className="bg-[#8F0028] text-white font-bold text-[10px] animate-pulse">🔥 CRITICAL</Badge>
      case 'HIGH':
        return <Badge className="bg-amber-600 text-white font-bold text-[10px]">⚡ HIGH URGENCY</Badge>
      default:
        return <Badge className="bg-[#242222] text-[#E5E7EB] border border-[#373333] text-[10px]">UPCOMING</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8F0028] text-white">
                Festive Bharat Engine
              </span>
              <span className="text-xs text-[#E5E7EB]">
                AI-Driven Festive Sprints for High E-Commerce Uplift
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Indian Festive Calendar & 1-Click Multi-Channel Sprints
            </h2>
            <p className="text-xs sm:text-sm text-[#E5E7EB] leading-relaxed">
              India's festive season accounts for up to 60% of annual consumer spending. Launch full localized campaigns across WhatsApp, Instagram, and Search tailored with Indic cultural nuance.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#242222] border border-[#373333] px-4 py-2.5 rounded-xl shrink-0">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">Next Peak: Diwali Big Dhamaka</div>
              <div className="text-[10px] text-[#00A650] font-semibold">+340% Spending Wave</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Calendar on Left, Configurator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Festival Cards */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-white" />
            Select Upcoming Festival ({festivals.length})
          </h3>

          <div className="space-y-3">
            {festivals.map((fest) => {
              const isSelected = selectedFestival?.id === fest.id
              return (
                <div
                  key={fest.id}
                  onClick={() => {
                    setSelectedFestival(fest)
                    setDiscount(fest.suggested_discount || '30% OFF')
                    setLaunchSuccess(null)
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#242222] border-[#8F0028] shadow-lg ring-1 ring-[#8F0028]' 
                      : 'bg-[#1C1A1A] border-[#373333] hover:border-[#4A4545]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{fest.name}</span>
                        {getUrgencyBadge(fest.urgency)}
                      </div>
                      <div className="text-xs text-[#E5E7EB] flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white" />
                          <strong>{fest.days_left} days left</strong> ({fest.date})
                        </span>
                        <span className="text-[#00A650] font-semibold">{fest.spending_uplift}</span>
                      </div>
                      <div className="text-[11px] text-[#A39E9E] italic pt-0.5">
                        Indic Greeting: "{fest.indic_greetings}"
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold uppercase text-[#E5E7EB]">Suggested Offer</div>
                      <div className="text-sm font-extrabold text-white">{fest.suggested_discount}</div>
                    </div>
                  </div>

                  {/* Channel & Theme Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-[#2C2929]">
                    {fest.themes.slice(0, 3).map((theme, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181616] text-[#E5E7EB] border border-[#332E2E]">
                        {theme}
                      </span>
                    ))}
                    <div className="ml-auto text-[10px] text-[#E5E7EB]">
                      Channels: {fest.primary_channels.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: 1-Click Sprint Configurator */}
        <div className="lg:col-span-5">
          <Card className="bg-[#1C1A1A] border-[#373333] shadow-xl sticky top-4">
            <CardHeader className="pb-3 border-b border-[#373333]">
              <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#8F0028]" />
                1-Click Festive Sprint Configurator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {selectedFestival ? (
                <>
                  <div className="p-3 bg-[#242222] rounded-xl border border-[#373333] space-y-1">
                    <div className="text-[11px] text-[#E5E7EB]">Target Festival:</div>
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span>{selectedFestival.name}</span>
                      <span className="text-xs text-amber-400 font-mono">{selectedFestival.days_left}d countdown</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#E5E7EB]">Festive Discount / Hook</label>
                    <Input 
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="e.g. Flat 30% OFF + Free Gift Box"
                      className="bg-[#242222] border-[#373333] text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#E5E7EB]">Target Consumer Segment</label>
                    <select
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      className="w-full bg-[#242222] border border-[#373333] rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Pan-India (Tier 1 & Tier 2)">Pan-India (Tier 1 & Tier 2 Metros)</option>
                      <option value="Bharat Deep (Tier 2/3/4 Regional)">Bharat Deep (Tier 2/3/4 Regional)</option>
                      <option value="Metro High-Value Shoppers">Metro High-Value Shoppers (₹5k+ AOV)</option>
                      <option value="Corporate Festive Gifting">Corporate Festive Gifting (B2B)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#E5E7EB]">Allocated Sprint Budget</span>
                      <span className="font-bold text-white">₹{budget.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min="15000"
                      max="300000"
                      step="5000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full accent-[#8F0028] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#A39E9E]">
                      <span>₹15,000 (Lean Sprint)</span>
                      <span>₹3,00,000 (Dhamaka Push)</span>
                    </div>
                  </div>

                  {/* Auto-Generated Deliverables Callout */}
                  <div className="p-3 bg-[#181616] border border-[#332E2E] rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#00A650]" />
                      Auto-Generated in Approval Queue:
                    </div>
                    <ul className="text-[#E5E7EB] text-[11px] space-y-1">
                      <li>• 1x WhatsApp Broadcast with Indic Greeting & Quick Reply</li>
                      <li>• 1x 5-Slide Instagram/LinkedIn Festive Carousel</li>
                      <li>• 1x Google & Meta Ad Copy with Festive Surcharges</li>
                    </ul>
                  </div>

                  {launchSuccess && (
                    <div className="p-3.5 rounded-xl bg-[#242222] border border-[#00A650]/40 text-xs text-white space-y-1">
                      <div className="font-bold text-[#00A650] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00A650]" />
                        Festive Sprint Launched!
                      </div>
                      <p className="text-[#E5E7EB] text-[11px]">
                        {launchSuccess.message} Check your <strong>Approvals Queue</strong> to review and publish the creative drafts.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleLaunchSprint}
                    disabled={launching}
                    className="w-full bg-[#8F0028] hover:bg-[#A8002F] text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#8F0028]/25"
                  >
                    {launching ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Creative Deliverables...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate 1-Click Festive Sprint (₹{budget.toLocaleString()})
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-[#E5E7EB]">
                  Select a festival to begin configuring your sprint.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
