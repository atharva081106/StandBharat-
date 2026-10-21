"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react'

interface WebhookAlertSettingsProps {
  className?: string
}

export function WebhookAlertSettings({
  className = ''
}: WebhookAlertSettingsProps) {
  // Slack Webhook State
  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/T0123/B0456/sampleToken')
  const [slackTesting, setSlackTesting] = useState(false)
  const [slackSuccess, setSlackSuccess] = useState(false)

  // WhatsApp Alert State
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210')
  const [whatsappTesting, setWhatsappTesting] = useState(false)
  const [whatsappSuccess, setWhatsappSuccess] = useState(false)

  // Email Digest State
  const [executiveEmail, setExecutiveEmail] = useState('founder@standbharat.com')
  const [digestFreq, setDigestFreq] = useState<'daily' | 'weekly'>('weekly')
  const [savedSettings, setSavedSettings] = useState(false)

  const handleTestSlack = () => {
    setSlackTesting(true)
    setTimeout(() => {
      setSlackTesting(false)
      setSlackSuccess(true)
      setTimeout(() => setSlackSuccess(false), 3000)
    }, 700)
  }

  const handleTestWhatsApp = () => {
    setWhatsappTesting(true)
    setTimeout(() => {
      setWhatsappTesting(false)
      setWhatsappSuccess(true)
      setTimeout(() => setWhatsappSuccess(false), 3000)
    }, 700)
  }

  const handleSaveAll = () => {
    setSavedSettings(true)
    setTimeout(() => setSavedSettings(false), 2500)
  }

  return (
    <Card className={`bg-[#1C1A1A] border-[#373333] shadow-lg ${className}`}>
      {/* Header - Solid background, NO gradient */}
      <CardHeader className="border-b border-[#373333] pb-4 bg-[#201D1D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8F0028] text-white flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                Multi-Channel Alerts & Webhook Routing
                <Badge className="bg-[#262323] text-white border border-emerald-500/30 text-[10px] py-0">
                  Real-Time Dispatch
                </Badge>
              </CardTitle>
              <p className="text-xs text-[#E5E7EB] mt-0.5">
                Route approvals, sprint completions, and weekly CMO intelligence reports directly to your team's chat tools.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSaveAll}
            className="bg-[#8F0028] hover:bg-[#A3002D] text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            {savedSettings ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-white" />
                Alert Rules Saved!
              </>
            ) : (
              'Save Routing Rules'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6 bg-[#1C1A1A]">
        {/* 1. Slack Webhook Integration */}
        <div className="p-4 bg-[#242222] border border-[#373333] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs">
                #
              </div>
              <span className="text-xs font-bold text-white">Slack Incoming Webhook</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-[#3E3838] bg-[#1C1A1A] text-[#E5E7EB]">
              Channel: #marketing-fleet
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={slackUrl}
              onChange={e => setSlackUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="bg-[#1C1A1A] border-[#373333] text-xs font-mono text-white flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestSlack}
              disabled={slackTesting}
              className="border-[#373333] bg-[#2A2828] text-xs font-semibold text-white hover:bg-[#333030] shrink-0 cursor-pointer"
            >
              {slackTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Pinging Slack...
                </>
              ) : slackSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Slack Alert Delivered!
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Test Slack Ping
                </>
              )}
            </Button>
          </div>

          <p className="text-[11px] text-[#E5E7EB]">
            Triggers rich Slack cards when new deliverables are queued for approval or sprint milestones finish.
          </p>
        </div>

        {/* 2. WhatsApp Business Notifications */}
        <div className="p-4 bg-[#242222] border border-[#373333] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#25D366] text-white flex items-center justify-center font-bold text-xs">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">WhatsApp Founder VIP Alerts</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-[#3E3838] bg-[#1C1A1A] text-[#25D366]">
              End-to-End Encrypted
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="bg-[#1C1A1A] border-[#373333] text-xs font-mono text-white flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestWhatsApp}
              disabled={whatsappTesting}
              className="border-[#373333] bg-[#2A2828] text-xs font-semibold text-white hover:bg-[#333030] shrink-0 cursor-pointer"
            >
              {whatsappTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Pinging WhatsApp...
                </>
              ) : whatsappSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-white" />
                  WhatsApp Sent!
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5 text-[#25D366]" />
                  Test WhatsApp Ping
                </>
              )}
            </Button>
          </div>

          <p className="text-[11px] text-[#E5E7EB]">
            Instant WhatsApp pings for urgent high-risk approvals (&gt;₹25,000 ad spend or core messaging shifts).
          </p>
        </div>

        {/* 3. Executive Email Growth Intelligence */}
        <div className="p-4 bg-[#242222] border border-[#373333] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#8F0028] text-white flex items-center justify-center font-bold text-xs">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">Executive Email Growth Digest</span>
            </div>
            <div className="flex bg-[#1C1A1A] border border-[#373333] rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setDigestFreq('daily')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${digestFreq === 'daily' ? 'bg-[#8F0028] text-white' : 'text-[#E5E7EB]'}`}
              >
                Daily 9 AM
              </button>
              <button
                type="button"
                onClick={() => setDigestFreq('weekly')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${digestFreq === 'weekly' ? 'bg-[#8F0028] text-white' : 'text-[#E5E7EB]'}`}
              >
                Weekly Mon
              </button>
            </div>
          </div>

          <Input
            value={executiveEmail}
            onChange={e => setExecutiveEmail(e.target.value)}
            placeholder="founder@company.com"
            className="bg-[#1C1A1A] border-[#373333] text-xs text-white"
          />

          <p className="text-[11px] text-[#E5E7EB]">
            Delivers a high-level summary of pipeline attributed, CAC trajectory, and top agent sprint wins.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
