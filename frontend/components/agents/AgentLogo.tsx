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

// Generative Engine Optimization (GEO) Multi-LLM AI Emblem - Solid Deep Violet
const GeoEngineIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="GEO Multi-LLM">
    <path 
      d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" 
      fill="#6D28D9" 
      stroke="#5B21B6" 
      strokeWidth="1"
    />
    <circle cx="12" cy="11" r="2.2" fill="#FFFFFF" />
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
}

const AGENT_CONFIGS: Record<string, AgentColorConfig> = {
  // 1. Google Analytics 4 Revenue Attribution & Analytics Agent
  analytics: {
    icon: GA4Logo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 2. Competitor Radar & Market Recon Agent
  competitor: {
    icon: Zap,
    textColor: 'text-amber-500',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 3. CRO & Growth Experiment Agent
  growth: {
    icon: TrendingUp,
    textColor: 'text-emerald-500',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 4. Content Strategy & Roadmap Agent
  content_strategy: {
    icon: Layers,
    textColor: 'text-purple-500',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 5. High-Velocity Content Writer Agent
  content_writer: {
    icon: PenTool,
    textColor: 'text-pink-500',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  writer: {
    icon: PenTool,
    textColor: 'text-pink-500',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 6. Paid Ads & Performance Intelligence Agent (Meta Ads)
  performance: {
    icon: MetaLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 7. SEO & Topical Authority Agent (Google Search Console)
  seo: {
    icon: GSCLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  seo_agent: {
    icon: GSCLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 8. Generative Engine Optimization (GEO) Agent
  geo: {
    icon: GeoEngineIcon,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  geo_agent: {
    icon: GeoEngineIcon,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 9. Strategic AI CMO Advisor (StandBharat Crest)
  ai_cmo: {
    icon: StandBharatLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#8F0028]'
  },
  cmo: {
    icon: StandBharatLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#8F0028]'
  },
  // 10. LinkedIn Thought Leadership Agent (Official LinkedIn Logo)
  linkedin: {
    icon: LinkedInLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  linkedin_agent: {
    icon: LinkedInLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 11. X / Twitter Growth Agent (Official X Logo)
  x: {
    icon: XLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  x_agent: {
    icon: XLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 12. Reddit Community Engagement Agent (Official Reddit Logo)
  reddit: {
    icon: RedditLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  reddit_agent: {
    icon: RedditLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 13. Technical Marketing & Code Agent (Official GitHub Logo)
  coding: {
    icon: GitHubLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  coding_agent: {
    icon: GitHubLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 14. Influencer & Creator Outreach Agent (Official Instagram Logo)
  influencer: {
    icon: InstagramLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  influencer_agent: {
    icon: InstagramLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  // 15. Short-Form Video & UGC Scriptwriter (Official TikTok Logo)
  ugc: {
    icon: TikTokLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
  },
  ugc_agent: {
    icon: TikTokLogo,
    textColor: 'text-white',
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
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
    bgColor: 'bg-[#201E1E]',
    borderColor: 'border-[#373333]'
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
      className={`relative flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 shadow-sm ${sizeStyles.container} ${config.bgColor} ${config.borderColor} ${className}`}
    >
      {/* Main Colored Icon / Real Logo (No gradients, no light colors) */}
      <IconComponent className={`relative z-10 ${sizeStyles.icon} ${config.textColor} transition-transform duration-300 group-hover:scale-110`} />

      {/* Optional Active Micro Indicator Dot */}
      {showRing && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#171515]" />
      )}
    </div>
  )
}
