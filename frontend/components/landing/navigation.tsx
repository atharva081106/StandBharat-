'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TrendingUp, UserSearch, FileText, BarChart2, Eye, Terminal, Users, Star } from 'lucide-react'
import {
  GA4Logo,
  GSCLogo,
  LinkedInLogo,
  XLogo,
  WordPressLogo,
  GitHubLogo,
  SlackLogo,
  TikTokLogo,
  InstagramLogo
} from '@/components/icons/PlatformLogos'

const AGENTS = [
  { name: 'Growth Agent', desc: 'Find high-impact opportunities.', icon: TrendingUp, color: '#34A853' },
  { name: 'SEO Agent', desc: 'Find gaps, draft pages.', icon: UserSearch, color: '#E91E63' },
  { name: 'Content Writer Agent', desc: 'Draft in your brand voice.', icon: FileText, color: '#FBBC04' },
  { name: 'Analytics Agent', desc: "Surface what's working.", icon: BarChart2, color: '#4285F4' },
  { name: 'Competitor Agent', desc: 'Monitor and exploit gaps.', icon: Eye, color: '#EA4335' },
  { name: 'Content Strategy Agent', desc: 'Build data-driven briefs.', icon: Terminal, color: '#9333EA' },
  { name: 'Audience Agent', desc: "Understand who's listening.", icon: Users, color: '#00ACC1' },
  { name: 'Brand Voice Agent', desc: 'Keep every word on-brand.', icon: Star, color: '#F57C00' },
]

const INTEGRATIONS = [
  { name: 'WordPress', desc: 'Auto-publish posts.', soon: false, icon: <WordPressLogo className="w-5 h-5" /> },
  { name: 'Google Search Console', desc: 'Track rankings & indexation.', soon: false, icon: <GSCLogo className="w-5 h-5" /> },
  { name: 'Google Analytics 4', desc: 'Track traffic & attribution.', soon: false, icon: <GA4Logo className="w-5 h-5" /> },
  { name: 'LinkedIn', desc: 'Publish thought leadership.', soon: false, icon: <LinkedInLogo className="w-5 h-5" /> },
  { name: 'X (Twitter)', desc: 'Publish threads & reach.', soon: false, icon: <XLogo className="w-5 h-5" /> },
  { name: 'Instagram', desc: 'Publish visual stories.', soon: false, icon: <InstagramLogo className="w-5 h-5" /> },
  { name: 'TikTok', desc: 'Short-form video reach.', soon: false, icon: <TikTokLogo className="w-5 h-5" /> },
  { name: 'GitHub', desc: 'Open SEO PRs & automations.', soon: false, icon: <GitHubLogo className="w-5 h-5" /> },
  { name: 'Slack', desc: 'Approval notifications in chat.', soon: false, icon: <SlackLogo className="w-5 h-5" /> },
]

// Removed AgentIcon helper as we now use Lucide icons directly

