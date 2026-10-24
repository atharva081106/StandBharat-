import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Megaphone, Calendar, DollarSign, Target, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

export default async function CampaignDetail({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const campaignId = resolvedParams?.id || 'campaign'

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto w-full custom-scrollbar bg-[#171515] text-white">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-28">
        
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center gap-2 text-xs text-[#E5E7EB]">
          <Link 
            href="/app/campaigns" 
            className="inline-flex items-center gap-1.5 text-white hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Campaigns</span>
          </Link>
          <span>/</span>
          <span className="text-white font-mono truncate max-w-xs">{campaignId}</span>
        </div>

        {/* Campaign Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#373333] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020] border border-[#9E0028] flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Campaign Details</h1>
              <p className="text-xs text-[#E5E7EB] mt-0.5 font-mono">ID: {campaignId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/app/content"
              className="px-3.5 py-1.5 rounded-lg bg-[#242222] border border-[#373333] text-xs font-semibold text-white hover:bg-[#2E2B2B] flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Draft Content</span>
            </Link>
            <Link 
              href="/app/calendar"
              className="px-3.5 py-1.5 rounded-lg bg-[#800020] hover:bg-[#990026] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>View in Calendar</span>
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="bg-[#1C1A1A] border-[#373333] md:col-span-2">
            <CardHeader className="border-b border-[#373333] pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00A650]" />
                Performance & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-[#E5E7EB] leading-relaxed">
                Autonomous multi-agent execution pipeline. Real-time telemetry will reflect attributable conversions, ROAS, and channel distribution as events fire.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#242222] border border-[#373333]">
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Delivery Status</span>
                  <span className="text-xs font-bold text-[#00A650] mt-1 inline-block">Active Tracking</span>
                </div>
                <div className="p-3 rounded-lg bg-[#242222] border border-[#373333]">
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Channels</span>
                  <span className="text-xs font-bold text-white mt-1 inline-block">Multi-Channel</span>
                </div>
                <div className="p-3 rounded-lg bg-[#242222] border border-[#373333]">
                  <span className="text-[10px] uppercase font-bold text-[#E5E7EB] block">Attribution</span>
                  <span className="text-xs font-bold text-white mt-1 inline-block">First & Last Touch</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1A1A] border-[#373333]">
            <CardHeader className="border-b border-[#373333] pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              <Link 
                href="/app/approvals"
                className="p-2.5 rounded-lg bg-[#242222] border border-[#373333] hover:border-[#800020] text-xs font-medium text-white flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Approvals Queue</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#E5E7EB]" />
              </Link>

              <Link 
                href="/app/analytics"
                className="p-2.5 rounded-lg bg-[#242222] border border-[#373333] hover:border-[#800020] text-xs font-medium text-white flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-white" />
                  <span>Website Analytics</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#E5E7EB]" />
              </Link>

              <Link 
                href="/app/revenue"
                className="p-2.5 rounded-lg bg-[#242222] border border-[#373333] hover:border-[#800020] text-xs font-medium text-white flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-white" />
                  <span>Revenue & Attribution</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#E5E7EB]" />
              </Link>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
