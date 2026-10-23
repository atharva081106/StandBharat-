"use client"

import React from 'react'
import { 
  Zap, TrendingUp, Layers, PenTool, Sparkles, Bot, Crown, Target
} from 'lucide-react'
import {
  GA4Logo,
  GSCLogo,
  LinkedInLogo,
  XLogo,
  RedditLogo,
  TikTokLogo,
  InstagramLogo,
  MetaLogo,
  GitHubLogo,
  StandBharatLogo
} from '@/components/icons/PlatformLogos'

// Generative Engine Optimization (GEO) Multi-LLM AI Emblem
const GeoEngineIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="GEO Multi-LLM">
    <defs>
      <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8E2DE2" />
        <stop offset="50%" stopColor="#4A00E0" />
        <stop offset="100%" stopColor="#00F2FE" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" 
      fill="url(#geoGrad)" 
      stroke="#A855F7" 
      strokeWidth="0.75"
    />
    <circle cx="12" cy="11" r="2" fill="#FFFFFF" />
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
  // 1. Google Analytics 4 Revenue Attribution & Analytics Agent
  analytics: {
    icon: GA4Logo,
    textColor: 'text-white',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(249,171,0,0.25)]',
    badgeGradient: 'from-amber-600/20 to-blue-500/10'
  },
  // 2. Competitor Radar & Market Recon Agent
  competitor: {
    icon: Zap,
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    badgeGradient: 'from-amber-600/20 to-amber-400/5'
  },
  // 3. CRO & Growth Experiment Agent
  growth: {
    icon: TrendingUp,
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    badgeGradient: 'from-emerald-600/20 to-emerald-400/5'
  },
  // 4. Content Strategy & Roadmap Agent
  content_strategy: {
    icon: Layers,
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    badgeGradient: 'from-purple-600/20 to-purple-400/5'
  },
  // 5. High-Velocity Content Writer Agent
  content_writer: {
    icon: PenTool,
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(236,72,153,0.25)]',
    badgeGradient: 'from-pink-600/20 to-pink-400/5'
  },
  writer: {
    icon: PenTool,
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(236,72,153,0.25)]',
    badgeGradient: 'from-pink-600/20 to-pink-400/5'
  },
  // 6. Paid Ads & Performance Intelligence Agent (Meta Ads)
  performance: {
    icon: MetaLogo,
    textColor: 'text-white',
    bgColor: 'bg-blue-600/15',
    borderColor: 'border-blue-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(0,100,224,0.3)]',
    badgeGradient: 'from-blue-600/25 to-sky-400/10'
  },
  // 7. SEO & Topical Authority Agent (Google Search Console)
  seo: {
    icon: GSCLogo,
    textColor: 'text-white',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(66,133,244,0.25)]',
    badgeGradient: 'from-blue-600/20 to-cyan-400/10'
  },
  seo_agent: {
    icon: GSCLogo,
    textColor: 'text-white',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(66,133,244,0.25)]',
    badgeGradient: 'from-blue-600/20 to-cyan-400/10'
  },
  // 8. Generative Engine Optimization (GEO) Agent
  geo: {
    icon: GeoEngineIcon,
    textColor: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/15',
    borderColor: 'border-fuchsia-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(217,70,239,0.25)]',
    badgeGradient: 'from-fuchsia-600/20 to-fuchsia-400/5'
  },
  geo_agent: {
    icon: GeoEngineIcon,
    textColor: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/15',
    borderColor: 'border-fuchsia-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(217,70,239,0.25)]',
    badgeGradient: 'from-fuchsia-600/20 to-fuchsia-400/5'
  },
  // 9. Strategic AI CMO Advisor (StandBharat Crest)
  ai_cmo: {
    icon: StandBharatLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#8F0028]/25',
    borderColor: 'border-[#FF4A70]/40',
    glowColor: 'shadow-[0_0_14px_rgba(255,74,112,0.3)]',
    badgeGradient: 'from-[#8F0028]/40 to-[#FF4A70]/15'
  },
  cmo: {
    icon: StandBharatLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#8F0028]/25',
    borderColor: 'border-[#FF4A70]/40',
    glowColor: 'shadow-[0_0_14px_rgba(255,74,112,0.3)]',
    badgeGradient: 'from-[#8F0028]/40 to-[#FF4A70]/15'
  },
  // 10. LinkedIn Thought Leadership Agent (Official LinkedIn Logo)
  linkedin: {
    icon: LinkedInLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#0A66C2]/20',
    borderColor: 'border-[#0A66C2]/45',
    glowColor: 'shadow-[0_0_12px_rgba(10,102,194,0.35)]',
    badgeGradient: 'from-[#0A66C2]/30 to-sky-400/10'
  },
  linkedin_agent: {
    icon: LinkedInLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#0A66C2]/20',
    borderColor: 'border-[#0A66C2]/45',
    glowColor: 'shadow-[0_0_12px_rgba(10,102,194,0.35)]',
    badgeGradient: 'from-[#0A66C2]/30 to-sky-400/10'
  },
  // 11. X / Twitter Growth Agent (Official X Logo)
  x: {
    icon: XLogo,
    textColor: 'text-white',
    bgColor: 'bg-white/10',
    borderColor: 'border-white/30',
    glowColor: 'shadow-[0_0_12px_rgba(255,255,255,0.2)]',
    badgeGradient: 'from-neutral-700/30 to-neutral-500/10'
  },
  x_agent: {
    icon: XLogo,
    textColor: 'text-white',
    bgColor: 'bg-white/10',
    borderColor: 'border-white/30',
    glowColor: 'shadow-[0_0_12px_rgba(255,255,255,0.2)]',
    badgeGradient: 'from-neutral-700/30 to-neutral-500/10'
  },
  // 12. Reddit Community Engagement Agent (Official Reddit Logo)
  reddit: {
    icon: RedditLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#FF4500]/20',
    borderColor: 'border-[#FF4500]/40',
    glowColor: 'shadow-[0_0_12px_rgba(255,69,0,0.3)]',
    badgeGradient: 'from-[#FF4500]/25 to-amber-500/10'
  },
  reddit_agent: {
    icon: RedditLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#FF4500]/20',
    borderColor: 'border-[#FF4500]/40',
    glowColor: 'shadow-[0_0_12px_rgba(255,69,0,0.3)]',
    badgeGradient: 'from-[#FF4500]/25 to-amber-500/10'
  },
  // 13. Technical Marketing & Code Agent (Official GitHub Logo)
  coding: {
    icon: GitHubLogo,
    textColor: 'text-white',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    badgeGradient: 'from-emerald-600/20 to-teal-400/5'
  },
  coding_agent: {
    icon: GitHubLogo,
    textColor: 'text-white',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    badgeGradient: 'from-emerald-600/20 to-teal-400/5'
  },
  // 14. Influencer & Creator Outreach Agent (Official Instagram Logo)
  influencer: {
    icon: InstagramLogo,
    textColor: 'text-white',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    badgeGradient: 'from-rose-600/20 to-pink-400/5'
  },
  influencer_agent: {
    icon: InstagramLogo,
    textColor: 'text-white',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    badgeGradient: 'from-rose-600/20 to-pink-400/5'
  },
  // 15. Short-Form Video & UGC Scriptwriter (Official TikTok Logo)
  ugc: {
    icon: TikTokLogo,
    textColor: 'text-white',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    badgeGradient: 'from-cyan-600/20 to-blue-400/5'
  },
  ugc_agent: {
    icon: TikTokLogo,
    textColor: 'text-white',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/35',
    glowColor: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    badgeGradient: 'from-cyan-600/20 to-blue-400/5'
  }
}

