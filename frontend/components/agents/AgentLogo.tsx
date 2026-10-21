"use client"

import React from 'react'
import { 
  BarChart3, Zap, TrendingUp, Layers, PenTool, 
  DollarSign, Search, Sparkles, Bot, Share2, 
  MessageSquare, Code2, Megaphone, Video,
  Flame, Crown, Compass, ShieldCheck, Target, Activity
} from 'lucide-react'

// Authentic modern X emblem
const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export interface AgentLogoProps {
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showRing?: boolean
}

interface AgentColorConfig {
  icon: any
  textColor: string
  bgColor: string
  borderColor: string
  glowColor: string
  badgeGradient: string
}

const AGENT_CONFIGS: Record<string, AgentColorConfig> = {
  // 1. Multi-Touch Revenue Attribution & Analytics Agent
  analytics: {
    icon: BarChart3,
    textColor: 'text-white',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    badgeGradient: 'from-blue-600/20 to-blue-400/5'
  },
  // 2. Competitor Radar & Spy Agent
  competitor: {
    icon: Zap,
    textColor: 'text-white',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    badgeGradient: 'from-amber-600/20 to-amber-400/5'
  },
  // 3. CRO & Growth Experiment Agent
  growth: {
    icon: TrendingUp,
    textColor: 'text-white',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    badgeGradient: 'from-emerald-600/20 to-emerald-400/5'
  },
  // 4. Content Strategy & Roadmap Agent
  content_strategy: {
    icon: Layers,
    textColor: 'text-white',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    badgeGradient: 'from-purple-600/20 to-purple-400/5'
  },
  // 5. High-Velocity Content Writer Agent
  content_writer: {
    icon: PenTool,
    textColor: 'text-white',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(236,72,153,0.25)]',
    badgeGradient: 'from-pink-600/20 to-pink-400/5'
  },
  writer: {
    icon: PenTool,
    textColor: 'text-white',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(236,72,153,0.25)]',
    badgeGradient: 'from-pink-600/20 to-pink-400/5'
  },
  // 6. Paid Ads & Performance Intelligence Agent
  performance: {
    icon: DollarSign,
    textColor: 'text-white',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(249,115,22,0.25)]',
    badgeGradient: 'from-orange-600/20 to-orange-400/5'
  },
  // 7. SEO & Topical Authority Agent
  seo: {
    icon: Search,
    textColor: 'text-white',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    badgeGradient: 'from-cyan-600/20 to-cyan-400/5'
  },
  seo_agent: {
    icon: Search,
    textColor: 'text-white',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    badgeGradient: 'from-cyan-600/20 to-cyan-400/5'
  },
  // 8. Generative Engine Optimization (GEO) Agent
  geo: {
    icon: Sparkles,
    textColor: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/15',
    borderColor: 'border-fuchsia-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(217,70,239,0.25)]',
    badgeGradient: 'from-fuchsia-600/20 to-fuchsia-400/5'
  },
  geo_agent: {
    icon: Sparkles,
    textColor: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/15',
    borderColor: 'border-fuchsia-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(217,70,239,0.25)]',
    badgeGradient: 'from-fuchsia-600/20 to-fuchsia-400/5'
  },
  // 9. Strategic AI CMO Advisor
  ai_cmo: {
    icon: Crown,
    textColor: 'text-white',
    bgColor: 'bg-[#8F0028]/25',
    borderColor: 'border-[#FF4A70]/40',
    glowColor: 'shadow-[0_0_14px_rgba(255,74,112,0.3)]',
    badgeGradient: 'from-[#8F0028]/40 to-[#FF4A70]/15'
  },
  cmo: {
    icon: Crown,
    textColor: 'text-white',
    bgColor: 'bg-[#8F0028]/25',
    borderColor: 'border-[#FF4A70]/40',
    glowColor: 'shadow-[0_0_14px_rgba(255,74,112,0.3)]',
    badgeGradient: 'from-[#8F0028]/40 to-[#FF4A70]/15'
  },
  // 10. LinkedIn Thought Leadership Agent
  linkedin: {
    icon: Share2,
    textColor: 'text-sky-300',
    bgColor: 'bg-[#0A66C2]/20',
    borderColor: 'border-[#0A66C2]/45',
    glowColor: 'shadow-[0_0_12px_rgba(10,102,194,0.3)]',
    badgeGradient: 'from-[#0A66C2]/30 to-sky-400/10'
  },
  linkedin_agent: {
    icon: Share2,
    textColor: 'text-sky-300',
    bgColor: 'bg-[#0A66C2]/20',
    borderColor: 'border-[#0A66C2]/45',
    glowColor: 'shadow-[0_0_12px_rgba(10,102,194,0.3)]',
    badgeGradient: 'from-[#0A66C2]/30 to-sky-400/10'
  },
  // 11. X / Twitter Growth Agent
  x: {
    icon: XIcon,
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    badgeGradient: 'from-sky-600/20 to-sky-400/5'
  },
  x_agent: {
    icon: XIcon,
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    badgeGradient: 'from-sky-600/20 to-sky-400/5'
  },
  // 12. Reddit Community Engagement Agent
  reddit: {
    icon: MessageSquare,
    textColor: 'text-white',
    bgColor: 'bg-[#FF4500]/20',
    borderColor: 'border-[#FF4500]/40',
    glowColor: 'shadow-[0_0_12px_rgba(255,69,0,0.3)]',
    badgeGradient: 'from-[#FF4500]/25 to-amber-500/10'
  },
  reddit_agent: {
    icon: MessageSquare,
    textColor: 'text-white',
    bgColor: 'bg-[#FF4500]/20',
    borderColor: 'border-[#FF4500]/40',
    glowColor: 'shadow-[0_0_12px_rgba(255,69,0,0.3)]',
    badgeGradient: 'from-[#FF4500]/25 to-amber-500/10'
  },
  // 13. Technical Marketing & Code Agent
  coding: {
    icon: Code2,
    textColor: 'text-lime-400',
    bgColor: 'bg-lime-500/15',
    borderColor: 'border-lime-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(132,204,22,0.25)]',
    badgeGradient: 'from-lime-600/20 to-lime-400/5'
  },
  coding_agent: {
    icon: Code2,
    textColor: 'text-lime-400',
    bgColor: 'bg-lime-500/15',
    borderColor: 'border-lime-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(132,204,22,0.25)]',
    badgeGradient: 'from-lime-600/20 to-lime-400/5'
  },
  // 14. Influencer & PR Outreach Agent
  influencer: {
    icon: Megaphone,
    textColor: 'text-white',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(251,113,133,0.25)]',
    badgeGradient: 'from-rose-600/20 to-rose-400/5'
  },
  influencer_agent: {
    icon: Megaphone,
    textColor: 'text-white',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(251,113,133,0.25)]',
    badgeGradient: 'from-rose-600/20 to-rose-400/5'
  },
  // 15. UGC & Video Script Studio Agent
  ugc: {
    icon: Video,
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/15',
    borderColor: 'border-red-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    badgeGradient: 'from-red-600/20 to-red-400/5'
  },
  ugc_agent: {
    icon: Video,
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/15',
    borderColor: 'border-red-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    badgeGradient: 'from-red-600/20 to-red-400/5'
  },
  // Test / Diagnostics Agent
  test: {
    icon: Bot,
    textColor: 'text-white',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(20,184,166,0.25)]',
    badgeGradient: 'from-teal-600/20 to-teal-400/5'
  }
}