function AgentsDropdown() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[860px] z-50">
      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-[#E8E4DC] rotate-45 z-10" />
      <div className="bg-white border border-[#E8E4DC] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden flex">
        <div className="flex-1 p-4 grid grid-cols-2 gap-0.5">
          {AGENTS.map((agent, i) => (
            <Link
              key={i}
              href="#product"
              className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-[#FAF8F3] group transition-colors duration-150"
              style={{ '--agent-color': agent.color } as React.CSSProperties}
            >
              <div 
                className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 group-hover:!bg-[var(--agent-color)] group-hover:!text-white"
                style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
              >
                <agent.icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-bold text-[#111111] group-hover:!text-[var(--agent-color)] transition-colors duration-150 leading-tight">
                  {agent.name}
                </div>
                <div className="text-[11px] text-[#E5E7EB] font-medium mt-0.5 leading-snug">{agent.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="w-[230px] bg-[#111111] p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#800020] flex items-center justify-center mb-4">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <p className="text-white text-sm font-semibold leading-relaxed">
              &ldquo;StandBharat&apos;s agents found 3 growth opportunities in the first week &mdash; automatically.&rdquo;
            </p>
          </div>
          <div className="pt-5 border-t border-white/10 mt-6">
            <div className="text-[#E5E7EB] text-[10px] font-bold uppercase tracking-widest mb-3">Orchestrated by</div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-md bg-[#800020] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="text-white text-xs font-bold">StandBharat AI CMO</span>
            </div>
            <Link href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-signup')) }}>
              <span className="text-[#800020] text-xs font-bold hover:text-[#F5E6E8] transition-colors">
                Explore all agents &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntegrationsDropdown() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[1000px] z-50">
      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-[#E8E4DC] rotate-45 z-10" />
      <div className="bg-white border border-[#E8E4DC] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden flex">
        <div className="flex-1 p-4 grid grid-cols-3 gap-0.5">
          {INTEGRATIONS.map((integration, i) => (
            <Link
              key={i}
              href="#integrations"
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#FAF8F3] group transition-colors duration-150"
            >
              <div className="mt-0.5 w-10 h-10 rounded-xl bg-white shadow-sm border border-[#E8E4DC] flex items-center justify-center shrink-0 group-hover:border-[#800020] transition-colors duration-150 p-2">
                {integration.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-[#111111] group-hover:text-[#800020] transition-colors duration-150 leading-tight flex items-center gap-1.5">
                  {integration.name}
                  {integration.soon && (
                    <span className="text-[8px] font-bold uppercase tracking-wider border border-[#E8E4DC] bg-white text-[#5A5A5A] px-1.5 py-0.5 rounded-sm">Soon</span>
                  )}
                </div>
                <div className="text-[11px] text-[#E5E7EB] font-medium mt-0.5 leading-snug">{integration.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="w-[260px] bg-[#111111] p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#800020] flex items-center justify-center mb-4">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <p className="text-white text-[15px] font-medium leading-relaxed">
              &ldquo;StandBharat has transformed how we market Quest Dating. It gives us the clarity, consistency, and momentum we need to scale with confidence.&rdquo;
            </p>
          </div>
          <div className="pt-5 border-t border-white/10 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center text-white text-xs font-bold shrink-0">
                BP
              </div>
              <div>
                <div className="text-white text-xs font-bold">Brian Proctor</div>
                <div className="text-[#E5E7EB] text-[11px] font-medium mt-0.5">Solo founder &middot; Quest Dating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [agentsOpen, setAgentsOpen] = useState(false)
  const [integrationsOpen, setIntegrationsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#E8E4DC]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/landingpage" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo-icon.png" alt="StandBharat Logo" width={28} height={28} className="object-contain" />
          <span className="font-bold text-lg tracking-tight text-[#111111]">StandBharat</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link href="#ai-cmo" className="text-sm font-semibold text-[#5A5A5A] hover:text-[#800020] transition-colors">AI CMO</Link>

          <div
            className="relative"
            onMouseEnter={() => setAgentsOpen(true)}
            onMouseLeave={() => setAgentsOpen(false)}
          >
            <button
              className={`flex items-center gap-1 text-sm font-semibold transition-colors select-none ${agentsOpen ? 'text-[#800020]' : 'text-[#5A5A5A] hover:text-[#800020]'}`}
            >
              Agents
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${agentsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className={`transition-all duration-200 ${agentsOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <AgentsDropdown />
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIntegrationsOpen(true)}
            onMouseLeave={() => setIntegrationsOpen(false)}
          >
            <button
              className={`flex items-center gap-1 text-sm font-semibold transition-colors select-none ${integrationsOpen ? 'text-[#800020]' : 'text-[#5A5A5A] hover:text-[#800020]'}`}
            >
              Integrations
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${integrationsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className={`transition-all duration-200 ${integrationsOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <IntegrationsDropdown />
            </div>
          </div>

          <Link href="#ai-cmo" className="text-sm font-semibold text-[#5A5A5A] hover:text-[#800020] transition-colors">Solutions</Link>
          <Link href="#pricing" className="text-sm font-semibold text-[#5A5A5A] hover:text-[#800020] transition-colors">Pricing</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-login')) }} className="text-sm font-semibold text-[#111111] hover:text-[#800020] transition-colors">Log in</Link>
          <Link href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-signup')) }}>
            <Button className="bg-[#800020] text-white hover:bg-[#5C0017] font-bold rounded-lg px-5 h-10 border-none shadow-sm shadow-[#800020]/20">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="lg:hidden">
          <button type="button" className="text-[#111111] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#E8E4DC] p-6 shadow-xl flex flex-col gap-6 z-40 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col gap-4">
            <Link href="#ai-cmo" className="text-base font-bold text-[#111111]" onClick={() => setMobileMenuOpen(false)}>AI CMO</Link>
            
            <div>
              <div className="text-base font-bold text-[#111111] mb-3">Agents</div>
              <div className="pl-3 grid grid-cols-2 gap-y-3 gap-x-4">
                {AGENTS.map((agent, i) => (
                  <Link key={i} href="#product" className="text-sm font-semibold text-[#5A5A5A] hover:text-[#800020]" onClick={() => setMobileMenuOpen(false)}>
                    {agent.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-[#111111] mb-3 mt-2">Integrations</div>
              <div className="pl-3 grid grid-cols-2 gap-y-3 gap-x-4">
                {INTEGRATIONS.map((int, i) => (
                  <Link key={i} href="#integrations" className="text-sm font-semibold text-[#5A5A5A] hover:text-[#800020]" onClick={() => setMobileMenuOpen(false)}>
                    {int.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="#ai-cmo" className="text-base font-bold text-[#111111] mt-2" onClick={() => setMobileMenuOpen(false)}>Solutions</Link>
            <Link href="#pricing" className="text-base font-bold text-[#111111]" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          </nav>
          <div className="flex flex-col gap-4 pt-4 border-t border-[#E8E4DC]">
            <Link href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-login')); setMobileMenuOpen(false); }}>
              <Button variant="outline" className="w-full justify-center h-12 border-[#E8E4DC] text-[#111111] font-bold text-base">Log in</Button>
            </Link>
            <Link href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-auth-signup')); setMobileMenuOpen(false); }}>
              <Button className="w-full justify-center h-12 bg-[#800020] hover:bg-[#5C0017] text-white font-bold text-base border-none shadow-sm shadow-[#800020]/20">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-[#E8E4DC] pt-20 pb-10 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link href="/landingpage" className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="StandBharat Logo" width={28} height={28} className="object-contain" />
            <span className="font-bold text-lg tracking-tight text-[#111111]">StandBharat</span>
          </Link>
          <p className="text-[#5A5A5A] text-sm font-medium pr-4 leading-relaxed">The AI marketing operating system for modern businesses.</p>
        </div>
        <div>
          <h4 className="font-bold text-[#111111] text-sm mb-6">Product</h4>
          <ul className="space-y-4 text-sm font-medium text-[#5A5A5A]">
            <li><Link href="#ai-cmo" className="hover:text-[#800020] transition-colors">AI CMO</Link></li>
            <li><Link href="#product" className="hover:text-[#800020] transition-colors">Brand Brain</Link></li>
            <li><Link href="#product" className="hover:text-[#800020] transition-colors">Agents</Link></li>
            <li><Link href="#how-it-works" className="hover:text-[#800020] transition-colors">Workflows</Link></li>
            <li><Link href="#product" className="hover:text-[#800020] transition-colors">Content</Link></li>
            <li><Link href="#product" className="hover:text-[#800020] transition-colors">Analytics</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#111111] text-sm mb-6">Company</h4>
          <ul className="space-y-4 text-sm font-medium text-[#5A5A5A]">
            <li><Link href="#" className="hover:text-[#800020] transition-colors">About</Link></li>
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Careers</Link></li>
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#111111] text-sm mb-6">Resources</h4>
          <ul className="space-y-4 text-sm font-medium text-[#5A5A5A]">
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#111111] text-sm mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-medium text-[#5A5A5A]">
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Privacy</Link></li>
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Terms</Link></li>
            <li><Link href="#" className="hover:text-[#800020] transition-colors">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto pt-8 border-t border-[#E8E4DC] flex justify-between items-center text-sm font-medium text-[#E5E7EB]">
        <div>&copy; 2026 StandBharat. All rights reserved.</div>
      </div>
    </footer>
  )
}



