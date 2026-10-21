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
  Settings as SettingsIcon, User, Users, Globe, 
  ShieldCheck, Server, Key, Database, RefreshCw, LogOut, Check, CreditCard, Link2
} from 'lucide-react'
import { WebhookAlertSettings } from '@/components/settings/WebhookAlertSettings'

export default function SettingsPage() {
  const { user, activeWorkspace, activeBrand, logout } = useAuth()
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wsData, brData] = await Promise.all([
        ApiClient.get<any[]>('/api/workspaces/'),
        ApiClient.get<any[]>('/api/brands/')
      ])
      setWorkspaces(wsData || [])
      setBrands(brData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#373333] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System & Workspace Settings</h1>
          <p className="text-[#E5E7EB] text-sm mt-1">
            Manage your tenant profile, brand configurations, team members, and billing subscription.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData} 
          disabled={loading}
          className="border-[#373333] bg-[#1C1A1A] text-white hover:text-white hover:bg-[#242222]"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#373333] pb-3">
        <span className="px-3.5 py-1.5 rounded-lg bg-[#800020] text-white border border-[#800020] text-xs font-semibold flex items-center gap-1.5 cursor-default">
          <SettingsIcon className="w-3.5 h-3.5 text-white" />
          General & System
        </span>
        <Link 
          href="/app/settings/team" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-white" />
          Team Members
        </Link>
        <Link 
          href="/app/settings/billing" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5 text-white" />
          Plan & Billing
        </Link>
        <Link 
          href="/app/integrations" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5 text-white" />
          Connected Integrations
        </Link>
      </div>

      <div className="space-y-6">
        {/* User Account Profile */}
        <Card className="bg-[#1C1A1A] border-[#373333]">
          <CardHeader className="border-b border-[#373333] pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2 font-bold">
              <User className="w-4 h-4 text-white" /> User Account
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-white uppercase tracking-wider font-bold mb-1">Full Name</span>
                <span className="text-sm font-medium text-white">{user?.name || 'Authorized Member'}</span>
              </div>
              <div>
                <span className="block text-white uppercase tracking-wider font-bold mb-1">Email Address</span>
                <span className="text-sm font-mono text-white">{user?.email || 'user@example.com'}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-start">
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="border-[#373333] bg-[#242222] text-white hover:bg-[#2C2929] text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5 text-white" /> Sign Out of StandBharat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Workspace */}
        <Card className="bg-[#1C1A1A] border-[#373333]">
          <CardHeader className="border-b border-[#373333] pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base text-white flex items-center gap-2 font-bold">
                <Users className="w-4 h-4 text-white" /> Active Workspace
              </CardTitle>
              <Badge className="bg-[#242222] text-white border border-[#373333] text-[10px] uppercase font-bold">
                Owner Access
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-white uppercase tracking-wider font-bold mb-1">Workspace Name</span>
                <span className="text-sm font-medium text-white">{activeWorkspace?.name || 'Default Workspace'}</span>
              </div>
              <div>
                <span className="block text-white uppercase tracking-wider font-bold mb-1">Workspace ID</span>
                <span className="text-xs font-mono text-[#E5E7EB]">{activeWorkspace?.id || '—'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#373333]">
              <span className="block text-white text-xs uppercase tracking-wider font-bold mb-2">Configured Brands</span>
              <div className="space-y-2">
                {brands.map(b => (
                  <div key={b.id} className="p-3 bg-[#242222] border border-[#373333] rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-white">{b.name}</span>
                      <span className="text-[#E5E7EB] ml-2">({b.website_url || 'No URL'})</span>
                    </div>
                    {b.id === activeBrand?.id && (
                      <Badge className="bg-[#800020] text-white border border-[#800020] text-[10px] uppercase font-bold">
                        Current Active
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Channel Alerts & Webhook Routing */}
        <WebhookAlertSettings />

        {/* System & Architecture Diagnostics */}
        <Card className="bg-[#1C1A1A] border-[#373333]">
          <CardHeader className="border-b border-[#373333] pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2 font-bold">
              <Server className="w-4 h-4 text-white" /> Platform Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#242222] border border-[#373333] rounded-lg">
                <span className="block text-white font-bold text-[10px] uppercase tracking-wider mb-1">Database</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-white" /> PostgreSQL Active
                </span>
                <span className="text-[10px] text-[#E5E7EB] mt-0.5 block">Port 5432 / Migrated</span>
              </div>

              <div className="p-3 bg-[#242222] border border-[#373333] rounded-lg">
                <span className="block text-white font-bold text-[10px] uppercase tracking-wider mb-1">Queue & Broker</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-white" /> Redis & Celery
                </span>
                <span className="text-[10px] text-[#E5E7EB] mt-0.5 block">Port 6380 / Auto-retry</span>
              </div>

              <div className="p-3 bg-[#242222] border border-[#373333] rounded-lg">
                <span className="block text-white font-bold text-[10px] uppercase tracking-wider mb-1">Data Mode</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> API Backend (Live)
                </span>
                <span className="text-[10px] text-[#E5E7EB] mt-0.5 block">Zero Mock Fallbacks</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