function resolveAgentConfig(id?: string, name?: string): AgentColorConfig {
  const cleanId = (id || '').toLowerCase().trim().replace(/-/g, '_')
  const cleanName = (name || '').toLowerCase().trim()

  // 1. Direct ID match
  if (cleanId && AGENT_CONFIGS[cleanId]) {
    return AGENT_CONFIGS[cleanId]
  }

  // 2. Stripped '_agent' match
  const strippedId = cleanId.replace(/_agent$/, '')
  if (strippedId && AGENT_CONFIGS[strippedId]) {
    return AGENT_CONFIGS[strippedId]
  }

  // 3. Name-based matching heuristics
  if (cleanName.includes('revenue') || cleanName.includes('attribution') || cleanName.includes('analytics')) {
    return AGENT_CONFIGS.analytics
  }
  if (cleanName.includes('competitor') || cleanName.includes('spy') || cleanName.includes('radar')) {
    return AGENT_CONFIGS.competitor
  }
  if (cleanName.includes('cro') || cleanName.includes('growth') || cleanName.includes('experiment')) {
    return AGENT_CONFIGS.growth
  }
  if (cleanName.includes('strategy') || cleanName.includes('roadmap')) {
    return AGENT_CONFIGS.content_strategy
  }
  if (cleanName.includes('writer') || cleanName.includes('hook') || cleanName.includes('copy')) {
    return AGENT_CONFIGS.content_writer
  }
  if (cleanName.includes('paid') || cleanName.includes('ad') || cleanName.includes('ppc') || cleanName.includes('roas') || cleanName.includes('performance')) {
    return AGENT_CONFIGS.performance
  }
  if (cleanName.includes('seo') || cleanName.includes('topical') || cleanName.includes('serp')) {
    return AGENT_CONFIGS.seo
  }
  if (cleanName.includes('geo') || cleanName.includes('generative') || cleanName.includes('citation') || cleanName.includes('answer engine')) {
    return AGENT_CONFIGS.geo
  }
  if (cleanName.includes('cmo') || cleanName.includes('advisor')) {
    return AGENT_CONFIGS.ai_cmo
  }
  if (cleanName.includes('linkedin')) {
    return AGENT_CONFIGS.linkedin
  }
  if (cleanName.includes('twitter') || cleanName.includes(' x ') || cleanName.startsWith('x ')) {
    return AGENT_CONFIGS.x
  }
  if (cleanName.includes('reddit')) {
    return AGENT_CONFIGS.reddit
  }
  if (cleanName.includes('code') || cleanName.includes('coding') || cleanName.includes('technical')) {
    return AGENT_CONFIGS.coding
  }
  if (cleanName.includes('influencer') || cleanName.includes('outreach') || cleanName.includes('pr')) {
    return AGENT_CONFIGS.influencer
  }
  if (cleanName.includes('ugc') || cleanName.includes('video') || cleanName.includes('tiktok') || cleanName.includes('reels')) {
    return AGENT_CONFIGS.ugc
  }

  // Fallback: Vibrant Emerald Bot
  return {
    icon: Bot,
    textColor: 'text-white',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/35',
    glowColor: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    badgeGradient: 'from-emerald-600/20 to-emerald-400/5'
  }
}

export function AgentLogo({
  id,
  name,
  size = 'md',
  className = '',
  showRing = true
}: AgentLogoProps) {
  const config = resolveAgentConfig(id, name)
  const IconComponent = config.icon

  // Size mappings
  const sizeStyles = {
    sm: {
      container: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4'
    },
    md: {
      container: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5'
    },
    lg: {
      container: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6'
    },
    xl: {
      container: 'w-14 h-14 rounded-2xl',
      icon: 'w-7 h-7'
    }
  }[size]

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 ${sizeStyles.container} ${config.bgColor} ${config.borderColor} ${config.glowColor} ${className}`}
    >
      {/* Subtle Inner Gradient Flare */}
      <div className={`absolute inset-0 rounded-[inherit] bg-gradient-to-br ${config.badgeGradient} opacity-60 pointer-events-none`} />

      {/* Main Colored Icon */}
      <IconComponent className={`relative z-10 ${sizeStyles.icon} ${config.textColor} transition-transform duration-300 group-hover:scale-110`} />

      {/* Optional Active Micro Indicator Dot */}
      {showRing && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#171515] shadow-[0_0_6px_#34d399]" />
      )}
    </div>
  )
}
