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
  CreditCard, Sparkles, Zap, Check, Lock, ShieldCheck, 
  ArrowRight, RefreshCw, AlertCircle, Calendar, DollarSign,
  TrendingUp, Download, CheckCircle2, ChevronRight, Settings as SettingsIcon, Users,
  X, FileText, Printer, CheckCheck, HelpCircle
} from 'lucide-react'

interface PlanDetail {
  name: string
  monthly_price: number
  annual_price: number
  currency: string
  monthly_credit_quota: number
  unlocked_agents: number
  features: string[]
}

interface BillingOverview {
  workspace_id: string
  plan_tier: string
  plan_name: string
  subscription: {
    id: string | null
    status: string
    billing_cycle: string
    amount: number
    currency: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    provider: string
  }
  credits: {
    monthly_quota: number
    used_credits: number
    remaining_credits: number
    percent_used: number
  }
  features: string[]
  transactions: Array<{
    id: string
    amount: number
    currency: string
    status: string
    plan_tier: string
    billing_cycle: string
    provider: string
    provider_payment_id: string | null
    created_at: string | null
  }>
  invoices: Array<{
    id: string
    invoice_number: string
    amount_paid: number
    currency: string
    status: string
    description: string
    created_at: string | null
  }>
}

export default function BillingSettings() {
  const { activeWorkspace } = useAuth()
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [catalog, setCatalog] = useState<Record<string, PlanDetail> | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY')
  
  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<'PRO' | 'ENTERPRISE'>('PRO')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'mock'>('upi')
  const [customerGstin, setCustomerGstin] = useState('')
  const [upiData, setUpiData] = useState<any>(null)
  const [upiSecondsLeft, setUpiSecondsLeft] = useState(300)
  const [upiCopied, setUpiCopied] = useState(false)
  const [loadingUpi, setLoadingUpi] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState<any>(null)
  const [loadingReceipt, setLoadingReceipt] = useState(false)

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchBillingData = async () => {
    if (!activeWorkspace?.id) return
    setLoading(true)
    try {
      try {
        const catData = await ApiClient.get<{ plans: Record<string, PlanDetail> }>('/api/billing/plans')
        if (catData?.plans) setCatalog(catData.plans)
      } catch (e) {
        console.warn('Could not fetch catalog, using defaults', e)
      }

      const ovData = await ApiClient.get<BillingOverview>('/api/billing/overview', {
        headers: { 'X-Workspace-ID': activeWorkspace.id }
      })
      setOverview(ovData)
    } catch (err: any) {
      console.error('Failed to load billing overview:', err)
      try {
        const fallback = await ApiClient.get<any>(`/api/workspaces/${activeWorkspace.id}/plan`)
        setOverview({
          workspace_id: activeWorkspace.id,
          plan_tier: fallback.plan_tier || 'FREE',
          plan_name: fallback.plan_tier === 'PRO' ? 'Pro Marketer' : 'Starter',
          subscription: {
            id: null,
            status: fallback.subscription_status || 'ACTIVE',
            billing_cycle: 'MONTHLY',
            amount: fallback.plan_tier === 'PRO' ? 4999 : 0,
            currency: 'INR',
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
            provider: 'mock'
          },
          credits: {
            monthly_quota: fallback.monthly_credit_quota || 50000,
            used_credits: fallback.used_credits_this_month || 0,
            remaining_credits: fallback.remaining_credits || 50000,
            percent_used: Math.round(((fallback.used_credits_this_month || 0) / (fallback.monthly_credit_quota || 50000)) * 100)
          },
          features: [],
          transactions: [],
          invoices: []
        })
      } catch (fallbackErr: any) {
        setBannerMessage({ type: 'error', text: fallbackErr.message || 'Failed to load billing status' })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [activeWorkspace?.id])

  const fetchUpiIntent = async (tier = selectedPlanForCheckout, cycle = billingCycle, gstin = customerGstin) => {
    if (!activeWorkspace?.id) return
    setLoadingUpi(true)
    try {
      const data = await ApiClient.post<any>('/api/billing/upi-intent', {
        plan_tier: tier,
        billing_cycle: cycle,
        customer_gstin: gstin
      }, {
        headers: { 'X-Workspace-ID': activeWorkspace.id }
      })
      if (data) {
        setUpiData(data)
        setUpiSecondsLeft(300)
      }
    } catch (e) {
      console.warn('Failed to generate live UPI intent, using fallback', e)
      const amt = tier === 'ENTERPRISE' ? (cycle === 'ANNUAL' ? 191990 : 19999) : (cycle === 'ANNUAL' ? 47990 : 4999)
      const tax = Math.round(amt / 1.18 * 100) / 100
      const cgst = Math.round((amt - tax) / 2 * 100) / 100
      setUpiData({
        order_id: `sb_upi_${Date.now().toString(36)}`,
        plan_tier: tier,
        billing_cycle: cycle,
        total_amount: amt,
        taxable_value: tax,
        cgst: cgst,
        sgst: cgst,
        hsn_sac: "998314",
        upi_vpa: "standbharat@icici",
        merchant_name: "StandBharat AI",
        upi_uri: `upi://pay?pa=standbharat@icici&pn=StandBharat%20AI&am=${amt}.00&cu=INR&tn=${tier}%20Plan`,
        intents: {
          gpay: `gpay://upi/pay?pa=standbharat@icici&pn=StandBharat%20AI&am=${amt}.00&cu=INR`,
          phonepe: `phonepe://pay?pa=standbharat@icici&pn=StandBharat%20AI&am=${amt}.00&cu=INR`,
          paytm: `paytmmp://pay?pa=standbharat@icici&pn=StandBharat%20AI&am=${amt}.00&cu=INR`,
          bhim: `bhim://pay?pa=standbharat@icici&pn=StandBharat%20AI&am=${amt}.00&cu=INR`
        }
      })
      setUpiSecondsLeft(300)
    } finally {
      setLoadingUpi(false)
    }
  }

  useEffect(() => {
    if (checkoutModalOpen && paymentMethod === 'upi') {
      fetchUpiIntent(selectedPlanForCheckout, billingCycle, customerGstin)
    }
  }, [checkoutModalOpen, selectedPlanForCheckout, billingCycle, paymentMethod])

  useEffect(() => {
    if (!checkoutModalOpen || paymentMethod !== 'upi' || upiSecondsLeft <= 0) return
    const timer = setInterval(() => {
      setUpiSecondsLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [checkoutModalOpen, paymentMethod, upiSecondsLeft])

  const openCheckout = (tier: 'PRO' | 'ENTERPRISE') => {
    setSelectedPlanForCheckout(tier)
    setPaymentSuccessData(null)
    setCheckoutError(null)
    setCheckoutModalOpen(true)
    fetchUpiIntent(tier, billingCycle, customerGstin)
  }

  const handleExecutePayment = async () => {
    if (!activeWorkspace?.id) return
    setProcessingPayment(true)
    setCheckoutError(null)
    try {
      const payload = {
        plan_tier: selectedPlanForCheckout,
        billing_cycle: billingCycle,
        provider: paymentMethod === 'mock' ? 'mock' : 'stripe',
        instant_activate: true
      }

      const res = await ApiClient.post<any>('/api/billing/checkout', payload, {
        headers: { 'X-Workspace-ID': activeWorkspace.id }
      })

      setPaymentSuccessData(res)
      setBannerMessage({
        type: 'success',
        text: res.message || `Successfully activated ${selectedPlanForCheckout} plan!`
      })
      await fetchBillingData()
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleOpenReceipt = async (invoiceId: string) => {
    if (!activeWorkspace?.id) return
    setLoadingReceipt(true)
    setReceiptModalOpen(true)
    try {
      const data = await ApiClient.get<any>(`/api/billing/invoices/${invoiceId}/receipt`, {
        headers: { 'X-Workspace-ID': activeWorkspace.id }
      })
      setActiveReceipt(data)
    } catch (err: any) {
      setActiveReceipt(null)
      setBannerMessage({ type: 'error', text: 'Failed to load invoice receipt' })
    } finally {
      setLoadingReceipt(false)
    }
  }

  const handleCancelSubscription = async (immediate: boolean) => {
    if (!activeWorkspace?.id) return
    setCancelling(true)
    try {
      const res = await ApiClient.post<any>('/api/billing/cancel', { immediate }, {
        headers: { 'X-Workspace-ID': activeWorkspace.id }
      })
      setCancelModalOpen(false)
      setBannerMessage({
        type: 'success',
        text: res.message || 'Subscription successfully cancelled.'
      })
      await fetchBillingData()
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Cancellation request failed.' })
    } finally {
      setCancelling(false)
    }
  }

  const currentPlan = (overview?.plan_tier || 'FREE').toUpperCase()
  const isPaid = currentPlan === 'PRO' || currentPlan === 'ENTERPRISE'
  const isEnterprise = currentPlan === 'ENTERPRISE'
  const isPro = currentPlan === 'PRO'

  const usedCredits = overview?.credits?.used_credits || 0
  const quota = overview?.credits?.monthly_quota || (isPaid ? (isEnterprise ? 10000000 : 1000000) : 50000)
  const remaining = overview?.credits?.remaining_credits || Math.max(0, quota - usedCredits)
  const percentUsed = overview?.credits?.percent_used ?? Math.min(100, Math.round((usedCredits / quota) * 100))

  const subState = overview?.subscription

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto w-full custom-scrollbar">
      <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-32 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#373333] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#262323] text-white border border-[#3E3838]">
              Subscription & Compute
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-[#242222] text-white border-[#373333]">
              {isEnterprise ? 'Enterprise CMO Active' : (isPro ? 'Pro Marketer Active' : 'Starter Plan (Free Forever)')}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Billing & Credit Quota</h1>
          <p className="text-[#E5E7EB] text-sm mt-1">
            Manage your autonomous AI team subscription, token ceilings, multi-currency invoicing, and team seats.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBillingData}
          disabled={loading}
          className="border-[#373333] bg-[#1C1A1A] text-white hover:text-white hover:bg-[#242222] self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#373333] pb-3 overflow-x-auto custom-scrollbar">
        <Link 
          href="/app/settings" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <SettingsIcon className="w-3.5 h-3.5 text-white" />
          General & System
        </Link>
        <Link 
          href="/app/settings/team" 
          className="px-3.5 py-1.5 rounded-lg text-[#E5E7EB] hover:text-white hover:bg-[#242222] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-white" />
          Team Members
        </Link>
        <span className="px-3.5 py-1.5 rounded-lg bg-[#800020] text-white border border-[#800020] text-xs font-semibold flex items-center gap-1.5 cursor-default">
          <CreditCard className="w-3.5 h-3.5 text-white" />
          Plan & Billing
        </span>
      </div>

      {/* Global Notification Banner */}
      {bannerMessage && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg bg-[#1C1A1A] border-[#373333] text-white">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
            <span className="text-sm text-white font-medium">{bannerMessage.text}</span>
          </div>
          <button 
            onClick={() => setBannerMessage(null)}
            className="text-white hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Subscription Overview Card */}
      <Card className="border-[#373333] bg-[#1C1A1A] shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#2C2929]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                {overview?.plan_name || (isPaid ? 'StandBharat Pro' : 'StandBharat Starter')}
              </h2>
              <Badge className={isPaid ? 'bg-[#800020] text-white font-bold' : 'bg-[#242222] text-white border border-[#373333]'}>
                {isPaid ? '15 Specialized Agents Unlocked' : '3 Basic Agents'}
              </Badge>
              {subState?.cancel_at_period_end && (
                <Badge variant="outline" className="border-[#373333] text-white text-xs">
                  Cancels at Period End
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#E5E7EB] max-w-xl">
              {isPaid
                ? `Autonomous execution active with ${quota.toLocaleString()} credits/month. Access to Claude 3.5 Sonnet, GPT-4o, and multi-channel publishing engines.`
                : 'Free tier utilizing low-compute inference models (Groq Llama-3 & Gemini Flash) with 50,000 monthly credits.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {!isPaid ? (
              <Button
                onClick={() => openCheckout('PRO')}
                className="bg-[#800020] hover:bg-[#68001a] text-white font-bold h-11 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-white" />
                Upgrade to Pro (₹4,999/mo)
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {!isEnterprise && (
                  <Button
                    onClick={() => openCheckout('ENTERPRISE')}
                    className="bg-[#800020] hover:bg-[#68001a] text-white font-bold h-9 px-4 rounded-xl text-xs"
                  >
                    Upgrade to Enterprise
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setCancelModalOpen(true)}
                  className="border-[#373333] bg-[#242222] text-white hover:text-white hover:bg-[#2C2929] text-xs h-9 px-4 rounded-xl"
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Credit Quota & Usage Bar */}
        <div className="p-6 sm:p-8 bg-[#181616] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="w-4 h-4 text-white" />
              <span>Monthly AI Credit Consumption:</span>
            </div>
            <div className="font-mono text-xs text-white">
              <span className="text-white font-bold">{usedCredits.toLocaleString()}</span> / {quota.toLocaleString()} Credits ({remaining.toLocaleString()} remaining)
            </div>
          </div>

          <div className="w-full h-3 bg-[#242222] rounded-full overflow-hidden border border-[#373333]">
            <div
              className="h-full transition-all duration-700 rounded-full bg-[#800020]"
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#E5E7EB] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              Compute Tier: <strong className="text-white">{isPaid ? 'Frontier Cluster (Sonnet / GPT-4o)' : 'Low-Resource (Groq Llama-3 & Flash)'}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-white" />
              {subState?.current_period_end 
                ? `Next renewal: ${new Date(subState.current_period_end).toLocaleDateString()}` 
                : 'Quota resets on the 1st of every month'}
            </span>
          </div>
        </div>
      </Card>

      {/* Monthly vs Annual Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-white">Explore Available Plans</h2>
          <p className="text-xs text-[#E5E7EB] mt-0.5">Scale your autonomous marketing department with dedicated LLM keys and team seats.</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#1C1A1A] border border-[#373333] rounded-xl">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === 'MONTHLY' 
                ? 'bg-[#242222] text-white shadow' 
                : 'text-[#E5E7EB] hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'ANNUAL' 
                ? 'bg-[#242222] text-white shadow' 
                : 'text-[#E5E7EB] hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 bg-[#800020] text-white rounded text-[10px] font-bold uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Tier Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Plan */}
        <Card className="border border-[#373333] bg-[#1C1A1A] flex flex-col justify-between p-6 rounded-2xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-[#E5E7EB] mt-0.5">For bootstrapped founders</p>
              </div>
              <Badge variant="outline" className="border-[#373333] text-white">
                ₹0
              </Badge>
            </div>

            <div className="h-px bg-[#2C2929] w-full" />

            <ul className="space-y-2.5 text-xs text-[#E5E7EB]">
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>3 Basic Marketing Agents</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>50,000 AI Credits / month</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Single Brand Brain Sandbox</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Multi-Channel Auto-Publishing (Pro)</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Revenue Attribution Engine (Pro)</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#2C2929]">
            {!isPaid ? (
              <Badge className="w-full py-2 justify-center bg-[#242222] text-white border border-[#373333]">
                Current Active Plan
              </Badge>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCancelModalOpen(true)}
                className="w-full border-[#373333] text-white hover:text-white hover:bg-[#242222] text-xs h-9 rounded-xl"
              >
                Downgrade to Starter
              </Button>
            )}
          </div>
        </Card>

        {/* Pro Marketer Plan (Recommended) */}
        <Card className="border border-[#800020] bg-[#1C1A1A] flex flex-col justify-between p-6 rounded-2xl relative shadow-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Pro Marketer</h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#800020] text-white">
                    POPULAR
                  </span>
                </div>
                <p className="text-xs text-[#E5E7EB] mt-0.5">Full autonomous marketing team</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">
                  {billingCycle === 'ANNUAL' ? '₹47,990' : '₹4,999'}
                </span>
                <span className="text-[11px] text-white">
                  {billingCycle === 'ANNUAL' ? ' / yr' : ' / mo'}
                </span>
              </div>
            </div>

            <div className="h-px bg-[#2C2929] w-full" />

              <ul className="space-y-2.5 text-xs text-white">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>All 15 Specialized Agents Unlocked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>1,000,000 AI Credits / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>WhatsApp Business & Indic Tone Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Auto-Publishing to WhatsApp, WordPress, Shopify, X</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Multi-Touch INR Revenue Attribution Funnel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>GST Invoices with 18% Input Tax Credit</span>
                </li>
              </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#2C2929]">
            {isPro ? (
              <div className="w-full py-2 flex items-center justify-center gap-1.5 bg-[#800020] text-white border border-[#800020] rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Current Active Plan
              </div>
            ) : (
              <Button
                onClick={() => openCheckout('PRO')}
                className="w-full bg-[#800020] hover:bg-[#68001a] text-white font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Upgrade to Pro
              </Button>
            )}
          </div>
        </Card>

        {/* Enterprise CMO Plan */}
        <Card className="border border-[#373333] bg-[#1C1A1A] flex flex-col justify-between p-6 rounded-2xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise CMO</h3>
                <p className="text-xs text-[#E5E7EB] mt-0.5">High-velocity enterprise growth</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">
                  {billingCycle === 'ANNUAL' ? '₹1,91,990' : '₹19,999'}
                </span>
                <span className="text-[11px] text-white">
                  {billingCycle === 'ANNUAL' ? ' / yr' : ' / mo'}
                </span>
              </div>
            </div>

            <div className="h-px bg-[#2C2929] w-full" />

            <ul className="space-y-2.5 text-xs text-white">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Unlimited Concurrency Across Agents</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>10,000,000 AI Credits / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Custom Dedicated LLM API Key Gateway</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Cross-Tenant Team Role Management (RBAC)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Dedicated Account Strategist & 99.9% SLA</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#2C2929]">
            {isEnterprise ? (
              <div className="w-full py-2 flex items-center justify-center gap-1.5 bg-[#800020] text-white border border-[#800020] rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Current Active Plan
              </div>
            ) : (
              <Button
                onClick={() => openCheckout('ENTERPRISE')}
                className="w-full bg-[#242222] hover:bg-[#2C2929] text-white border border-[#373333] font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                Upgrade to Enterprise
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Invoices & Receipts Section */}
      <Card className="border-[#373333] bg-[#1C1A1A] p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2929] pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              Invoices & Payment Receipts
            </h3>
            <p className="text-xs text-[#E5E7EB] mt-0.5">
              Download tax compliant GST receipts for all subscription payments and credit renewals.
            </p>
          </div>
        </div>

        {overview?.invoices && overview.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#E5E7EB] border-b border-[#2C2929]">
                  <th className="pb-3 font-semibold">Invoice #</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2929]">
                {overview.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#242222]/50 transition-colors">
                    <td className="py-3 font-mono font-medium text-white">{inv.invoice_number}</td>
                    <td className="py-3 text-[#E5E7EB]">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 text-white">{inv.description}</td>
                    <td className="py-3 font-semibold text-white">
                      ₹{inv.amount_paid.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#242222] border border-[#373333] text-white text-[10px] font-bold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReceipt(inv.id)}
                        className="border-[#373333] bg-[#242222] text-white hover:text-white text-[11px] h-7 px-2.5 rounded-lg"
                      >
                        <Download className="w-3 h-3 mr-1 text-white" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[#E5E7EB] text-xs">
            No past invoices generated yet. Upgrading will automatically generate your first tax invoice.
          </div>
        )}
      </Card>

      {/* Interactive Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-white p-1 rounded-lg hover:bg-[#242222]"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {!paymentSuccessData ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#800020] text-white">
                    Secure Checkout
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">
                    Activate StandBharat {selectedPlanForCheckout === 'ENTERPRISE' ? 'Enterprise CMO' : 'Pro Marketer'}
                  </h3>
                  <p className="text-xs text-[#E5E7EB] mt-1">
                    Instant provisioning with all {selectedPlanForCheckout === 'ENTERPRISE' ? '10M credits' : '1M credits'} and 15 autonomous agents.
                  </p>
                </div>

                {/* Pricing Summary */}
                <div className="p-4 rounded-xl bg-[#141212] border border-[#2C2929] space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Plan Tier</span>
                    <strong className="text-white">{selectedPlanForCheckout} ({billingCycle.toLowerCase()})</strong>
                  </div>
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Subtotal</span>
                    <span className="text-white">
                      ₹{selectedPlanForCheckout === 'ENTERPRISE' 
                        ? (billingCycle === 'ANNUAL' ? '1,91,990' : '19,999') 
                        : (billingCycle === 'ANNUAL' ? '47,990' : '4,999')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>GST (18% inclusive)</span>
                    <span className="text-white">Included</span>
                  </div>
                  <div className="h-px bg-[#2C2929] w-full pt-1" />
                  <div className="flex justify-between text-sm font-bold text-white pt-1">
                    <span>Total Payable</span>
                    <span className="text-lg text-white font-bold">
                      ₹{selectedPlanForCheckout === 'ENTERPRISE' 
                        ? (billingCycle === 'ANNUAL' ? '1,91,990' : '19,999') 
                        : (billingCycle === 'ANNUAL' ? '47,990' : '4,999')}
                    </span>
                  </div>
                </div>

                {/* Payment Provider Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white">Select Payment Gateway / Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        paymentMethod === 'upi' 
                          ? 'border-[#800020] bg-[#242222] text-white' 
                          : 'border-[#373333] bg-[#141212] text-[#E5E7EB] hover:text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 mb-1 text-[#00A650]" />
                      <div className="font-bold text-white">Instant UPI QR</div>
                      <div className="text-[10px] text-[#00A650]">GPay, PhonePe, BHIM</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-[#800020] bg-[#242222] text-white' 
                          : 'border-[#373333] bg-[#141212] text-[#E5E7EB] hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-white" />
                      <div className="font-bold text-white">Card</div>
                      <div className="text-[10px] text-[#E5E7EB]">Visa / MC / RuPay</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mock')}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        paymentMethod === 'mock' 
                          ? 'border-[#800020] bg-[#242222] text-white' 
                          : 'border-[#373333] bg-[#141212] text-[#E5E7EB] hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mb-1 text-white" />
                      <div className="font-bold text-white">Sandbox</div>
                      <div className="text-[10px] text-[#E5E7EB]">Instant Mock</div>
                    </button>
                  </div>
                </div>

                {/* GSTIN Input for B2B Input Tax Credit */}
                <div className="p-3.5 rounded-xl bg-[#141212] border border-[#2C2929] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#00A650]" />
                      Company GSTIN (For 18% Tax Credit)
                    </label>
                    <span className="text-[10px] text-[#E5E7EB]">Optional</span>
                  </div>
                  <Input 
                    value={customerGstin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value.toUpperCase()
                      setCustomerGstin(val)
                      if (val.length === 15) {
                        fetchUpiIntent(selectedPlanForCheckout, billingCycle, val)
                      }
                    }}
                    placeholder="e.g. 27AAAAA0000A1Z5 (15 Characters)"
                    maxLength={15}
                    className="bg-[#1C1A1A] border-[#373333] text-white text-xs font-mono uppercase"
                  />
                  {customerGstin.length === 15 ? (
                    <div className="text-[11px] text-[#00A650] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#00A650]" />
                      GSTIN verified! Eligible to claim 18% Input Tax Credit on this invoice.
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#A39E9E]">
                      Enter your 15-digit GSTIN to receive an official B2B tax invoice and save 18% on corporate taxes.
                    </div>
                  )}
                </div>

                {/* UPI Dynamic QR Code Container */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-xl bg-[#141212] border border-[#2C2929] space-y-3.5 text-center">
                    <div className="flex items-center justify-between text-xs border-b border-[#2C2929] pb-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#00A650]" />
                        Scan with Any UPI App
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] font-bold">
                        Expires in {Math.floor(upiSecondsLeft / 60).toString().padStart(2, '0')}:{(upiSecondsLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* QR Image */}
                    <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg relative">
                      {loadingUpi ? (
                        <div className="w-8 h-8 rounded-full border-2 border-[#8F0028] border-t-transparent animate-spin" />
                      ) : (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiData?.upi_uri || 'upi://pay?pa=standbharat@icici&pn=StandBharat%20AI&am=4999.00&cu=INR')}`}
                          alt="UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* VPA with 1-Click Copy */}
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="text-[#E5E7EB]">UPI ID:</span>
                      <strong className="font-mono text-white bg-[#1C1A1A] px-2.5 py-1 rounded-md border border-[#373333]">
                        {upiData?.upi_vpa || 'standbharat@icici'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(upiData?.upi_vpa || 'standbharat@icici')
                          setUpiCopied(true)
                          setTimeout(() => setUpiCopied(false), 2000)
                        }}
                        className="text-[11px] font-bold text-[#00A650] hover:underline"
                      >
                        {upiCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    {/* Instant App Deep Links */}
                    <div className="pt-2 border-t border-[#2C2929] space-y-1.5">
                      <div className="text-[10px] text-[#E5E7EB] uppercase tracking-wider font-semibold">Or Pay Directly Via Mobile App:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <a 
                          href={upiData?.intents?.gpay || '#'} 
                          className="py-1.5 px-2 bg-[#242222] hover:bg-[#2C2929] text-white border border-[#373333] rounded-lg text-[10px] font-bold block"
                        >
                          Google Pay
                        </a>
                        <a 
                          href={upiData?.intents?.phonepe || '#'} 
                          className="py-1.5 px-2 bg-[#242222] hover:bg-[#2C2929] text-white border border-[#373333] rounded-lg text-[10px] font-bold block"
                        >
                          PhonePe
                        </a>
                        <a 
                          href={upiData?.intents?.paytm || '#'} 
                          className="py-1.5 px-2 bg-[#242222] hover:bg-[#2C2929] text-white border border-[#373333] rounded-lg text-[10px] font-bold block"
                        >
                          Paytm
                        </a>
                        <a 
                          href={upiData?.intents?.bhim || '#'} 
                          className="py-1.5 px-2 bg-[#242222] hover:bg-[#2C2929] text-white border border-[#373333] rounded-lg text-[10px] font-bold block"
                        >
                          BHIM UPI
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {checkoutError && (
                  <div className="p-3 rounded-xl bg-[#242222] border border-[#373333] text-white text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutModalOpen(false)}
                    className="w-1/3 border-[#373333] bg-[#242222] text-white hover:text-white h-10 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExecutePayment}
                    disabled={processingPayment}
                    className="w-2/3 bg-[#800020] hover:bg-[#68001a] text-white font-bold h-10 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        Verifying UPI Transaction...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        I Have Completed UPI Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#800020] border border-[#800020] flex items-center justify-center mx-auto text-white">
                  <CheckCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Subscription Activated!</h3>
                  <p className="text-xs text-[#E5E7EB] mt-1.5 max-w-sm mx-auto">
                    {paymentSuccessData.message || `Welcome to ${selectedPlanForCheckout}. All 15 autonomous agents are now fully unlocked for this workspace.`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141212] border border-[#2C2929] text-xs text-left space-y-2">
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Invoice Number:</span>
                    <span className="font-mono text-white font-bold">{paymentSuccessData.invoice_number}</span>
                  </div>
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Amount Paid:</span>
                    <span className="text-white font-bold">₹{paymentSuccessData.amount_paid?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Billing Cycle:</span>
                    <span className="text-white">{paymentSuccessData.billing_cycle}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="w-full bg-[#800020] hover:bg-[#68001a] text-white font-bold h-10 rounded-xl text-xs"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setReceiptModalOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-white p-1 rounded-lg hover:bg-[#242222]"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {loadingReceipt ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-white">
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                Loading Tax Invoice...
              </div>
            ) : activeReceipt ? (
              <div className="space-y-4" id="printable-invoice">
                {/* Official Tax Invoice Header */}
                <div className="border-b border-[#2C2929] pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#242222] text-[#00A650] border border-[#373333]">
                        Official Tax Invoice (CGST Rule 46)
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{activeReceipt.merchant || "StandBharat Autonomous AI Marketing Pvt Ltd"}</h3>
                      <p className="text-[11px] text-[#E5E7EB]">GSTIN: <strong className="font-mono text-white">{activeReceipt.tax_identifier || "27AABCS1429B1Z"}</strong></p>
                      <p className="text-[10px] text-[#A39E9E]">State: 27 - Maharashtra • SAC Code: 998314</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#E5E7EB]">Original for Recipient</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{activeReceipt.invoice_number}</div>
                      <div className="text-[10px] text-[#A39E9E]">{activeReceipt.created_at ? new Date(activeReceipt.created_at).toLocaleDateString('en-IN') : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="p-3 bg-[#141212] border border-[#2C2929] rounded-xl text-xs space-y-1">
                  <div className="text-[10px] font-bold text-[#E5E7EB] uppercase tracking-wider">Billed To Customer:</div>
                  <div className="font-bold text-white">{activeReceipt.workspace_name}</div>
                  <div className="text-[11px] text-[#E5E7EB]">
                    GSTIN: <span className="font-mono text-white">{customerGstin || activeReceipt.customer_gstin || "Unregistered Buyer (B2C)"}</span>
                  </div>
                  <div className="text-[10px] text-[#A39E9E]">Place of Supply: 27 - Maharashtra • Reverse Charge: No</div>
                </div>

                {/* Tax Breakdown Table */}
                <div className="border border-[#2C2929] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#242222] text-[#E5E7EB] text-[10px] uppercase font-bold border-b border-[#2C2929]">
                      <tr>
                        <th className="p-2">Description</th>
                        <th className="p-2">SAC</th>
                        <th className="p-2 text-right">Taxable</th>
                        <th className="p-2 text-right">GST (18%)</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2929] text-[11px]">
                      <tr>
                        <td className="p-2 font-medium text-white">StandBharat Autonomous Marketing AI</td>
                        <td className="p-2 font-mono text-[#E5E7EB]">998314</td>
                        <td className="p-2 text-right text-white">
                          ₹{(activeReceipt.taxable_value || Math.round((activeReceipt.amount_paid || 4999) / 1.18 * 100) / 100).toLocaleString()}
                        </td>
                        <td className="p-2 text-right text-[#00A650]">
                          9% CGST + 9% SGST
                        </td>
                        <td className="p-2 text-right font-bold text-white">
                          ₹{(activeReceipt.amount_paid || 4999).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="p-3 bg-[#141212] border border-[#2C2929] rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Payment Method:</span>
                    <span className="font-medium text-white">{activeReceipt.payment_method || "UPI Instant (NPCI / Razorpay)"}</span>
                  </div>
                  <div className="flex justify-between text-[#E5E7EB]">
                    <span>Invoice Status:</span>
                    <span className="font-bold text-[#00A650] uppercase">{activeReceipt.status || "PAID"}</span>
                  </div>
                  <div className="h-px bg-[#2C2929] w-full" />
                  <div className="flex justify-between items-center text-sm font-bold pt-0.5">
                    <span className="text-white">Total Amount Paid (INR):</span>
                    <span className="text-base text-white font-extrabold">₹{(activeReceipt.amount_paid || 4999).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-center text-[#A39E9E] italic">
                  This is an electronically generated Indian GST tax invoice under Section 31 of CGST Act.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="w-1/2 border-[#373333] bg-[#242222] text-white hover:text-white h-9 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    Print Tax Invoice
                  </Button>
                  <Button
                    onClick={() => setReceiptModalOpen(false)}
                    className="w-1/2 bg-[#800020] hover:bg-[#68001a] text-white h-9 rounded-xl text-xs font-bold"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white">
                Failed to load receipt details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white space-y-5">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-white p-1 rounded-lg hover:bg-[#242222]"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div>
              <div className="w-10 h-10 rounded-xl bg-[#242222] border border-[#373333] flex items-center justify-center text-white mb-3">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Manage Subscription Cancellation</h3>
              <p className="text-xs text-[#E5E7EB] mt-1.5 leading-relaxed">
                Cancelling will revert your workspace back to the Free Starter tier (3 basic agents, 50,000 monthly credits). Choose how you would like to proceed:
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCancelSubscription(false)}
                disabled={cancelling}
                className="w-full p-3.5 rounded-xl border border-[#373333] bg-[#242222] hover:bg-[#2C2929] text-left transition-all"
              >
                <div className="font-bold text-xs text-white">Cancel at End of Billing Period (Recommended)</div>
                <div className="text-[11px] text-[#E5E7EB] mt-0.5">
                  Keep your 15 autonomous agents and credits active until your current period ends without auto-renewing.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCancelSubscription(true)}
                disabled={cancelling}
                className="w-full p-3.5 rounded-xl border border-[#373333] bg-[#242222] hover:bg-[#2C2929] text-left transition-all"
              >
                <div className="font-bold text-xs text-white">Cancel Immediately</div>
                <div className="text-[11px] text-[#E5E7EB] mt-0.5">
                  Revert instantly to the Free Starter tier today.
                </div>
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="w-full border-[#373333] bg-[#141212] text-white hover:text-white h-9 rounded-xl text-xs"
            >
              Keep My Subscription Active
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
