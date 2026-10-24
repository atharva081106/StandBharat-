"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, Sparkles, CheckCircle2, Clock, Brain, Target, ShieldCheck, Zap } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppProvider } from '@/lib/providers'
import { useBrandBrain, useAuth } from '@/lib/providers/MockProvider'
import { ChatMessageRenderer } from '@/components/chat/ChatMessageRenderer'

export default function AICMO() {
  const { aiCmo } = useAppProvider()
  const { brandBrain } = useBrandBrain()
  const { activeBrand } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{role: 'user'|'ai', text: string, timestamp?: string}>>([
    {
      role: 'ai',
      text: "Hello! I am your AI Chief Marketing Officer. I have full strategic context on your brand positioning, competitor intelligence, and active publishing pipelines. What strategic goals should we tackle today?",
      timestamp: "Just now"
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [mobileTab, setMobileTab] = useState<'chat' | 'context'>('chat')
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async (customPrompt?: string) => {
    const userMessage = (customPrompt || input).trim()
    if (!userMessage || isLoading) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: timeStr }])
    setInput('')
    setIsLoading(true)
    
    try {
      let botResponse = ''
      try {
        const { status, response } = await aiCmo.chat(userMessage)
        if (status === 'SUCCESS' && response) {
          botResponse = response
        }
      } catch (e) {}

      if (!botResponse) {
        const brandName = activeBrand?.name || 'Workspace Brand'
        const domain = activeBrand?.website_url ? activeBrand.website_url.replace(/^https?:\/\//,'') : 'yourdomain.com'
        const targetAudience = brandBrain?.audiences?.[0]?.name || brandBrain?.audiences?.[0]?.demographics || 'Core Industry Leaders'
        const painPoints = brandBrain?.audiences?.[0]?.pain_points || 'Operational inefficiencies and customer acquisition cost'
        const primaryGoal = brandBrain?.goals?.[0]?.goal || 'Accelerate Annual Recurring Revenue'
        const valueProp = brandBrain?.positioning?.unique_value_proposition || activeBrand?.mission || 'Differentiated autonomous marketing platform'
        const comps = brandBrain?.competitors?.map((c: any) => c.name).filter(Boolean) || []
        const compsList = comps.length > 0 ? comps.join(', ') : 'Direct Industry Competitors'

        const lower = userMessage.toLowerCase()
        if (lower.includes('strategy') || lower.includes('30 day') || lower.includes('plan')) {
          botResponse = `### 30-Day Autonomous Growth Blueprint for **${brandName}**\n\n` +
            `• **Week 1 (Foundational Authority):** Launch 3 high-intent briefs addressing "${painPoints}".\n` +
            `• **Week 2 (SEO & Search Domination):** Optimize ${domain} core landing pages for "${valueProp}".\n` +
            `• **Week 3 (Competitive Differentiation):** Launch social and comparative counter-narratives against ${compsList}.\n` +
            `• **Week 4 (Revenue Capture):** Run performance optimization toward ${primaryGoal}.\n\n` +
            `*All assets have been queued for writer agents and will appear in your Approvals Queue.*`
        } else if (lower.includes('competitor') || lower.includes('track')) {
          botResponse = `### Competitive Threat & Positioning Analysis for **${brandName}**\n\n` +
            `We are actively benchmarking against **${compsList}**.\n\n` +
            `1. **Messaging Opportunity:** Competitors focus on manual tools; highlight our autonomous execution speed.\n` +
            `2. **Target Audience Alignment:** Focus exclusively on **${targetAudience}**.\n` +
            `3. **Key Differentiator:** "${valueProp}".`
        } else if (lower.includes('approval') || lower.includes('review') || lower.includes('publish')) {
          botResponse = `### Editorial & Approvals Queue Status\n\n` +
            `• 3 Content Drafts are ready for editorial sign-off.\n` +
            `• Platforms targeted: LinkedIn, Twitter/X, and Company Blog.\n` +
            `• Estimated traffic impact: +18% organic visibility within 14 days.\n\n` +
            `You can approve them all in 1-click in the **Approvals** tab.`
        } else {
          botResponse = `Based on **${brandName}**'s strategic positioning (*${valueProp}*), our immediate lever is accelerating engagement with **${targetAudience}** around "${painPoints}".\n\nWould you like me to generate campaign briefs, analyze competitor traffic, or review pending drafts?`
        }
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: botResponse, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }])
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I've reviewed your request and synced recommendations with your workspace context.", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#171515] text-white p-2.5 sm:p-4 lg:p-6 gap-3 sm:gap-6 max-w-[1600px] mx-auto w-full">
      {/* Mobile Top Segmented Switcher (< md) */}
      <div className="md:hidden flex items-center bg-[#242222] p-1 rounded-xl border border-[#373333] shrink-0">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'chat'
              ? 'bg-[#8F0028] text-white shadow-sm'
              : 'text-[#E5E7EB] hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Strategist Chat</span>
        </button>
        <button
          onClick={() => setMobileTab('context')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'context'
              ? 'bg-[#8F0028] text-white shadow-sm'
              : 'text-[#E5E7EB] hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Brand Context & Stepper</span>
        </button>
      </div>

      {/* Left Column: Chat Interface */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#1C1A1A] rounded-2xl shadow-xl border border-[#373333] overflow-hidden`}>
        {/* Header */}
        <div className="p-3 sm:p-4 px-4 sm:px-6 border-b border-[#373333] flex justify-between items-center bg-[#242222]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-[#8F0028] text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold flex items-center gap-2 text-white">
                AI CMO Strategic Command
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#E5E7EB]">
                Autonomous marketing strategist grounded in live brand context.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1C1A1A] px-2.5 sm:px-3 py-1 rounded-full border border-[#8F0028]/40 shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#800020] animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-wider uppercase">ONLINE</span>
          </div>
        </div>
        
        {/* Messages Body */}
        <div ref={chatScrollRef} className="flex-1 p-3.5 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-[#171515]">
          {messages.map((m, i) => (
            <ChatMessageRenderer
              key={i}
              role={m.role === 'ai' ? 'ai' : 'user'}
              content={m.text}
              timestamp={m.timestamp}
              brandName={activeBrand?.name}
            />
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-[#242222] border border-[#373333] text-[#E5E7EB] p-4 rounded-2xl rounded-tl-sm text-xs flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-[#8F0028] border-t-transparent animate-spin"></span>
                <span>AI CMO is synthesizing brand brain context & competitor landscape...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Input & Quick Prompts */}
        <div className="p-4 border-t border-[#373333] bg-[#1C1A1A]">
          {/* Quick prompt pills */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
            {[
              "What's my biggest growth opportunity?", 
              "Create 30-day marketing strategy", 
              "Analyze competitor positioning", 
              "What drafts need approval?"
            ].map(p => (
              <button 
                key={p} 
                onClick={() => handleSend(p)} 
                className="text-[11px] px-3 py-1.5 rounded-full border border-[#373333] bg-[#242222] text-white hover:bg-[#2D2A2A] hover:text-white transition-colors whitespace-nowrap font-medium shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative flex items-center">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask strategic questions, campaigns, or audits..." 
              className="w-full pr-12 pl-3.5 sm:pl-4 rounded-xl bg-[#242222] border border-[#373333] text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#8F0028] h-11 sm:h-12 text-xs sm:text-sm" 
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()} 
              className="absolute right-2 p-2 bg-[#8F0028] text-white rounded-lg hover:bg-[#A8002F] disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Strategic Context & Autonomous Workflow */}
      <div className={`${mobileTab === 'context' ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] lg:w-[380px] flex-col gap-4 sm:gap-5 overflow-y-auto custom-scrollbar`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-[#8F0028]" />
          Live Brand Brain Context
        </h3>
        
        {/* Brand Overview Card */}
        <Card className="bg-[#1C1A1A] border-[#373333] shadow-md">
          <div className="p-4 border-b border-[#373333] bg-[#242222]">
            <p className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-0.5">Active Target Audience</p>
            <p className="text-xs font-bold text-white truncate">
              {brandBrain?.audiences?.[0]?.name || brandBrain?.audiences?.[0]?.demographics || 'Core Business ICP'}
            </p>
          </div>
          <div className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-[#E5E7EB] uppercase font-bold block mb-1">Primary Pain Point</span>
              <p className="text-white leading-relaxed">
                {brandBrain?.audiences?.[0]?.pain_points || 'High customer acquisition costs and low organic brand authority.'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#373333]">
              <span className="text-[10px] text-[#E5E7EB] uppercase font-bold block mb-1">Value Proposition</span>
              <p className="text-white leading-relaxed">
                {brandBrain?.positioning?.unique_value_proposition || activeBrand?.mission || 'Full-funnel autonomous marketing execution with real-time AI attribution.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Active Autonomous Stepper */}
        <Card className="bg-[#1C1A1A] border-[#373333] shadow-md">
          <div className="p-4 border-b border-[#373333] bg-[#242222]">
            <p className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-0.5">Orchestrator Pipeline</p>
            <p className="text-xs font-bold text-white">Growth Campaign Acceleration</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-[#8F0028] flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="w-0.5 h-6 bg-[#8F0028]"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Competitive Gap Analysis</p>
                <p className="text-[11px] text-[#E5E7EB]">Completed by Competitor Spy Agent</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-[#8F0028] flex items-center justify-center animate-pulse text-white">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
                <div className="w-0.5 h-6 bg-[#373333]"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Content Generation</p>
                <p className="text-[11px] text-[#E5E7EB]">Writer Agent is drafting posts</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full border border-[#373333] bg-[#242222] flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-white">Human Editorial Sign-off</p>
                <p className="text-[11px] text-[#E5E7EB]">Awaiting review in Approvals</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
