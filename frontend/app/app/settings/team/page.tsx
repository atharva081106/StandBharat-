"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/providers/MockProvider'
import { ApiClient } from '@/lib/api/client'
import Link from 'next/link'
import { 
  Users, UserPlus, Shield, Mail, RefreshCw, 
  CheckCircle2, AlertCircle, X, Crown, ShieldAlert, Settings as SettingsIcon, CreditCard
} from 'lucide-react'

interface Member {
  id: string
  user_id: string
  email: string
  name: string
  role: string
}

export default function TeamSettings() {
  const { activeWorkspace } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MARKETER')
  const [inviting, setInviting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!activeWorkspace?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.get<Member[]>(`/api/workspaces/${activeWorkspace.id}/members`)
      setMembers(data || [])
    } catch (err: any) {
      console.error('Failed to load team members:', err)
      setError(err.message || 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [activeWorkspace?.id])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !activeWorkspace?.id) return
    setInviting(true)
    setError(null)
    try {
      await ApiClient.post(`/api/workspaces/${activeWorkspace.id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole
      })
      setFeedback(`Invitation sent to ${inviteEmail}!`)
      setInviteEmail('')
      setShowInviteModal(false)
      await fetchMembers()
      setTimeout(() => setFeedback(null), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to invite team member')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto w-full custom-scrollbar">
      <div className="space-y-8 max-w-5xl mx-auto p-8 pb-32 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#373333] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#242222] text-white border border-[#373333]">
              Access & Collaboration
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#242222] text-white border border-[#373333]">
              {members.length} {members.length === 1 ? 'Seat' : 'Seats'} Active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Team & Permissions</h1>
          <p className="text-[#E5E7EB] text-sm mt-1">
            Invite marketers, growth engineers, and stakeholders to collaborate within {activeWorkspace?.name || 'your workspace'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMembers}
            disabled={loading}
            className="border-[#373333] bg-[#1C1A1A] text-white hover:text-white hover:bg-[#242222]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-[#800020] hover:bg-[#68001a] text-white font-bold text-xs rounded-xl shadow-lg h-9 px-4 flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5 text-white" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#373333] pb-3">
        <Link 
          href="/app/settings" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <SettingsIcon className="w-3.5 h-3.5 text-white" />
          General & System
        </Link>
        <span className="px-3.5 py-1.5 rounded-lg bg-[#800020] text-white border border-[#800020] text-xs font-semibold flex items-center gap-1.5 cursor-default">
          <Users className="w-3.5 h-3.5 text-white" />
          Team Members
        </span>
        <Link 
          href="/app/settings/billing" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5 text-white" />
          Plan & Billing
        </Link>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#1C1A1A] border border-[#373333] text-white flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span className="text-sm font-semibold text-white">{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[#242222] border border-[#373333] text-white flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-white" />
          <span className="text-sm text-white">{error}</span>
        </div>
      )}

      {/* Members Card */}
      <Card className="border-[#373333] bg-[#1C1A1A] shadow-xl overflow-hidden">
        <CardHeader className="border-b border-[#2C2929] bg-[#181616] p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-white" /> Workspace Members
          </CardTitle>
          <span className="text-xs text-[#E5E7EB]">Role-based access control enabled</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-white text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
              Loading team seats...
            </div>
          ) : members.length > 0 ? (
            <div className="divide-y divide-[#2C2929]">
              {members.map((m) => (
                <div key={m.id} className="p-5 sm:px-6 flex items-center justify-between hover:bg-[#222020] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#800020] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      {m.name ? m.name.substring(0, 2).toUpperCase() : m.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{m.name || m.email}</span>
                        {m.role === 'OWNER' && (
                          <Crown className="w-3.5 h-3.5 text-white shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-[#E5E7EB] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-white" /> {m.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider py-1 px-3 bg-[#242222] text-white border border-[#373333]">
                      {m.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-white text-sm">
              No members found for this workspace.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card className="border-[#373333] bg-[#161414] p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-white" /> Role Permissions Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#1E1C1C] border border-[#2C2929] space-y-1">
            <span className="font-bold text-white">Owner</span>
            <p className="text-[#E5E7EB]">Full root permissions, workspace billing, domain deletion, agent fleet controls.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1E1C1C] border border-[#2C2929] space-y-1">
            <span className="font-bold text-white">Admin</span>
            <p className="text-[#E5E7EB]">Team invitations, publisher credentials, content approval and publishing.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1E1C1C] border border-[#2C2929] space-y-1">
            <span className="font-bold text-white">Marketer</span>
            <p className="text-[#E5E7EB]">Run all 15 AI agents, create campaigns, draft content, execute opportunities.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1E1C1C] border border-[#2C2929] space-y-1">
            <span className="font-bold text-white">Viewer</span>
            <p className="text-[#E5E7EB]">Read-only access to analytics dashboards, content calendar, and attribution reports.</p>
          </div>
        </div>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1C1A1A] border border-[#373333] w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-white hover:text-white"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Invite Team Member</h3>
            <p className="text-xs text-[#E5E7EB] mb-4">
              Add a collaborator to your StandBharat workspace with custom role permissions.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Email Address</label>
                <Input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-[#242222] border-[#373333] text-white text-xs h-10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#242222] border border-[#373333] text-white text-xs h-10 rounded-xl px-3 outline-none"
                >
                  <option value="MARKETER">Marketer (Execute Agents & Content)</option>
                  <option value="ADMIN">Admin (Approvals & Credentials)</option>
                  <option value="VIEWER">Viewer (Read-only Analytics)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="border-[#373333] bg-[#242222] text-white hover:text-white h-9 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inviting}
                  className="bg-[#800020] hover:bg-[#68001a] text-white font-bold h-9 rounded-xl text-xs"
                >
                  {inviting ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
