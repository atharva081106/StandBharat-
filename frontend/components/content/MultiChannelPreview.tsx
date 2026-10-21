"use client"
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Share2, 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Bookmark, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Laptop,
  Smartphone
} from 'lucide-react'

export type PreviewChannel = 'linkedin' | 'twitter' | 'google_serp'

interface MultiChannelPreviewProps {
  title?: string
  content: string
  channel?: PreviewChannel
  authorName?: string
  brandName?: string
  websiteUrl?: string
  className?: string
  showChannelSwitcher?: boolean
  onChannelChange?: (channel: PreviewChannel) => void
}

export function MultiChannelPreview({
  title = '',
  content,
  channel: controlledChannel,
  authorName = 'StandBharat Marketing OS',
  brandName = 'StandBharat',
  websiteUrl = 'https://standbharat.com',
  className = '',
  showChannelSwitcher = true,
  onChannelChange
}: MultiChannelPreviewProps) {
  const [internalChannel, setInternalChannel] = useState<PreviewChannel>('linkedin')
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')

  const activeChannel = controlledChannel || internalChannel

  const handleSelectChannel = (ch: PreviewChannel) => {
    if (onChannelChange) onChannelChange(ch)
    else setInternalChannel(ch)
  }

  // Format clean URL breadcrumb for Google SERP
  const cleanUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const slug = (title || 'breakthrough-growth-trends-ai-marketing')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)

  // Character counter for Twitter/X
  const tweetCharCount = content.length

  return (
    <div className={`flex flex-col bg-[#141212] border border-[#2E2A2A] rounded-xl overflow-hidden ${className}`}>
      {/* Platform & Device Switcher Bar */}
      {showChannelSwitcher && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1C1A1A] border-b border-[#2E2A2A]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-[#E5E7EB] mr-2">Preview as:</span>
            
            <button
              type="button"
              onClick={() => handleSelectChannel('linkedin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                activeChannel === 'linkedin'
                  ? 'bg-[#2E2A2A] text-white border-[#3E3838] shadow-sm'
                  : 'bg-[#242222] text-[#E5E7EB] border-[#2E2A2A] hover:text-white hover:bg-[#2C2929]'
              }`}
            >
              <span className="font-bold text-[#0A66C2]">in</span>
              LinkedIn
            </button>

            <button
              type="button"
              onClick={() => handleSelectChannel('twitter')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                activeChannel === 'twitter'
                  ? 'bg-[#2E2A2A] text-white border-[#3E3838] shadow-sm'
                  : 'bg-[#242222] text-[#E5E7EB] border-[#2E2A2A] hover:text-white hover:bg-[#2C2929]'
              }`}
            >
              <span className="font-bold text-[#1D9BF0]">𝕏</span>
              X (Twitter)
            </button>

            <button
              type="button"
              onClick={() => handleSelectChannel('google_serp')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                activeChannel === 'google_serp'
                  ? 'bg-[#2E2A2A] text-white border-[#3E3838] shadow-sm'
                  : 'bg-[#242222] text-[#E5E7EB] border-[#2E2A2A] hover:text-white hover:bg-[#2C2929]'
              }`}
            >
              <Search className="w-3 h-3 text-white" />
              Google SERP
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`p-1.5 rounded transition-colors ${
                deviceView === 'desktop' ? 'bg-[#2E2A2A] text-white' : 'text-[#E5E7EB] hover:text-white'
              }`}
              title="Desktop View"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`p-1.5 rounded transition-colors ${
                deviceView === 'mobile' ? 'bg-[#2E2A2A] text-white' : 'text-[#E5E7EB] hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Simulator Content Area */}
      <div className="p-4 flex justify-center bg-[#141212] min-h-[300px]">
        <div className={`w-full transition-all duration-200 ${deviceView === 'mobile' ? 'max-w-[360px]' : 'max-w-2xl'}`}>
          
          {/* 1. LINKEDIN MOCKUP */}
          {activeChannel === 'linkedin' && (
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-lg p-4 text-white shadow-md">
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#8F0028] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#FF4560]/40">
                  {brandName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-semibold text-[13px] text-white truncate">{authorName}</h5>
                    <span className="text-[11px] text-[#E5E7EB]">• 1st</span>
                  </div>
                  <p className="text-[11px] text-[#E5E7EB] truncate">Autonomous Marketing OS for High-Growth Brands</p>
                  <p className="text-[10px] text-[#6E6A67] flex items-center gap-1 mt-0.5">
                    <span>Just now</span> • <Globe className="w-2.5 h-2.5" />
                  </p>
                </div>
              </div>

              {/* Title / Heading if present */}
              {title && (
                <h4 className="font-bold text-[13.5px] text-white mb-2 leading-snug">
                  {title}
                </h4>
              )}

              {/* Body Text */}
              <div className="text-[12.5px] text-[#D8D4D0] leading-relaxed whitespace-pre-wrap font-sans mb-4 break-words overflow-hidden">
                {content}
              </div>

              {/* Engagement Stats Bar */}
              <div className="flex items-center justify-between text-[11px] text-[#E5E7EB] py-2 border-t border-[#2A2828] mb-1">
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0A66C2] text-white text-[9px]">
                    👍
                  </span>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8F0028] text-white text-[9px] -ml-2">
                    💡
                  </span>
                  <span className="ml-1">48 reactions</span>
                </div>
                <span>12 comments • 6 reposts</span>
              </div>

              {/* Interaction Buttons */}
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-[#2A2828] text-[#E5E7EB] text-xs font-semibold">
                <button type="button" className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-[#242222] hover:text-white transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" /> Like
                </button>
                <button type="button" className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-[#242222] hover:text-white transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" /> Comment
                </button>
                <button type="button" className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-[#242222] hover:text-white transition-colors">
                  <Repeat2 className="w-3.5 h-3.5" /> Repost
                </button>
                <button type="button" className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-[#242222] hover:text-white transition-colors">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          )}

          {/* 2. TWITTER / X MOCKUP */}
          {activeChannel === 'twitter' && (
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 text-white shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#242222] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#373333]">
                  {brandName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[13px] text-white">{brandName}</span>
                    <Badge className="bg-[#1D9BF0] text-white hover:bg-[#1D9BF0] text-[9px] px-1 py-0 h-3.5 border-none">
                      ✓
                    </Badge>
                    <span className="text-[12px] text-[#E5E7EB]">@{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                    <span className="text-[12px] text-[#6E6A67]">· Just now</span>
                  </div>

                  <div className="mt-2 text-[13px] text-[#E7E9EA] leading-relaxed whitespace-pre-wrap font-sans break-words overflow-hidden">
                    {content}
                  </div>

                  {/* Character count bar */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#E5E7EB] pt-2 border-t border-[#2A2828]">
                    <span>Character Limit: <strong className={tweetCharCount > 280 ? 'text-[#EF4444]' : 'text-white'}>{tweetCharCount}</strong> / 280</span>
                    {tweetCharCount > 280 && (
                      <span className="text-[#EF4444] font-semibold text-[10px]">Split into X Thread on Publish</span>
                    )}
                  </div>

                  {/* Tweet Action Icons */}
                  <div className="flex items-center justify-between text-[#E5E7EB] text-xs pt-3 mt-1">
                    <button type="button" className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> 14
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Repeat2 className="w-3.5 h-3.5" /> 32
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> 189
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors">
                      <Bookmark className="w-3.5 h-3.5" /> 56
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. GOOGLE SERP SNIPPET MOCKUP */}
          {activeChannel === 'google_serp' && (
            <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-5 text-white shadow-md overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[#242222] border border-[#373333] flex items-center justify-center text-[10px] font-bold text-[#E5E7EB] shrink-0">
                  G
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[12px] text-[#D8D4D0] font-medium leading-tight truncate">{brandName}</span>
                  <span className="text-[10.5px] text-white truncate leading-tight block">
                    https://{cleanUrl}/blog/{slug}
                  </span>
                </div>
              </div>

              {/* Title Tag */}
              <h3 className="text-[16px] font-medium text-white hover:underline cursor-pointer leading-snug mb-1 break-words">
                {title || 'AI Marketing OS & Autonomous Growth Engine | StandBharat'}
              </h3>

              {/* Meta Description Snippet */}
              <p className="text-[12.5px] text-[#E5E7EB] leading-relaxed line-clamp-3 break-words">
                {content.slice(0, 160)}...
              </p>

              {/* SERP Health Telemetry */}
              <div className="mt-4 pt-3 border-t border-[#2A2828] flex items-center justify-between text-[11px] text-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#242222] text-white border-[#00A650]/40 text-[10px] py-0">
                    CTR Target: 4.8%
                  </Badge>
                  <span>Estimated SERP Width: <strong>540px</strong> (Safe)</span>
                </div>
                <span className="text-[10px] text-[#6E6A67]">Indexed by Googlebot</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
