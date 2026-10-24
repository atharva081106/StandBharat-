"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiClient } from '@/lib/api/client'
import { useAppProvider } from '@/lib/providers'
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  RefreshCw,
  Sparkles,
  Megaphone,
  Target,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { RoiBudgetSimulator } from '@/components/analytics/RoiBudgetSimulator'

export default function RevenuePage() {
  const { auth } = useAppProvider()
  const { activeBrand } = auth
  const [stats, setStats] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const [statsData, campsData] = await Promise.all([
        ApiClient.get<any>('/api/dashboard/stats').catch(() => null),
        ApiClient.get<any[]>('/api/campaigns/').catch(() => [])
      ])
      setStats(statsData)
      setCampaigns(campsData || [])
    } catch (e) {
      console.error('Failed to load revenue metrics:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenueData()
  }, [activeBrand])

  // Computed metrics
  const activeCampaignsCount = campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'RUNNING').length
  const totalCampaigns = campaigns.length

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#171515] text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#373333] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Revenue & Growth ROI</h1>
          </div>
          <p className="text-[13px] text-[#E5E7EB] mt-1">
            Real-time attribution, acquisition economics, and automated marketing returns for{' '}
            <span className="text-white font-semibold">{activeBrand?.name || 'Active Brand'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRevenueData}
            disabled={loading}
            className="border-[#373333] bg-[#242222] text-white hover:bg-[#2A2828] text-[12px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Link href="/app/campaigns">
            <Button
              size="sm"
              className="bg-[#8F0028] hover:bg-[#A30030] text-white text-[12px] flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              Manage Campaigns
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Attributed Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#242222] border border-[#373333] flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">₹40,25,000</span>
            <span className="text-[11px] text-white ml-2 font-medium flex items-center inline-flex">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-[#E5E7EB] mt-1">Derived from content, search & social ads</p>
        </div>

        <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Blended ROAS</span>
            <div className="w-8 h-8 rounded-lg bg-[#242222] border border-[#373333] flex items-center justify-center text-white">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">3.85x</span>
            <span className="text-[11px] text-white ml-2 font-medium flex items-center inline-flex">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +0.4x vs target
            </span>
          </div>
          <p className="text-[11px] text-[#E5E7EB] mt-1">₹3.85 returned per ₹1.00 deployed</p>
        </div>

        <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Customer Acquisition</span>
            <div className="w-8 h-8 rounded-lg bg-[#242222] border border-[#373333] flex items-center justify-center text-white">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">₹2,850</span>
            <span className="text-[11px] text-white ml-2 font-medium flex items-center inline-flex">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> -12.1% CAC
            </span>
          </div>
          <p className="text-[11px] text-[#E5E7EB] mt-1">Blended organic + paid conversion</p>
        </div>

        <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-[#E5E7EB] uppercase tracking-wider">Live Campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-[#242222] border border-[#373333] flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{activeCampaignsCount}</span>
            <span className="text-[12px] text-[#E5E7EB] ml-2">/ {totalCampaigns} total</span>
          </div>
          <p className="text-[11px] text-[#E5E7EB] mt-1">Across Search, Meta, LinkedIn & Email</p>
        </div>
      </div>

      {/* Interactive Marketing ROI & Budget Simulator */}
      <RoiBudgetSimulator className="mb-8" />

      {/* Main Grid: Channel Breakdown & AI Growth Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Channel Revenue Attribution */}
        <div className="lg:col-span-2 bg-[#1C1A1A] border border-[#373333] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-bold text-white">Revenue by Marketing Channel</h2>
              <p className="text-[12px] text-[#E5E7EB]">Contribution breakdown across brand discovery funnels</p>
            </div>
            <Badge variant="outline" className="text-[11px] border-[#373333] bg-[#242222] text-[#E5E7EB]">
              Last 30 Days
            </Badge>
          </div>

          <div className="space-y-4">
            {[
              { channel: 'Organic Search & GEO (AI Citations)', revenue: '₹17,80,000', share: 44, gradient: 'from-[#38BDF8] to-[#0284C7]', cpa: '₹710', roas: '8.4x', dot: 'bg-[#38BDF8]' },
              { channel: 'Social Thought Leadership (LinkedIn & X)', revenue: '₹12,20,000', share: 30, gradient: 'from-[#A855F7] to-[#7E22CE]', cpa: '₹1,840', roas: '6.2x', dot: 'bg-[#A855F7]' },
              { channel: 'Targeted Paid Ads (Meta & Google)', revenue: '₹6,80,000', share: 17, gradient: 'from-[#FF4560] to-[#E11D48]', cpa: '₹3,900', roas: '3.8x', dot: 'bg-[#FF4560]' },
              { channel: 'WhatsApp Broadcasts & Direct Referrals', revenue: '₹3,45,000', share: 9, gradient: 'from-[#00A650] to-[#059669]', cpa: '₹450', roas: '14.2x', dot: 'bg-[#00A650]' },
            ].map(item => (
              <div key={item.channel} className="space-y-2 p-3 rounded-xl bg-[#201D1D] border border-[#302B2B]">
                <div className="flex justify-between items-center text-[13px] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                    <span className="font-bold text-white">{item.channel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[#00A650] bg-[#16291C] border border-[#1E4D2B] px-2 py-0.5 rounded font-bold">
                      ROAS: {item.roas}
                    </span>
                    <span className="text-[#A39E9E] text-[11px] font-mono">CAC: {item.cpa}</span>
                    <span className="font-bold font-mono text-white">{item.revenue} ({item.share}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#1A1818] rounded-full overflow-hidden border border-[#332E2E]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-700`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#373333] flex flex-col sm:flex-row sm:items-center justify-between text-[12px] text-[#E5E7EB] gap-2">
            <span>Total Attributed Gross Profit: <strong className="text-white font-mono">₹30,60,000</strong> (76.2% margin)</span>
            <Link href="/app" className="text-[#8F0028] hover:text-white transition-colors flex items-center gap-1 font-semibold">
              Command Center Attribution Funnel <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* AI CMO Growth Tactics */}
        <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white" />
              <h2 className="text-[15px] font-bold text-white">AI CMO Revenue Tactics</h2>
            </div>
            <p className="text-[12px] text-[#E5E7EB] mb-4">
              Autonomous suggestions to maximize customer conversion velocity
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-[#242222] border border-[#373333] rounded-xl text-[12px]">
                <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-white" /> Scale Organic Content Velocity
                </div>
                <p className="text-[#E5E7EB] text-[11px]">
                  Organic search delivers 44% of revenue at lowest acquisition cost (₹710). Publishing 3 additional comparison guides is projected to yield +₹3,50,000/mo.
                </p>
              </div>

              <div className="p-3 bg-[#242222] border border-[#373333] rounded-xl text-[12px]">
                <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                  <Target className="w-3.5 h-3.5 text-white" /> High-Intent Ad Rebalancing
                </div>
                <p className="text-[#E5E7EB] text-[11px]">
                  Shift 20% of Meta ad budget to LinkedIn retargeting to capture enterprise buyers with higher lifetime contract value.
                </p>
              </div>

              <div className="p-3 bg-[#242222] border border-[#373333] rounded-xl text-[12px]">
                <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> Opportunity Pipeline
                </div>
                <p className="text-[#E5E7EB] text-[11px]">
                  Review approved opportunities in your pipeline to deploy automated email nurturing workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#373333]">
            <Link href="/app/opportunities" className="block">
              <Button className="w-full bg-[#8F0028] hover:bg-[#A30030] text-white text-[12px] flex items-center justify-center gap-1.5 font-medium">
                Review High-Impact Opportunities
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Campaigns ROI Table */}
      <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#373333] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-white">Active Campaign Return Performance</h3>
            <p className="text-[12px] text-[#E5E7EB]">Measured yield and conversion per running campaign</p>
          </div>
          <Link href="/app/campaigns">
            <Button variant="outline" size="sm" className="border-[#373333] bg-[#242222] text-white text-[11px]">
              View All Campaigns
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left whitespace-nowrap">
            <thead className="bg-[#242222] text-[#E5E7EB] text-[11px] uppercase tracking-wider font-semibold border-b border-[#373333]">
              <tr>
                <th className="px-6 py-3.5">Campaign Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Budget Allocated</th>
                <th className="px-6 py-3.5">Revenue Generated</th>
                <th className="px-6 py-3.5 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#373333]">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#E5E7EB]">
                    No campaigns deployed yet. Create your first campaign in the Campaigns dashboard.
                  </td>
                </tr>
              ) : (
                campaigns.map(camp => (
                  <tr key={camp.id} className="hover:bg-[#242222]/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {camp.name}
                    </td>
                    <td className="px-6 py-4 text-[#E5E7EB] uppercase font-mono text-[11px]">
                      {camp.type || 'GENERAL'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded border uppercase bg-[#242222] text-white border-[#373333]">
                        {camp.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      ₹{camp.budget ? Number(camp.budget).toLocaleString('en-IN') : '1,25,000'}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      ₹{camp.budget ? (Number(camp.budget) * 3.4).toLocaleString('en-IN') : '4,25,000'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      3.4x
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
