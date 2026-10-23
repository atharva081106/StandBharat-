'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppProvider } from '@/lib/providers'
import { ApiClient } from '@/lib/api/client'
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  Globe, 
  Share2, 
  Calendar, 
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { PlatformLogo } from '@/components/icons/PlatformLogos'

export default function Content() {
  const { auth } = useAppProvider()
  const { activeBrand } = auth
  const [drafts, setDrafts] = useState<any[]>([])
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!activeBrand) return
    setLoading(true)
    try {
      const [draftsData, pubsData] = await Promise.all([
        ApiClient.get<any[]>('/api/content/drafts'),
        ApiClient.get<any[]>('/api/publications')
      ])
      setDrafts(draftsData || [])
      setPublications(pubsData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeBrand])

  const mergedContent = drafts.map(draft => {
    const pub = publications.find(p => p.content_draft_id === draft.id)
    return {
      ...draft,
      status: pub ? pub.status : (draft.status || 'DRAFT'),
      platform: pub ? pub.platform : null,
      error_message: pub ? pub.error_message : null,
      published_at: pub ? pub.published_at : null
    }
  })

  const publishedCount = mergedContent.filter(c => c.status === 'PUBLISHED').length
  const draftCount = mergedContent.filter(c => c.status === 'DRAFT' || c.status === 'PENDING').length

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return <Badge className="bg-[#242222] text-white border border-[#373333] text-[10px] uppercase font-bold">Published</Badge>
      case 'FAILED':
        return <Badge className="bg-[#242222] text-white border border-[#373333] text-[10px] uppercase font-bold">Failed</Badge>
      case 'DRAFT':
      case 'PENDING':
        return <Badge className="bg-[#242222] text-white border border-[#373333] text-[10px] uppercase font-bold">Draft / Review</Badge>
      default:
        return <Badge variant="outline" className="text-[#E5E7EB] border-[#373333] text-[10px] uppercase">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 bg-[#171515] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#373333] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Content Studio
            </h1>
            <Badge variant="outline" className="bg-[#242222] border-[#373333] text-[#E5E7EB] text-xs">
              {mergedContent.length} Assets
            </Badge>
          </div>
          <p className="text-[#E5E7EB] text-sm sm:text-base mt-1">
            All AI-generated brand campaigns, blog articles, and social posts in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
            className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/app/approvals">
            <Button 
              variant="outline"
              size="sm"
              className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222]"
            >
              Approval Queue
            </Button>
          </Link>
          <Button 
            size="sm"
            className="bg-[#8F0028] hover:bg-[#A8002F] text-white flex items-center gap-1.5 font-bold shadow-md shadow-[#8F0028]/20"
          >
            <Plus className="w-4 h-4" />
            + New Content
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1C1A1A] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Total Content Pieces</span>
          <span className="text-[22px] font-bold text-white">{mergedContent.length}</span>
        </div>
        <div className="bg-[#1C1A1A] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Live / Published</span>
          <span className="text-[22px] font-bold text-white">{publishedCount}</span>
        </div>
        <div className="bg-[#1C1A1A] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">In Review / Draft</span>
          <span className="text-[22px] font-bold text-white">{draftCount}</span>
        </div>
        <div className="bg-[#1C1A1A] border border-[#373333] rounded-xl p-4">
          <span className="block text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-1">Channels Monitored</span>
          <span className="text-[22px] font-bold text-white">LinkedIn, X, Blog</span>
        </div>
      </div>
      
      {/* Content Table Card */}
      <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
            <thead className="bg-[#242222] text-[#E5E7EB] border-b border-[#373333] text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Title & Context</th>
                <th className="px-6 py-4">Content Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Target Channel</th>
                <th className="px-6 py-4 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#373333]">
              {mergedContent.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => { window.location.href = `/app/content/${item.id}` }}
                  className="hover:bg-[#201E1E] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-white group-hover:text-white transition-colors">
                      {item.title}
                    </div>
                    {item.body && (
                      <p className="text-[11px] text-[#E5E7EB] truncate max-w-md mt-0.5">
                        {item.body}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PlatformLogo platform={item.content_type || 'blog'} className="w-4 h-4 shrink-0" />
                      <span className="text-white capitalize font-medium">{item.content_type || 'Article'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                    {item.status === 'FAILED' && <div className="text-xs text-white mt-1">{item.error_message}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PlatformLogo platform={item.platform || item.content_type || 'linkedin'} className="w-4 h-4 shrink-0" />
                      <span className="text-[#E5E7EB] capitalize font-medium">{item.platform || 'Multi-Channel'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[#E5E7EB]">
                    {new Date(item.updated_at).toLocaleDateString()}
                    {item.published_at && (
                      <div className="text-[10px] text-white">
                        Published: {new Date(item.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && mergedContent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#242222] border border-[#373333] flex items-center justify-center text-[#E5E7EB]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold text-base">No Content Pieces Created Yet</p>
              <p className="text-xs text-[#E5E7EB] mt-1 max-w-sm">
                Generate high-converting blog posts, LinkedIn insights, or Twitter/X hooks with the Content Writer Agent.
              </p>
            </div>
            <Link href="/app/agents">
              <Button className="mt-2 bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold rounded-xl">
                Open Content Writer Agent
              </Button>
            </Link>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-[#373333] border-t-[#8F0028] animate-spin"></span>
              <span className="text-xs font-semibold">Loading Content Studio...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
