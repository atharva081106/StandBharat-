import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Layers, ArrowLeft, ArrowRight, Activity, 
  CheckCircle2, Sparkles, FileText, Search, Zap 
} from 'lucide-react'

export default function Workflows() {
  const workflows = [
    {
      id: 'growth-optimization',
      name: 'Autonomous Weekly Growth Loop',
      desc: 'Orchestrates telemetry extraction, SEO keyword gap identification, and creative draft generation.',
      status: 'ACTIVE',
      steps: [
        { name: 'Attribution Telemetry', agent: 'Analytics Agent', link: '/app/analytics', color: 'bg-[#242222] border-[#373333]' },
        { name: 'Keyword Gap Analysis', agent: 'SEO Agent', link: '/app/agents/seo', color: 'bg-[#242222] border-[#373333]' },
        { name: 'Creative Draft Generation', agent: 'Content Writer', link: '/app/content', color: 'bg-[#800020]/20 border-[#800020]' },
        { name: 'Approvals Queue Gate', agent: 'Human Review', link: '/app/approvals', color: 'bg-[#242222] border-[#373333]' }
      ]
    },
    {
      id: 'festive-surge',
      name: 'Festive & Seasonal Campaign Pipeline',
      desc: 'Triggers Indian holiday marketing calendar sprints, WhatsApp broadcasts, and paid ad creative variations.',
      status: 'STANDBY',
      steps: [
        { name: 'Holiday Calendar Trigger', agent: 'AI CMO', link: '/app/calendar', color: 'bg-[#242222] border-[#373333]' },
        { name: 'Multi-Channel Campaign Brief', agent: 'Campaigns Engine', link: '/app/campaigns', color: 'bg-[#242222] border-[#373333]' },
        { name: 'WhatsApp & Social Copy', agent: 'Content Studio', link: '/app/content', color: 'bg-[#242222] border-[#373333]' },
        { name: 'Launch & Telemetry Sync', agent: 'Performance Agent', link: '/app/revenue', color: 'bg-[#242222] border-[#373333]' }
      ]
    },
    {
      id: 'competitor-counter',
      name: 'Competitor Positioning & Price Radar',
      desc: 'Monitors rival websites, detects positioning pivots, and suggests defensive counter-messaging.',
      status: 'STANDBY',
      steps: [
        { name: 'Rival Domain Crawl', agent: 'Competitor Agent', link: '/app/competitors', color: 'bg-[#242222] border-[#373333]' },
        { name: 'Differentiation Audit', agent: 'Brand Brain', link: '/app/brand-brain', color: 'bg-[#242222] border-[#373333]' },
        { name: 'Opportunity Generation', agent: 'CRO Agent', link: '/app/opportunities', color: 'bg-[#242222] border-[#373333]' }
      ]
    }
  ]

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto w-full custom-scrollbar bg-[#171515] text-white">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-28">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#E5E7EB]">
          <Link 
            href="/app" 
            className="inline-flex items-center gap-1.5 text-white hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Autonomous Workflows</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#373333] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020] border border-[#9E0028] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Multi-Agent Workflows</h1>
              <p className="text-xs text-[#E5E7EB] mt-0.5">Automated sequences connecting your 15 AI agents into continuous growth loops.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/app/agent-log"
              className="px-3.5 py-1.5 rounded-lg bg-[#242222] border border-[#373333] text-xs font-semibold text-white hover:bg-[#2E2B2B] flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-white" />
              <span>Live Agent Logs</span>
            </Link>
            <Link 
              href="/app/agents"
              className="px-3.5 py-1.5 rounded-lg bg-[#800020] hover:bg-[#990026] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Agent Fleet (15)</span>
            </Link>
          </div>
        </div>

        {/* Workflow Cards */}
        <div className="space-y-4">
          {workflows.map(wf => (
            <Card key={wf.id} className="bg-[#1C1A1A] border-[#373333] hover:border-[#4A4545] transition-all">
              <CardHeader className="pb-3 border-b border-[#373333] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white font-bold">{wf.name}</CardTitle>
                  <p className="text-xs text-[#E5E7EB] mt-0.5">{wf.desc}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                  wf.status === 'ACTIVE' 
                    ? 'text-[#00A650] bg-[#00A650]/10 border-[#00A650]/30' 
                    : 'text-white bg-[#242222] border-[#373333]'
                }`}>
                  {wf.status}
                </span>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {wf.steps.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <Link 
                        href={st.link}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium hover:border-[#800020] transition-colors group flex flex-col gap-0.5 ${st.color}`}
                      >
                        <span className="text-white font-bold group-hover:text-white transition-colors">{st.name}</span>
                        <span className="text-[10px] text-[#E5E7EB]">{st.agent}</span>
                      </Link>
                      {i < wf.steps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#555050] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}
