"use client"

import React, { useState } from 'react'
import { Sparkles, Copy, Check, User } from 'lucide-react'

interface ChatMessageRendererProps {
  role: 'user' | 'ai' | 'assistant'
  content: string
  timestamp?: string
  brandName?: string
}

/**
 * Safely converts raw JSON strings (like executive_summary, strategic_pillars)
 * into human-readable, executive ChatGPT-style Markdown.
 */
export function formatJsonToMarkdown(rawText: string, brandName = 'your brand'): string {
  if (!rawText || typeof rawText !== 'string') return ''
  
  let trimmed = rawText.trim()
  if (trimmed.startsWith('```json')) trimmed = trimmed.slice(7)
  if (trimmed.startsWith('```')) trimmed = trimmed.slice(3)
  if (trimmed.endsWith('```')) trimmed = trimmed.slice(0, -3)
  trimmed = trimmed.trim()

  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return rawText
  }

  try {
    const data = JSON.parse(trimmed)
    if (!data || typeof data !== 'object') return rawText

    const hasCmoKeys = ['executive_summary', 'strategic_pillars', 'opportunities', 'delegations', 'summary'].some(
      k => k in data
    )
    if (!hasCmoKeys) return rawText

    const lines: string[] = []
    const bName = brandName || data.brand || 'StandBharat'

    // Executive summary
    const summary = data.executive_summary || data.summary
    if (summary) {
      lines.push(`### 🎯 Strategic Executive Summary for ${bName}\n`)
      lines.push(`${summary}\n`)
    }

    // Strategic pillars
    if (Array.isArray(data.strategic_pillars) && data.strategic_pillars.length > 0) {
      lines.push(`---\n\n### 🏛️ Top Strategic Priorities\n`)
      data.strategic_pillars.forEach((p: string, idx: number) => {
        lines.push(`${idx + 1}. **${p}**`)
      })
      lines.push('')
    }

    // Opportunities
    if (Array.isArray(data.opportunities) && data.opportunities.length > 0) {
      lines.push(`---\n\n### 🚀 High-Impact Opportunities\n`)
      data.opportunities.forEach((opp: any) => {
        if (typeof opp === 'object' && opp !== null) {
          const title = opp.title || 'Growth Initiative'
          const desc = opp.description || ''
          const impact = opp.impact || 'HIGH'
          const effort = opp.effort || 'LOW'
          lines.push(`• **${title}** *(Impact: ${impact} | Effort: ${effort})*`)
          if (desc) lines.push(`  ${desc}`)
        } else if (typeof opp === 'string') {
          lines.push(`• ${opp}`)
        }
      })
      lines.push('')
    }

    // Delegations
    if (Array.isArray(data.delegations) && data.delegations.length > 0) {
      lines.push(`---\n\n### ⚡ Autonomous Delegations\n`)
      data.delegations.forEach((d: any) => {
        if (typeof d === 'object' && d !== null) {
          const agent = (d.agent_id || 'Specialized Agent').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          const task = d.task || ''
          lines.push(`• **${agent}:** ${task}`)
        } else if (typeof d === 'string') {
          lines.push(`• ${d}`)
        }
      })
      lines.push('')
    }

    lines.push('Would you like me to deploy these agent tasks or focus on a specific channel?')
    return lines.join('\n')
  } catch {
    return rawText
  }
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`
 */
function renderInlineFormattedText(text: string) {
  // Regex to match **bold**, *italic*, and `code`
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="bg-[#191717] border border-[#373333] px-1.5 py-0.5 rounded text-white font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="text-[#E5E7EB] italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function ChatMessageRenderer({ role, content, timestamp, brandName }: ChatMessageRendererProps) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'

  const formattedContent = isUser ? content : formatJsonToMarkdown(content, brandName)

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex flex-col items-end self-end max-w-[85%] group">
        <div className="bg-[#8F0028] text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-xs sm:text-[13px] leading-relaxed break-words font-medium">
          {content}
        </div>
        {timestamp && (
          <span className="text-[10px] text-white/50 mt-1 mr-1">
            {timestamp}
          </span>
        )}
      </div>
    )
  }

  // AI Assistant ChatGPT-Style Card
  const paragraphs = formattedContent.split('\n\n')

  return (
    <div className="flex flex-col items-start self-start w-full max-w-[96%] group">
      {/* Sender Header Badge */}
      <div className="flex items-center justify-between w-full mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#262323] border border-[#3E3838] flex items-center justify-center text-white">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-bold text-white tracking-wide uppercase">
            AI CMO
          </span>
          <span className="text-[10px] text-[#E5E7EB]">
            Executive Strategist
          </span>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          title="Copy response"
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-[#E5E7EB] hover:text-white px-2 py-0.5 rounded bg-[#1C1A1A] border border-[#373333]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-white" />
              <span className="text-white">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Main Message Bubble */}
      <div className="w-full bg-[#201E1E] border border-[#373333] hover:border-[#4D4747] transition-colors text-white p-4 sm:p-5 rounded-2xl rounded-tl-sm shadow-md text-xs sm:text-[13px] leading-relaxed break-words space-y-3">
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim()
          if (!trimmed) return null

          // Horizontal divider
          if (trimmed === '---') {
            return <div key={pIdx} className="my-2 border-t border-[#373333]" />
          }

          // Header 3 or 4
          if (trimmed.startsWith('### ')) {
            const headingText = trimmed.replace('### ', '')
            return (
              <h4 key={pIdx} className="font-bold text-sm sm:text-[14px] text-white pt-1 flex items-center gap-1.5">
                {headingText}
              </h4>
            )
          }

          if (trimmed.startsWith('## ')) {
            const headingText = trimmed.replace('## ', '')
            return (
              <h3 key={pIdx} className="font-extrabold text-[15px] text-white pt-1">
                {headingText}
              </h3>
            )
          }

          // Multiline list (lines starting with • or - or * or 1., 2.)
          const lines = trimmed.split('\n')
          const isAllList = lines.every(l => {
            const lt = l.trim()
            return !lt || lt.startsWith('•') || lt.startsWith('-') || lt.startsWith('*') || /^\d+\.\s/.test(lt) || lt.startsWith('  ')
          })

          if (isAllList && lines.length > 1) {
            return (
              <div key={pIdx} className="space-y-2 my-1">
                {lines.map((line, lIdx) => {
                  const lt = line.trim()
                  if (!lt) return null

                  // Numbered item
                  const numMatch = lt.match(/^(\d+)\.\s+(.*)$/)
                  if (numMatch) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2.5">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#262323] border border-[#3E3838] text-white text-[11px] font-bold shrink-0 mt-0.5">
                          {numMatch[1]}
                        </span>
                        <div className="flex-1 text-[#E6E1DC]">
                          {renderInlineFormattedText(numMatch[2])}
                        </div>
                      </div>
                    )
                  }

                  // Bullet item
                  if (lt.startsWith('•') || lt.startsWith('-') || lt.startsWith('*')) {
                    const cleanText = lt.replace(/^[•\-\*]\s*/, '')
                    return (
                      <div key={lIdx} className="flex items-start gap-2.5 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A9A4A0] shrink-0 mt-2"></span>
                        <div className="flex-1 text-[#E6E1DC]">
                          {renderInlineFormattedText(cleanText)}
                        </div>
                      </div>
                    )
                  }

                  // Sub-line / indent
                  return (
                    <div key={lIdx} className="ml-5 text-[#E5E7EB] text-[12px]">
                      {renderInlineFormattedText(lt)}
                    </div>
                  )
                })}
              </div>
            )
          }

          // Single bullet or numbered line
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const cleanText = trimmed.replace(/^[•\-\*]\s*/, '')
            return (
              <div key={pIdx} className="flex items-start gap-2.5 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9A4A0] shrink-0 mt-2"></span>
                <div className="flex-1 text-[#E6E1DC]">
                  {renderInlineFormattedText(cleanText)}
                </div>
              </div>
            )
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
          if (numMatch) {
            return (
              <div key={pIdx} className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#262323] border border-[#3E3838] text-white text-[11px] font-bold shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
                <div className="flex-1 text-[#E6E1DC]">
                  {renderInlineFormattedText(numMatch[2])}
                </div>
              </div>
            )
          }

          // Regular paragraph
          return (
            <p key={pIdx} className="text-[#E6E1DC] leading-relaxed">
              {renderInlineFormattedText(trimmed)}
            </p>
          )
        })}
      </div>

      {timestamp && (
        <span className="text-[10px] text-[#E5E7EB] mt-1 ml-1">
          {timestamp}
        </span>
      )}
    </div>
  )
}
