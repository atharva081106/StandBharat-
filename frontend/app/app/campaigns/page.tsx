"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/providers/MockProvider'
import { 
  Briefcase, Plus, RefreshCw, AlertCircle, Calendar, 
  DollarSign, TrendingUp, CheckCircle2, Clock, Play, Pause, BarChart3, ArrowRight
} from 'lucide-react'
import { RoiBudgetSimulator } from '@/components/analytics/RoiBudgetSimulator'
import { FestiveCampaignEngine } from '@/components/campaigns/FestiveCampaignEngine'
import { WhatsAppStudio } from '@/components/campaigns/WhatsAppStudio'

interface Campaign {
  id: string
  workspace_id: string
  brand_id: string
  name: string
  description?: string | null
  status: string
  budget?: number | null
  spent?: number | null
  start_date?: string | null
  end_date?: string | null
}

export default function CampaignsPage() {
  const { activeBrand } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'campaigns' | 'festive' | 'whatsapp' | 'simulator'>('campaigns')
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: 50000,
    status: 'ACTIVE'
  })

  const fetchCampaigns = async () => {
    if (!activeBrand) return
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.get<Campaign[]>('/api/campaigns/')
      setCampaigns(data || [])
    } catch (err: any) {
      console.error('Failed to load campaigns:', err)
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [activeBrand?.id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    try {
      await ApiClient.post('/api/campaigns/', form)
      setShowModal(false)
      setForm({ name: '', description: '', budget: 50000, status: 'ACTIVE' })
      await fetchCampaigns()
    } catch (err: any) {
      alert('Failed to create campaign: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge className="bg-[#00A650]/20 text-white border border-[#00A650]/30 text-[10px] uppercase">Active</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-500/20 text-white border border-blue-500/30 text-[10px] uppercase">Completed</Badge>
      case 'PAUSED':
        return <Badge className="bg-amber-500/20 text-white border border-amber-500/30 text-[10px] uppercase">Paused</Badge>
      default:
        return <Badge variant="outline" className="text-[#E5E7EB] border-[#373333] text-[10px] uppercase">Draft</Badge>
    }
  }

  // Summary Metrics
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0)
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0)
  const activeCount = campaigns.filter(c => c.status?.toUpperCase() === 'ACTIVE').length

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#373333] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Marketing Campaigns</h1>
            <Badge variant="outline" className="bg-[#242222] border-[#373333] text-[#E5E7EB] text-xs">
              {campaigns.length} Total
            </Badge>
          </div>
          <p className="text-[#E5E7EB] text-sm mt-1">
            Manage your brand's growth initiatives, budget allocation, and multi-channel marketing campaigns.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCampaigns} 
            disabled={loading}
            className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowModal(true)}
            className="bg-[#8F0028] hover:bg-[#A8002F] text-white flex items-center gap-1.5 font-bold shadow-md shadow-[#8F0028]/20"
          >
            <Plus className="w-4 h-4" />
            + New Campaign
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#242222] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Active Campaigns</span>
          <span className="text-[22px] font-bold text-white">{activeCount}</span>
        </div>
        <div className="bg-[#242222] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Total Allocated Budget</span>
          <span className="text-[22px] font-bold text-white">₹{totalBudget.toLocaleString()}</span>
        </div>
        <div className="bg-[#242222] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Total Spend Logged</span>
          <span className="text-[22px] font-bold text-[#8F0028]">₹{totalSpent.toLocaleString()}</span>
        </div>
        <div className="bg-[#242222] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Budget Utilization</span>
          <span className="text-[22px] font-bold text-white">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#373333] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'campaigns'
              ? 'bg-[#8F0028] text-white shadow-md'
              : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Active Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('festive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'festive'
              ? 'bg-[#8F0028] text-white shadow-md'
              : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
          }`}
        >
          <span>🪔</span>
          Festive Bharat Engine
          <span className="px-1.5 py-0.2 bg-[#242222] text-[#00A650] rounded text-[10px] font-bold">
            Diwali Peak
          </span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'whatsapp'
              ? 'bg-[#8F0028] text-white shadow-md'
              : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
          }`}
        >
          <span>💬</span>
          WhatsApp Broadcast Studio
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-[#8F0028] text-white shadow-md'
              : 'text-[#E5E7EB] hover:text-white hover:bg-[#242222]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Predictive ROI Simulator
        </button>
      </div>

      {/* Tab: Festive Engine */}
      {activeTab === 'festive' && (
        <FestiveCampaignEngine onSprintLaunched={fetchCampaigns} />
      )}

      {/* Tab: WhatsApp Studio */}
      {activeTab === 'whatsapp' && (
        <WhatsAppStudio />
      )}

      {/* Tab: ROI Simulator */}
      {activeTab === 'simulator' && (
        <RoiBudgetSimulator />
      )}

      {/* Tab: Campaigns List */}
      {activeTab === 'campaigns' && (
        <>
          {/* Error state */}
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchCampaigns} className="border-red-800 text-red-300">
                Retry
              </Button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="p-16 text-center text-[#E5E7EB] space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#8F0028] border-t-transparent animate-spin mx-auto"></div>
              <p className="text-sm">Loading campaigns from PostgreSQL...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && campaigns.length === 0 && (
            <div className="p-16 border border-dashed border-[#373333] rounded-2xl bg-[#1C1A1A] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#8F0028]/10 text-[#8F0028] flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white">No Campaigns Created Yet</h3>
                <p className="text-xs text-[#E5E7EB] mt-1">
                  Start by launching an Indian festive sprint or creating your first custom marketing campaign.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button 
                  onClick={() => setActiveTab('festive')}
                  className="bg-[#00A650] hover:bg-[#008f45] text-white text-xs font-semibold"
                >
                  Launch Festive Sprint 🪔
                </Button>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-semibold"
                >
                  + Create Custom Campaign
                </Button>
              </div>
            </div>
          )}

          {/* Campaigns Grid */}
          {!loading && campaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(camp => (
                <Card key={camp.id} className="bg-[#1C1A1A] border-[#373333] hover:border-[#4A4545] transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b border-[#373333]">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base text-white font-bold line-clamp-1">
                        {camp.name}
                      </CardTitle>
                      {getStatusBadge(camp.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#E5E7EB] leading-relaxed line-clamp-3">
                      {camp.description || 'No detailed description provided for this campaign.'}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#373333] text-xs">
                      <div className="flex justify-between items-center text-[#E5E7EB]">
                        <span>Budget:</span>
                        <span className="font-semibold text-white">₹{(camp.budget || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#E5E7EB]">
                        <span>Spend:</span>
                        <span className="font-semibold text-[#8F0028]">₹{(camp.spent || 0).toLocaleString()}</span>
                      </div>
                      {camp.budget ? (
                        <div className="w-full bg-[#242222] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#00A650] h-full rounded-full" 
                            style={{ width: `${Math.min(100, Math.round(((camp.spent || 0) / camp.budget) * 100))}%` }}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="pt-3 border-t border-[#373333] flex justify-end">
                      <Link 
                        href={`/app/campaigns/${camp.id}`} 
                        className="text-xs font-semibold text-white hover:underline inline-flex items-center gap-1 group"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-[#373333] pb-3">
              <h2 className="text-lg font-bold text-white">Launch New Campaign</h2>
              <button onClick={() => setShowModal(false)} className="text-[#E5E7EB] hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#E5E7EB] uppercase tracking-wider mb-1">Campaign Name</label>
                <Input 
                  required
                  placeholder="e.g. Q4 Organic SEO & Authority Sprint"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="bg-[#242222] border-[#373333] text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E5E7EB] uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Campaign objectives, target audience, and key deliverables..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg p-2.5 text-sm text-white placeholder:text-[#E5E7EB] focus:outline-none focus:border-[#8F0028]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] uppercase tracking-wider mb-1">Budget (₹)</label>
                  <Input 
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
                    className="bg-[#242222] border-[#373333] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] uppercase tracking-wider mb-1">Initial Status</label>
                  <select 
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#242222] border border-[#373333] rounded-lg p-2 text-sm text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#373333]">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-[#373333] text-[#E5E7EB]">
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="bg-[#8F0028] hover:bg-[#A8002F] text-white">
                  {creating ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
