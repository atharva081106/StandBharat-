"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiClient } from '@/lib/api/client'
import { useAppProvider } from '@/lib/providers'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  FileText,
  ChevronRight,
  Filter,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import { PlatformLogo } from '@/components/icons/PlatformLogos'

interface ApprovalItem {
  id: string
  content_project_id: string
  content_draft_id: string
  workspace_id: string
  brand_id: string
  requested_by: string
  reviewed_by?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
  review_comment?: string | null
  created_at: string
  reviewed_at?: string | null
  draft_title?: string | null
  draft_type?: string | null
  draft_body?: string | null
  project_title?: string | null
}

export default function ApprovalsPage() {
  const { auth } = useAppProvider()
  const { activeBrand } = auth
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchApprovals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = statusFilter === 'ALL' ? '/api/approvals' : `/api/approvals?status=${statusFilter}`
      const data = await ApiClient.get<ApprovalItem[]>(endpoint)
      setItems(data || [])
    } catch (err: any) {
      console.error('Failed to fetch approvals:', err)
      setError(err.message || 'Failed to load approvals from the backend.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals, activeBrand])

  const handleApprove = async (id: string) => {
    setActionLoadingId(id)
    setFeedbackMessage(null)
    try {
      await ApiClient.post(`/api/approvals/${id}/approve`, {})
      setFeedbackMessage({ type: 'success', text: 'Approval recorded: Content is now APPROVED for publishing.' })
      await fetchApprovals()
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to approve content.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoadingId(id)
    setFeedbackMessage(null)
    try {
      await ApiClient.post(`/api/approvals/${id}/reject`, {
        review_comment: rejectComment.trim() || 'Rejected during review.'
      })
      setFeedbackMessage({ type: 'success', text: 'Content marked as REJECTED.' })
      setRejectingId(null)
      setRejectComment('')
      await fetchApprovals()
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to reject content.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-[#242222] text-white border border-[#373333] flex items-center gap-1.5 py-1 px-2.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge className="bg-[#242222] text-white border border-[#373333] flex items-center gap-1.5 py-1 px-2.5 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        )
      case 'CHANGES_REQUESTED':
        return (
          <Badge className="bg-[#242222] text-white border border-[#373333] flex items-center gap-1.5 py-1 px-2.5 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" /> Changes Requested
          </Badge>
        )
      case 'PENDING':
      default:
        return (
          <Badge className="bg-[#8F0028] text-white border border-[#8F0028] flex items-center gap-1.5 py-1 px-2.5 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </Badge>
        )
    }
  }

  const filterTabs = [
    { label: 'All Reviews', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 bg-[#171515] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#373333] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Approval Queue
            </h1>
            <Badge variant="outline" className="bg-[#242222] border-[#373333] text-[#E5E7EB] text-xs">
              {items.length} Submissions
            </Badge>
          </div>
          <p className="text-[#E5E7EB] text-sm sm:text-base mt-1">
            Enforce compliance, review AI marketing copy, and authorize publication pipelines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApprovals}
            disabled={loading}
            className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222] flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/app/content">
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222] flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Content Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-[#1C2E20] border-[#00A650] text-white'
              : 'bg-[#2E1A1A] border-[#EF4444] text-[#EF4444]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-semibold text-white">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold text-[#E5E7EB] hover:text-white ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#373333] pb-3">
        <span className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === tab.value
                ? 'bg-[#8F0028] text-white shadow-sm'
                : 'bg-[#242222] text-[#E5E7EB] hover:text-white hover:bg-[#2D2A2A] border border-[#373333]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 text-center border border-red-800/80 bg-red-950/30 rounded-2xl space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <div>
            <h3 className="font-bold text-red-300 text-lg">Unable to load approvals</h3>
            <p className="text-xs sm:text-sm text-red-400 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchApprovals} className="border-red-800 text-red-300 hover:bg-red-950/60">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="p-16 text-center border border-dashed border-[#373333] bg-[#1C1A1A] rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#242222] text-white border border-[#373333] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-lg text-white">
              {statusFilter === 'ALL' ? 'No Approvals Found' : `No ${statusFilter.toLowerCase()} approvals`}
            </h3>
            <p className="text-xs sm:text-sm text-[#E5E7EB] mt-1.5 leading-relaxed">
              {statusFilter === 'PENDING'
                ? 'All pending content has been reviewed. Great work maintaining the publication standard!'
                : 'There are no approval requests matching your current filter.'}
            </p>
          </div>
          <Link href="/app/content">
            <Button variant="outline" className="mt-2 border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222]">
              View All Content
            </Button>
          </Link>
        </div>
      )}

      {/* Approval Items List */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map(app => {
            const isActing = actionLoadingId === app.id
            const isRejecting = rejectingId === app.id

            return (
              <Card
                key={app.id}
                className="transition-all duration-200 hover:shadow-xl border-[#373333] bg-[#1C1A1A] overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Item Information */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#242222] border border-[#373333] flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                          <PlatformLogo platform={app.draft_type || 'linkedin'} className="w-5 h-5" />
                        </div>
                        <Link
                          href={`/app/content/${app.content_draft_id}`}
                          className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-white hover:text-white transition-colors"
                        >
                          <span className="truncate">{app.draft_title || 'Untitled Draft'}</span>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                        {getStatusBadge(app.status)}
                        {app.draft_type && (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-mono bg-[#242222] text-[#E5E7EB] border border-[#373333] flex items-center gap-1.5 py-1 px-2">
                            <PlatformLogo platform={app.draft_type} className="w-3.5 h-3.5" />
                            {app.draft_type}
                          </Badge>
                        )}
                      </div>

                      {app.project_title && (
                        <p className="text-xs text-[#E5E7EB]">
                          Project: <span className="font-semibold text-white">{app.project_title}</span>
                        </p>
                      )}

                      {app.draft_body && (
                        <p className="text-xs sm:text-sm text-white line-clamp-2 bg-[#242222] p-3 rounded-xl border border-[#373333] font-sans leading-relaxed">
                          {app.draft_body}
                        </p>
                      )}

                      {/* Review Comment display if present */}
                      {app.review_comment && (
                        <div className="flex items-start gap-2 text-xs bg-[#242222] text-white p-3 rounded-xl border border-[#373333]">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Reviewer Notes: </span>
                            <span>{app.review_comment}</span>
                          </div>
                        </div>
                      )}

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#E5E7EB] pt-1">
                        <span>Submitted: {new Date(app.created_at).toLocaleString()}</span>
                        {app.reviewed_at && (
                          <span>Reviewed: {new Date(app.reviewed_at).toLocaleString()}</span>
                        )}
                        <Link
                          href={`/app/content/${app.content_draft_id}`}
                          className="text-white hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          View Full Content <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                      {app.status === 'PENDING' ? (
                        <>
                          <Button
                            variant="outline"
                            disabled={isActing}
                            onClick={() => {
                              if (isRejecting) {
                                setRejectingId(null)
                                setRejectComment('')
                              } else {
                                setRejectingId(app.id)
                              }
                            }}
                            className="w-full sm:w-auto text-red-400 border-red-900/60 hover:bg-red-950/40 text-xs font-bold"
                          >
                            {isRejecting ? 'Cancel Reject' : 'Reject'}
                          </Button>
                          <Button
                            disabled={isActing}
                            onClick={() => handleApprove(app.id)}
                            className="w-full sm:w-auto bg-[#00A650] hover:bg-[#008f45] text-white flex items-center gap-1.5 shadow-md text-xs font-bold"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isActing ? 'Approving...' : 'Approve'}
                          </Button>
                        </>
                      ) : (
                        <Link href={`/app/content/${app.content_draft_id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs">
                            Manage Content
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Inline Rejection Reason Panel */}
                  {isRejecting && (
                    <div className="mt-4 pt-4 border-t border-[#373333] space-y-3">
                      <label className="block text-xs font-bold text-[#E5E7EB]">
                        Reason for Rejection (Optional but recommended):
                      </label>
                      <textarea
                        rows={2}
                        value={rejectComment}
                        onChange={e => setRejectComment(e.target.value)}
                        placeholder="Provide clear actionable feedback for the marketing team..."
                        className="w-full text-xs p-3 rounded-xl border border-[#373333] bg-[#242222] text-white placeholder-[#78736E] focus:outline-none focus:border-[#8F0028]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null)
                            setRejectComment('')
                          }}
                          className="border-[#373333] text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isActing}
                          onClick={() => handleReject(app.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                        >
                          {isActing ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