function resolveAgentConfig(id?: string, name?: string): AgentColorConfig {
  const cleanId = (id || '').toLowerCase().trim().replace(/[-_]/g, '')
  const cleanName = (name || '').toLowerCase().trim()

  // Match by ID
  for (const [key, cfg] of Object.entries(AGENT_CONFIGS)) {
    const normKey = key.toLowerCase().replace(/[-_]/g, '')
    if (cleanId === normKey || cleanId.startsWith(normKey)) {
      return cfg
    }
  }

  // Match by Name heuristics
  if (cleanName.includes('analytic') || cleanName.includes('attribution') || cleanName.includes('revenue')) {
    return AGENT_CONFIGS.analytics
  }
  if (cleanName.includes('competitor') || cleanName.includes('spy') || cleanName.includes('radar')) {
    return AGENT_CONFIGS.competitor
  }
  if (cleanName.includes('growth') || cleanName.includes('experiment') || cleanName.includes('cro')) {
    return AGENT_CONFIGS.growth
  }
  if (cleanName.includes('strategy') || cleanName.includes('roadmap') || cleanName.includes('brief')) {
    return AGENT_CONFIGS.content_strategy
  }
  if (cleanName.includes('writer') || cleanName.includes('copy') || cleanName.includes('blog')) {
    return AGENT_CONFIGS.content_writer
  }
  if (cleanName.includes('performance') || cleanName.includes('paid') || cleanName.includes('ad')) {
    return AGENT_CONFIGS.performance
  }
  if (cleanName.includes('seo') || cleanName.includes('search') || cleanName.includes('ranking')) {
    return AGENT_CONFIGS.seo
  }
  if (cleanName.includes('geo') || cleanName.includes('generative') || cleanName.includes('engine') || cleanName.includes('perplexity')) {
    return AGENT_CONFIGS.geo
  }
  if (cleanName.includes('cmo') || cleanName.includes('advisor') || cleanName.includes('executive')) {
    return AGENT_CONFIGS.ai_cmo
  }
  if (cleanName.includes('linkedin')) {
    return AGENT_CONFIGS.linkedin
  }
  if (cleanName.includes('twitter') || cleanName.includes(' x ') || cleanName.startsWith('x ') || cleanName === 'x') {
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

  // Fallback: StandBharat Tech Bot
  return {
    icon: Bot,
    textColor: 'text-white',
    bgColor: 'bg-[#8F0028]/20',
    borderColor: 'border-[#FF4A70]/40',
    glowColor: 'shadow-[0_0_10px_rgba(255,74,112,0.2)]',
    badgeGradient: 'from-[#8F0028]/30 to-[#FF4A70]/10'
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

      {/* Main Colored Icon / Real Logo */}
      <IconComponent className={`relative z-10 ${sizeStyles.icon} ${config.textColor} transition-transform duration-300 group-hover:scale-110`} />

      {/* Optional Active Micro Indicator Dot */}
      {showRing && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#171515] shadow-[0_0_6px_#34d399]" />
      )}
    </div>
  )
}
