"use client"
import React, { useState, useEffect } from 'react'
import { useBrandBrain, useAuth } from '@/lib/providers/MockProvider'
import { ApiClient } from '@/lib/api/client'
import { 
  Plus, Loader2, ExternalLink, Sparkles, Trash2, Globe, 
  Swords, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react'
import { CompetitorLogo } from '@/components/competitors/CompetitorLogo'

interface CompetitorsPanelProps {
  selectedCompetitorName?: string | null;
}

export function CompetitorsPanel({ selectedCompetitorName }: CompetitorsPanelProps) {
  const { brandBrain, refresh } = useBrandBrain()
  const { activeBrand } = useAuth()
  const [competitors, setCompetitors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [form, setForm] = useState({
    name: '',
    website_url: '',
    positioning: '',
    strengths: '',
    weaknesses: '',
    description: ''
  })

  const loadCompetitors = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get<any[]>('/api/brand-brain/competitors')
      if (Array.isArray(data) && data.length > 0) {
        setCompetitors(data)
      } else if (brandBrain?.competitors && brandBrain.competitors.length > 0) {
        setCompetitors(brandBrain.competitors)
      } else {
        setCompetitors([])
      }
    } catch (e) {
      if (brandBrain?.competitors) {
        setCompetitors(brandBrain.competitors)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompetitors()
  }, [activeBrand?.id, brandBrain?.competitors])

  const handleAutoDiscover = async () => {
    setDiscovering(true)
    setStatusMessage(null)
    try {
      const discovered = await ApiClient.post<any[]>('/api/brand-brain/competitors/auto-discover', {})
      if (Array.isArray(discovered) && discovered.length > 0) {
        setCompetitors(discovered)
        setStatusMessage({ text: `Successfully discovered and analyzed ${discovered.length} real competitors!`, type: 'success' })
        refresh()
      } else {
        await loadCompetitors()
        setStatusMessage({ text: 'Competitors refreshed from database.', type: 'success' })
      }
    } catch (err: any) {
      console.error('Auto-discovery failed:', err)
      setStatusMessage({ text: err.message || 'Auto-discovery encountered an issue', type: 'error' })
    } finally {
      setDiscovering(false)
      setTimeout(() => setStatusMessage(null), 5000)
    }
  }

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    try {
      const created = await ApiClient.post<any>('/api/brand-brain/competitors', {
        name: form.name.trim(),
        website_url: form.website_url.trim() || null,
        positioning: form.positioning.trim() || null,
        strengths: form.strengths.trim() || null,
        weaknesses: form.weaknesses.trim() || null,
        description: form.description.trim() || null
      })

      setCompetitors(prev => [...prev.filter(c => c.name !== created.name), created])
      setShowAddModal(false)
      setForm({ name: '', website_url: '', positioning: '', strengths: '', weaknesses: '', description: '' })
      setStatusMessage({ text: `Competitor "${created.name}" added successfully!`, type: 'success' })
      refresh()
    } catch (err: any) {
      alert('Failed to add competitor: ' + (err.message || 'Error occurred'))
    } finally {
      setSaving(false)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  const handleDeleteCompetitor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return

    setDeletingId(id)
    try {
      await ApiClient.delete(`/api/brand-brain/competitors/${id}`)
      setCompetitors(prev => prev.filter(c => c.id !== id))
      setStatusMessage({ text: `Removed ${name}`, type: 'success' })
      refresh()
    } catch (err: any) {
      alert('Failed to delete competitor: ' + err.message)
    } finally {
      setDeletingId(null)
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1C1A1A] p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#373333]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-white">Competitor Landscape</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#2A2828] text-[#E5E7EB] border border-[#373333]">
              {competitors.length} Active
            </span>
          </div>
          <p className="text-[13px] text-[#E5E7EB] mt-1">
            Track market rivals, detect messaging vulnerabilities, and inform battlecard intelligence for {activeBrand?.name || 'your brand'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoDiscover}
            disabled={discovering}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#2A2828] hover:bg-[#333030] border border-[#373333] hover:border-[#8F0028]/50 text-white rounded-lg text-[13px] font-bold transition-all shadow-sm"
          >
            {discovering ? <Loader2 className="w-4 h-4 animate-spin text-[#8F0028]" /> : <Sparkles className="w-4 h-4 text-[#8F0028]" />}
            <span>{discovering ? 'Identifying Rivals...' : 'Auto-Discover with AI'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor</span>
          </button>
        </div>
      </div>

      {/* Alert / Notification */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl text-[13px] flex items-center gap-3 border ${
          statusMessage.type === 'success' 
            ? 'bg-[#00A650]/10 border-[#00A650]/30 text-white' 
            : 'bg-[#8F0028]/10 border-[#8F0028]/30 text-white'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> : <AlertCircle className="w-4 h-4 text-[#8F0028] shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && competitors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-[#8F0028] animate-spin mb-3" />
          <p className="text-[13px] text-[#E5E7EB]">Loading verified competitors from PostgreSQL...</p>
        </div>
      ) : competitors.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-[#373333] rounded-2xl bg-[#242222]/40">
          <div className="w-12 h-12 rounded-full bg-[#8F0028]/10 text-[#8F0028] flex items-center justify-center mb-4">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-bold text-white mb-2">No Competitors Tracked Yet</h3>
          <p className="text-[13px] text-[#E5E7EB] max-w-md mb-6">
            Identify market rivals automatically using AI domain scanning or manually add your key competitors.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoDiscover}
              disabled={discovering}
              className="flex items-center gap-2 px-4 py-2 bg-[#8F0028] hover:bg-[#A8002F] text-white rounded-lg text-[13px] font-bold transition-colors"
            >
              {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Auto-Discover Rivals
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2A2828] hover:bg-[#333030] text-white border border-[#373333] rounded-lg text-[13px] font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        /* Competitors Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((comp: any, index: number) => {
            const isTargeted = selectedCompetitorName && (
              comp.name?.toLowerCase().includes(selectedCompetitorName.toLowerCase()) ||
              selectedCompetitorName.toLowerCase().includes(comp.name?.toLowerCase())
            )

            return (
              <div 
                key={comp.id || index}
                className={`p-5 rounded-xl border transition-all ${
                  isTargeted 
                    ? 'bg-[#2A2424] border-[#8F0028] ring-1 ring-[#8F0028]' 
                    : 'bg-[#242222] border-[#373333] hover:border-[#4A4545]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <CompetitorLogo 
                      name={comp.name} 
                      websiteUrl={comp.website_url} 
                      className="w-9 h-9" 
                      size={36} 
                    />
                    <div>
                      <h4 className="text-[15px] font-bold text-white flex items-center gap-2">
                        {comp.name}
                        {isTargeted && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#8F0028] text-white">
                            Selected
                          </span>
                        )}
                      </h4>
                      {comp.website_url && (
                        <a
                          href={comp.website_url.startsWith('http') ? comp.website_url : `https://${comp.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-[#E5E7EB] hover:text-white flex items-center gap-1 transition-colors mt-0.5"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{comp.website_url.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {comp.id && (
                    <button
                      onClick={() => handleDeleteCompetitor(comp.id, comp.name)}
                      disabled={deletingId === comp.id}
                      className="p-1.5 text-[#E5E7EB] hover:text-white hover:bg-[#8F0028]/10 rounded-md transition-colors"
                      title="Remove competitor"
                    >
                      {deletingId === comp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {comp.positioning && (
                  <div className="mb-3 p-2.5 bg-[#1C1A1A] border border-[#373333] rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5E7EB] block mb-1">Market Positioning</span>
                    <p className="text-[12px] text-white leading-relaxed">{comp.positioning}</p>
                  </div>
                )}

                <div className="space-y-2 text-[12px]">
                  {comp.strengths && (
                    <div className="flex items-start gap-2">
                      <span className="text-white font-bold text-[11px] uppercase tracking-wider shrink-0 mt-0.5">Strengths:</span>
                      <span className="text-[#E5E7EB] leading-snug">{comp.strengths}</span>
                    </div>
                  )}

                  {comp.weaknesses && (
                    <div className="flex items-start gap-2">
                      <span className="text-white font-bold text-[11px] uppercase tracking-wider shrink-0 mt-0.5">Vulnerabilities:</span>
                      <span className="text-[#E5E7EB] leading-snug">{comp.weaknesses}</span>
                    </div>
                  )}

                  {comp.description && (
                    <div className="mt-2 pt-2 border-t border-[#373333] text-[11px] text-[#E5E7EB] italic">
                      {comp.description}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#373333] pb-3">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#8F0028]" />
                Add Competitor Profile
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#E5E7EB] hover:text-white text-[16px] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                    Competitor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Planet Labs / Sentinel Hub"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#242222] border border-[#373333] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. planet.com"
                    value={form.website_url}
                    onChange={e => setForm({ ...form, website_url: e.target.value })}
                    className="w-full bg-[#242222] border border-[#373333] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                  Market Positioning
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise high-cadence satellite constellation"
                  value={form.positioning}
                  onChange={e => setForm({ ...form, positioning: e.target.value })}
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white mb-1">
                  Core Strengths
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Daily revisit rates, massive global imagery catalog"
                  value={form.strengths}
                  onChange={e => setForm({ ...form, strengths: e.target.value })}
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg p-2.5 text-[12px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white mb-1">
                  Weaknesses / Market Gaps
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prohibitive pricing for SMBs, no natural language query API"
                  value={form.weaknesses}
                  onChange={e => setForm({ ...form, weaknesses: e.target.value })}
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg p-2.5 text-[12px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                  Battlecard Notes & Counter-Tactics
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pitch instant automated NDVI band computation vs manual pipeline setup"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg p-2.5 text-[12px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#373333]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222] rounded-lg text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#8F0028] hover:bg-[#A8002F] disabled:bg-[#8F0028]/50 text-white rounded-lg text-[13px] font-bold transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Add Competitor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
