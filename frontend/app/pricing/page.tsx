"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MarketingNavbar, MarketingFooter } from '@/components/landing/navigation'
import { Check, X, Sparkles, Zap, Shield, Rocket, ArrowRight, ChevronDown } from 'lucide-react'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const proMonthly = 4999
  const proAnnual = Math.round(proMonthly * 0.8) // 20% discount

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#111111]">
      <MarketingNavbar />
      
      <main className="flex-1 flex flex-col items-center pt-10 sm:pt-16 md:pt-24 pb-16 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#F5E6E8] text-[#800020] text-[11px] sm:text-xs font-bold tracking-wide uppercase mb-4 sm:mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#800020]" />
            Transparent INR Pricing • Built for Bharat 🇮🇳
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#111111] mb-4 sm:mb-6 leading-[1.12]">
            Everything Okara.ai offers, <br/>
            <span className="text-[#800020]">plus 6 exclusive agents</span>.
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-[#5A5A5A] font-medium leading-relaxed max-w-2xl mx-auto px-2">
            Built for Indian D2C founders, high-growth startups & agencies. Start free or unleash our 15-agent autonomous team with WhatsApp Business, Indic brand voices, and GST invoicing.
          </p>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#800020]">
            <span className="flex items-center gap-1.5 bg-[#FAF3F4] px-3 py-1 rounded-full border border-[#F0D5D8]">
              ✓ Instant UPI & RuPay Checkout
            </span>
            <span className="flex items-center gap-1.5 bg-[#FAF3F4] px-3 py-1 rounded-full border border-[#F0D5D8]">
              ✓ 18% GST Input Tax Credit (ITC) Invoices
            </span>
            <span className="flex items-center gap-1.5 bg-[#FAF3F4] px-3 py-1 rounded-full border border-[#F0D5D8]">
              ✓ WhatsApp Business & Hinglish Ready
            </span>
          </div>

          {/* Billing Switcher */}
          <div className="mt-6 sm:mt-8 inline-flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 bg-[#EAE5DC] rounded-full border border-[#DCD5C9]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 sm:gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-[#800020] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Annual Billing
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-[#FFD700] text-[#111111] px-1.5 sm:px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full mb-16 sm:mb-24 items-stretch">
          
          {/* Starter (Free Forever) Tier */}
          <div className="bg-white p-5 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[28px] border border-[#E8E4DC] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#F0EFEB] text-[#666666] rounded-full">
                  Free Forever
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Zap className="w-3 h-3" /> Low AI Resource Mode
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">Starter</h3>
              <p className="text-[#666666] mt-2 text-sm font-medium leading-relaxed">
                Lightweight AI utilities tailored for solo founders and early exploratory projects.
              </p>

              <div className="my-6 sm:my-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">&#8377;0</span>
                  <span className="text-[#666666] font-semibold text-sm">/ forever</span>
                </div>
                <p className="text-xs text-[#666666] mt-1 font-medium">No credit card required. 50,000 free credits/mo.</p>
              </div>

              <div className="h-px bg-[#EAE5DC] w-full mb-6" />

              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-[#800020]">Included Free Features:</p>
                <ul className="space-y-3 sm:space-y-3.5">
                  {[
                    '3 Core Free Agents (AI CMO Advisor, SEO Audit, Social Hook Writer)',
                    'Fast, resource-light AI models (Groq Llama-3 & Gemini Flash)',
                    '50,000 monthly AI token credits (~25 runs/mo)',
                    '1 Brand Profile & Website Scanner',
                    'Single-turn strategic marketing advice',
                    'Manual copy-to-clipboard exports',
                    'Community forum support'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-[#444444]">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {[
                    'Autonomous multi-channel auto-publishing',
                    'Competitor radar & continuous crawling',
                    'Frontier LLMs (Claude 3.5 Sonnet / GPT-4o)',
                    'Multi-touch revenue attribution'
                  ].map((locked, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#999999] opacity-60">
                      <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3.5 h-3.5" />
                      </div>
                      <span className="line-through">{locked}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/signup" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-signup')) }}>
              <Button className="w-full h-11 sm:h-12 bg-white hover:bg-[#FAF8F3] text-[#111111] border border-[#D5CEC2] font-bold text-sm rounded-xl transition-all shadow-none">
                Start Free Forever
              </Button>
            </Link>
          </div>

          {/* Growth / Pro Tier (Everything Unlocked) */}
          <div className="bg-[#111111] text-white p-5 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[32px] shadow-2xl relative flex flex-col justify-between border-2 border-[#800020] transform lg:-translate-y-4">
            <div className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#800020] text-white px-3.5 sm:px-5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-full border-4 border-[#FAF8F3] shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" /> Okara.ai Alternative
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 text-white rounded-full border border-white/10">
                  Full Autonomous Power
                </span>
                <span className="text-xs font-bold text-white bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                  Everything Unlocked
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Growth (Pro)</h3>
              <p className="text-white/70 mt-2 text-sm font-medium leading-relaxed">
                An entire autonomous marketing department with 15 specialized agents and 1-click publishing.
              </p>

              <div className="my-6 sm:my-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    &#8377;{billingCycle === 'annual' ? proAnnual.toLocaleString() : proMonthly.toLocaleString()}
                  </span>
                  <span className="text-white/60 font-semibold text-sm">/ month</span>
                </div>
                <p className="text-xs text-white/80 mt-1 font-semibold">
                  {billingCycle === 'annual' ? 'Billed annually (Save ₹12,000/yr)' : 'Flexible month-to-month plan'} • Okara starts at $79/mo (~₹6,600)
                </p>
              </div>

              <div className="h-px bg-white/10 w-full mb-6" />

              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-white">Unlocks All Pro Capabilities:</p>
                <ul className="space-y-3 sm:space-y-3.5">
                  {[
                    'ALL 15 Specialized Autonomous AI Agents Unlocked',
                    'WhatsApp Business Broadcasts & Auto-Nurture sequences',
                    'Indic & Regional Tone (Indian English, Hinglish, Metro & Bharat Dialects)',
                    'D2C eCommerce Connectors (Shopify, Dukaan, WooCommerce, ONDC)',
                    'Reddit Growth & Karma Sniper (Organic Indian & Global discussions)',
                    'LinkedIn Thought Leader (Viral PDF Carousels)',
                    'X / Twitter Viral Thread Engine & Scheduler',
                    'UGC Video Script Studio (Shorts, Reels, 3s Hooks)',
                    'Influencer Matchmaker & Outreach Sequences',
                    'Generative Engine Optimization (GEO) Rank Tracker',
                    'Technical Coding & Programmatic SEO Landing Pages',
                    'Competitor Radar (24/7 web scraping & ad gap spy)',
                    'Paid Ads ROAS Optimizer (Meta & Google Search Ads in INR)',
                    'Multi-Touch Revenue Attribution (GA4 + GSC Blended in ₹)',
                    'Frontier AI Models: Claude 3.5 Sonnet, GPT-4o, Mistral Large',
                    '1,000,000 AI Credits / month with rollover',
                    '1-Click Auto-Publishing to WhatsApp, WordPress, Webflow, Shopify, Ghost, X, LinkedIn, Reddit',
                    'GST Invoices with 18% Input Tax Credit (ITC)',
                    'Human-in-the-Loop review and approval guardrails'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-white/90">
                      <div className="w-5 h-5 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0 mt-0.5 border border-[#A00028]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/signup" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-signup')) }}>
              <Button className="w-full h-12 sm:h-13 bg-[#800020] hover:bg-[#9B0027] text-white font-extrabold text-sm sm:text-base rounded-xl transition-all border-none shadow-xl shadow-[#800020]/40 flex items-center justify-center gap-2">
                <span>Start 14-Day Free Pro Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white p-5 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[28px] border border-[#E8E4DC] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#F0EFEB] text-[#666666] rounded-full">
                  Scale & Custom SLAs
                </span>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Custom Compute
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">Enterprise</h3>
              <p className="text-[#666666] mt-2 text-sm font-medium leading-relaxed">
                Dedicated infrastructure, custom brand model fine-tuning, and enterprise security for high-growth teams.
              </p>

              <div className="my-6 sm:my-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">Custom</span>
                </div>
                <p className="text-xs text-[#666666] mt-1 font-medium">Billed annually. Custom agent limits & SLAs.</p>
              </div>

              <div className="h-px bg-[#EAE5DC] w-full mb-6" />

              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-[#800020]">Enterprise Exclusives:</p>
                <ul className="space-y-3 sm:space-y-3.5">
                  {[
                    'Everything in Pro plan with unlimited workspaces',
                    'Dedicated LLM fine-tuning on company docs & tone',
                    '10,000,000+ AI credits with custom concurrency',
                    'Custom CRM connectors (HubSpot, Salesforce, Marketo)',
                    'SOC2 compliance reports, SAML SSO & SCIM',
                    'Dedicated Account Executive & Prompt Engineer',
                    '24/7 Priority Emergency Support with 99.9% uptime SLA',
                    'Custom programmatic data pipelines & private VPC hosting'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-[#444444]">
                      <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="mailto:sales@standbharat.com">
              <Button className="w-full h-11 sm:h-12 bg-white hover:bg-[#FAF8F3] text-[#111111] border border-[#D5CEC2] font-bold text-sm rounded-xl transition-all shadow-none">
                Contact Enterprise Sales
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Comparison Matrix: StandBharat vs Okara.ai */}
        <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] border border-[#E8E4DC] p-4 sm:p-8 md:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#800020] bg-[#F5E6E8] px-3 py-1 rounded-full">
              Head-to-Head Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] mt-3 sm:mt-4 mb-2 sm:mb-3">
              StandBharat vs. Okara.ai
            </h2>
            <p className="text-[#666666] text-xs sm:text-base font-medium">
              See how StandBharat gives you more specialized agents, more control, and a true free tier.
            </p>
          </div>

          {/* Mobile swipe hint */}
          <div className="md:hidden flex items-center justify-center gap-1.5 text-xs text-[#800020] font-semibold mb-4 bg-[#F5E6E8]/70 py-1.5 px-3 rounded-full w-fit mx-auto">
            <span>← Swipe sideways to compare plans →</span>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[680px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#EAE5DC]">
                  <th className="py-4 px-4 text-sm font-bold text-[#111111] uppercase tracking-wider">Feature / Capability</th>
                  <th className="py-4 px-4 text-sm font-bold text-[#666666] uppercase tracking-wider text-center">StandBharat Free</th>
                  <th className="py-4 px-4 text-sm font-bold text-[#800020] uppercase tracking-wider text-center bg-[#FAF3F4] rounded-t-xl">
                    StandBharat Pro (₹4,999/mo)
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-[#111111] uppercase tracking-wider text-center">Okara.ai ($79/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] text-sm">
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Free Forever Tier</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Yes (50K credits)</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ 14-Day Free Trial</td>
                  <td className="py-4 px-4 text-center font-semibold text-red-500">✗ Limited Trial only</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Total Specialized AI Agents</td>
                  <td className="py-4 px-4 text-center text-[#555555]">3 Lightweight</td>
                  <td className="py-4 px-4 text-center font-bold text-[#800020] bg-[#FAF3F4]">15 Autonomous Agents</td>
                  <td className="py-4 px-4 text-center text-[#555555]">9 Agents</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Autonomous AI CMO Orchestrator</td>
                  <td className="py-4 px-4 text-center text-[#555555]">Light Advisory</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Full Multi-Agent DAG</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Yes</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Reddit Growth & Karma Sniper</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Included</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">LinkedIn Thought Leader & Carousels</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Included</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">X / Twitter Threads & Engagement</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Included</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">UGC Video Script & Storyboard Studio</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Included</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Generative Engine Optimization (GEO)</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Multi-AI Tracking</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Yes</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">Competitor Radar & Ad Spy</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ 24/7 Crawler (Exclusive)</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ Missing</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">Paid Ads Copy & ROAS Optimizer</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Meta & Google (Exclusive)</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ Missing</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">Multi-Touch Revenue Attribution</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ GA4 + GSC Blended (Exclusive)</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ Missing</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">CRO Conversion Experiment Agent</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Included (Exclusive)</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ Missing</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">WhatsApp Business Broadcasts & Nurture</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Included (Indian D2C Ready)</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ Missing (US Only)</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">Indic Brand Voice & Hinglish Nuances</td>
                  <td className="py-4 px-4 text-center text-emerald-600">Basic Hinglish</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Deep Bharat Dialects & Cultural Presets</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ English Only</td>
                </tr>
                <tr className="bg-[#FFF9EA]">
                  <td className="py-4 px-4 font-bold text-[#800020]">GST Invoicing (18% ITC) & UPI Checkout</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Instant GSTIN Invoices & UPI/RuPay</td>
                  <td className="py-4 px-4 text-center font-bold text-red-500">✗ USD Card + Forex Markup</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">1-Click Auto-Publishing Connectors</td>
                  <td className="py-4 px-4 text-center text-gray-400">Manual Copy</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ WhatsApp, WordPress, Webflow, Shopify, Ghost, X, LinkedIn, Reddit</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Social & CMS</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Human-in-the-Loop Approval Center</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Included</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-[#FAF3F4]">✓ Multi-tier Governance</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-600">✓ Yes</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#111111]">Frontier AI Model Selection</td>
                  <td className="py-4 px-4 text-center text-[#555555]">Groq & Gemini Flash</td>
                  <td className="py-4 px-4 text-center font-bold text-[#800020] bg-[#FAF3F4]">Claude 3.5 Sonnet & GPT-4o</td>
                  <td className="py-4 px-4 text-center text-[#555555]">Fixed Model</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        {/* FAQ Section */}
        <div className="w-full max-w-4xl mx-auto mt-16 sm:mt-24">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-[#111111] mb-6 sm:mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: 'Do you provide GST compliant tax invoices with Input Tax Credit (ITC)?',
                a: "Yes! StandBharat generates 100% compliant Indian GST invoices. Simply enter your company's GSTIN at checkout or in workspace settings, and you can claim the full 18% Input Tax Credit seamlessly on your monthly or annual subscription."
              },
              {
                q: 'Which payment methods are accepted in India?',
                a: 'We accept instant UPI (Google Pay, PhonePe, Paytm, CRED, BHIM), RuPay debit and credit cards, NetBanking from all major Indian banks (HDFC, ICICI, SBI, Axis, Kotak), and Indian corporate credit cards. International cards are also supported for global operations.'
              },
              {
                q: 'How does the Free Plan consume fewer resources and AI credits?',
                a: 'The Free Plan routes through ultra-fast, high-efficiency models like Groq Llama-3-8B and Gemini 1.5 Flash with strict token ceilings (max 500 tokens per generation). This keeps compute costs virtually non-existent while delivering immediate marketing value for early founders.'
              },
              {
                q: 'What happens when I upgrade to Pro?',
                a: 'All 15 AI agents unlock immediately. You get 1,000,000 monthly AI credits, frontier models (Claude 3.5 Sonnet, GPT-4o), 1-click publishing to WhatsApp, WordPress, Webflow, Shopify, Ghost, X, LinkedIn, and Reddit, and continuous 24/7 background competitor monitoring.'
              },
              {
                q: 'Can I switch plans or cancel anytime?',
                a: 'Yes! You can upgrade, downgrade, or cancel your Pro plan at any time with a single click from your workspace settings. If you downgrade, your workspace automatically resumes on the Free Forever tier.'
              }
            ].map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-4 font-bold text-[#111111] text-sm sm:text-base hover:text-[#800020] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-[#800020] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-[#555555] leading-relaxed border-t border-[#F0EFEB] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  )
}
