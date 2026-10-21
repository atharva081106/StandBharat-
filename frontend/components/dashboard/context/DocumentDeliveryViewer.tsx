"use client"

import React, { useState, useMemo } from 'react'
import { 
  FileText, Copy, Check, Download, Printer, Sparkles, 
  Code, BookOpen, CheckCircle2, Clock, ShieldCheck, 
  ChevronRight, RefreshCw, Loader2, ArrowLeft, Layers
} from 'lucide-react'

interface DocumentDeliveryViewerProps {
  title: string
  content: string
  category?: string
  brandName?: string
  onRefresh?: () => void
  isRefreshing?: boolean
  onBack?: () => void
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`
 */
function renderInline(text: string) {
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
        <code key={i} className="bg-[#191717] border border-[#373333] px-1.5 py-0.5 rounded text-white font-mono text-[12px]">
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

/**
 * Renders Markdown tables accurately
 */
function renderMarkdownTable(lines: string[], key: number | string) {
  if (lines.length < 2) return null

  // Header row
  const headerCells = lines[0]
    .split('|')
    .map(c => c.trim())
    .filter((c, idx, arr) => (idx !== 0 && idx !== arr.length - 1) || c.length > 0)

  // Skip delimiter row (index 1)
  const bodyRows = lines.slice(2).map(row => 
    row
      .split('|')
      .map(c => c.trim())
      .filter((c, idx, arr) => (idx !== 0 && idx !== arr.length - 1) || c.length > 0)
  )

  return (
    <div key={key} className="my-4 overflow-x-auto rounded-xl border border-[#373333] bg-[#191717]/80 shadow-md">
      <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
        <thead>
          <tr className="bg-[#242222] border-b border-[#373333] text-white">
            {headerCells.map((cell, idx) => (
              <th key={idx} className="py-2.5 px-4 font-bold text-white tracking-wide uppercase text-[11px]">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2E2A2A]">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#242222]/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="py-2.5 px-4 text-[#E5E7EB] leading-relaxed align-top">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DocumentDeliveryViewer({
  title,
  content,
  category = 'Knowledge Base Document',
  brandName = 'StandBharat',
  onRefresh,
  isRefreshing = false,
  onBack
}: DocumentDeliveryViewerProps) {
  const [activeTab, setActiveTab] = useState<'reader' | 'source'>('reader')
  const [copied, setCopied] = useState(false)
  const [showOutline, setShowOutline] = useState(false)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!content) return { words: 0, readTimeMinutes: 1, headingsCount: 0 }
    const words = content.trim().split(/\s+/).filter(Boolean).length
    const readTimeMinutes = Math.max(1, Math.ceil(words / 220))
    const headingsCount = (content.match(/^#{1,3}\s+/gm) || []).length
    return { words, readTimeMinutes, headingsCount }
  }, [content])

  // Extract table of contents
  const tableOfContents = useMemo(() => {
    if (!content) return []
    const lines = content.split('\n')
    const headings: Array<{ level: number; text: string; id: string }> = []
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const rawText = match[2].trim().replace(/\*\*/g, '')
        const id = rawText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        headings.push({ level, text: rawText, id })
      }
    })
    return headings
  }, [content])

  const handleCopy = () => {
    if (!content) return
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!content) return
    const cleanFileName = (title.endsWith('.md') ? title : `${title}.md`).replace(/\s+/g, '_')
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = cleanFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  // Parse markdown blocks into structured elements
  const parsedBlocks = useMemo(() => {
    if (!content) return []

    const lines = content.split('\n')
    const blocks: Array<
      | { type: 'heading'; level: number; text: string; id: string }
      | { type: 'divider' }
      | { type: 'table'; lines: string[] }
      | { type: 'codeblock'; code: string; language: string }
      | { type: 'blockquote'; text: string }
      | { type: 'list'; items: Array<{ type: 'bullet' | 'number'; num?: string; text: string }> }
      | { type: 'paragraph'; text: string }
    > = []

    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed) {
        i++
        continue
      }

      // Divider
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        blocks.push({ type: 'divider' })
        i++
        continue
      }

      // Code block
      if (trimmed.startsWith('```')) {
        const language = trimmed.slice(3).trim()
        const codeLines: string[] = []
        i++
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        i++ // consume closing ```
        blocks.push({ type: 'codeblock', code: codeLines.join('\n'), language })
        continue
      }

      // Table block (detect starting with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }
        blocks.push({ type: 'table', lines: tableLines })
        continue
      }

      // Headings
      const headingMatch = line.match(/^(#{1,4})\s+(.*)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const rawText = headingMatch[2].trim()
        const id = rawText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        blocks.push({ type: 'heading', level, text: rawText, id })
        i++
        continue
      }

      // Blockquotes
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''))
          i++
        }
        blocks.push({ type: 'blockquote', text: quoteLines.join(' ') })
        continue
      }

      // Lists (numbered or bullet)
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')
      const isNumber = /^\d+\.\s/.test(trimmed)
      if (isBullet || isNumber) {
        const listItems: Array<{ type: 'bullet' | 'number'; num?: string; text: string }> = []
        while (i < lines.length) {
          const lTrim = lines[i].trim()
          if (!lTrim) break

          const numM = lTrim.match(/^(\d+)\.\s+(.*)$/)
          if (numM) {
            listItems.push({ type: 'number', num: numM[1], text: numM[2] })
            i++
            continue
          }

          if (lTrim.startsWith('•') || lTrim.startsWith('- ') || lTrim.startsWith('* ')) {
            const clean = lTrim.replace(/^[•\-\*]\s*/, '')
            listItems.push({ type: 'bullet', text: clean })
            i++
            continue
          }

          if (lTrim.startsWith('  ') && listItems.length > 0) {
            // Continuation / sub-bullet
            listItems[listItems.length - 1].text += `\n${lTrim.trim()}`
            i++
            continue
          }

          break
        }
        blocks.push({ type: 'list', items: listItems })
        continue
      }

      // Regular paragraph
      blocks.push({ type: 'paragraph', text: trimmed })
      i++
    }

    return blocks
  }, [content])

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1C1A1A] overflow-hidden">
      {/* ========================================================= */}
      {/* DOCUMENT TOP DELIVERY TOOLBAR */}
      {/* ========================================================= */}
      <div className="px-6 py-4 border-b border-[#373333] bg-[#222020] flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm">
        
        {/* Document Title & Status */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-[#2A2828] text-[#E5E7EB] hover:text-white hover:bg-[#333030] transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-[#262323] border border-[#3E3838] flex items-center justify-center text-white shadow-md shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-white tracking-tight flex items-center gap-2">
                {title.replace(/\.md$/, '')}
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-[#262323] border border-[#3E3838] px-2 py-0.5 rounded-full">
                {category}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-[11px] text-[#E5E7EB]">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Indexed for AI CMO Grounding
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#E5E7EB]" />
                {stats.readTimeMinutes} min read ({stats.words.toLocaleString()} words)
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab View Switcher */}
          <div className="bg-[#1A1818] p-0.5 rounded-lg border border-[#373333] flex items-center">
            <button
              onClick={() => setActiveTab('reader')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'reader'
                  ? 'bg-[#8F0028] text-white shadow-sm'
                  : 'text-[#E5E7EB] hover:text-white'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Reader View</span>
            </button>
            <button
              onClick={() => setActiveTab('source')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'source'
                  ? 'bg-[#8F0028] text-white shadow-sm'
                  : 'text-[#E5E7EB] hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Raw Markdown</span>
            </button>
          </div>

          {/* Table of Contents Toggle */}
          {tableOfContents.length > 2 && (
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showOutline
                  ? 'bg-[#262323] border-[#443F3F] text-white'
                  : 'bg-[#2A2828] border-[#373333] text-white hover:bg-[#333030]'
              }`}
              title="Table of Contents"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Outline ({tableOfContents.length})</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2828] hover:bg-[#333030] border border-[#373333] text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            title="Copy document content"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#E5E7EB]" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2828] hover:bg-[#333030] border border-[#373333] text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            title="Download as Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-[#E5E7EB]" />
            <span>Export .md</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2828] hover:bg-[#333030] border border-[#373333] text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#E5E7EB]" />
            <span>PDF</span>
          </button>

          {/* Refresh / Regenerate Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8F0028] hover:bg-[#A3002D] text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-[#8F0028]/20 disabled:opacity-50"
              title="Regenerate document with live AI context"
            >
              {isRefreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isRefreshing ? 'Regenerating...' : 'Refresh with AI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* DOCUMENT BODY CONTENT */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Table of Contents Sidebar (Collapsible) */}
        {showOutline && tableOfContents.length > 0 && (
          <div className="w-64 border-r border-[#373333] bg-[#1E1C1C] p-4 overflow-y-auto custom-scrollbar shrink-0 text-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-3 px-1">
              Document Outline
            </div>
            {tableOfContents.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                className={`block py-1.5 px-2 rounded-md hover:bg-[#2A2828] hover:text-white transition-colors truncate ${
                  item.level === 1
                    ? 'font-bold text-white'
                    : item.level === 2
                    ? 'pl-4 text-[#E5E7EB]'
                    : 'pl-6 text-[#E5E7EB]'
                }`}
              >
                {item.text}
              </a>
            ))}
          </div>
        )}

        {/* Main Document Reading Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 bg-[#171515]">
          <div className="max-w-4xl mx-auto">
            
            {activeTab === 'source' ? (
              /* Raw Source Editor View */
              <div className="relative">
                <textarea
                  readOnly
                  value={content}
                  className="w-full h-[650px] p-5 bg-[#121111] border border-[#373333] rounded-2xl text-xs sm:text-sm font-mono text-[#E5E7EB] leading-relaxed custom-scrollbar focus:outline-none resize-none"
                />
              </div>
            ) : (
              /* High-End Publication Reader View */
              <article className="bg-[#201E1E] border border-[#373333] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 text-[#E6E1DC] leading-relaxed">
                
                {parsedBlocks.map((block, idx) => {
                  switch (block.type) {
                    case 'heading': {
                      if (block.level === 1) {
                        return (
                          <div key={idx} id={block.id} className="pt-2 pb-4 border-b border-[#373333] mb-6">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                              {block.text}
                            </h1>
                            <div className="flex items-center gap-2 mt-3 text-xs text-[#E5E7EB]">
                              <span className="font-semibold text-white">{brandName} Strategic Asset</span>
                              <span>•</span>
                              <span>Knowledge Base Source of Truth</span>
                            </div>
                          </div>
                        )
                      }
                      if (block.level === 2) {
                        return (
                          <h2
                            key={idx}
                            id={block.id}
                            className="text-lg sm:text-xl font-bold text-white pt-6 pb-2 border-b border-[#2E2A2A] flex items-center gap-2 group"
                          >
                            <span className="w-1.5 h-5 rounded-full bg-[#8F0028]"></span>
                            <span>{block.text}</span>
                          </h2>
                        )
                      }
                      return (
                        <h3
                          key={idx}
                          id={block.id}
                          className="text-sm sm:text-base font-bold text-white pt-4 flex items-center gap-2"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-[#E5E7EB]" />
                          <span>{block.text}</span>
                        </h3>
                      )
                    }

                    case 'divider': {
                      return <hr key={idx} className="my-6 border-t border-[#373333]" />
                    }

                    case 'table': {
                      return renderMarkdownTable(block.lines, idx)
                    }

                    case 'codeblock': {
                      return (
                        <div key={idx} className="my-4 rounded-xl border border-[#373333] overflow-hidden shadow-inner bg-[#121111]">
                          {block.language && (
                            <div className="px-4 py-1.5 bg-[#1C1A1A] border-b border-[#373333] text-[10px] uppercase tracking-wider font-bold text-[#E5E7EB] flex justify-between items-center">
                              <span>{block.language}</span>
                              <span className="text-[9px] text-[#E5E7EB]">Source Snippet</span>
                            </div>
                          )}
                          <pre className="p-4 text-xs font-mono text-[#E5E7EB] overflow-x-auto leading-relaxed">
                            {block.code}
                          </pre>
                        </div>
                      )
                    }

                    case 'blockquote': {
                      return (
                        <blockquote
                          key={idx}
                          className="my-4 pl-4 pr-3 py-3 border-l-4 border-[#8F0028] bg-[#1C1A1A] rounded-r-xl italic text-[#E5E7EB] text-xs sm:text-[13px] shadow-sm leading-relaxed"
                        >
                          {renderInline(block.text)}
                        </blockquote>
                      )
                    }

                    case 'list': {
                      return (
                        <div key={idx} className="space-y-2.5 my-3 pl-1">
                          {block.items.map((item, itemIdx) => {
                            if (item.type === 'number') {
                              return (
                                <div key={itemIdx} className="flex items-start gap-3">
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#262323] border border-[#3E3838] text-white text-[11px] font-bold shrink-0 mt-0.5">
                                    {item.num}
                                  </span>
                                  <div className="flex-1 text-xs sm:text-[13px] text-[#E5E7EB] leading-relaxed">
                                    {renderInline(item.text)}
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <div key={itemIdx} className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#A9A4A0] shrink-0 mt-2"></span>
                                <div className="flex-1 text-xs sm:text-[13px] text-[#E5E7EB] leading-relaxed">
                                  {renderInline(item.text)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }

                    case 'paragraph': {
                      return (
                        <p key={idx} className="text-xs sm:text-[13.5px] leading-relaxed text-[#E5E7EB]">
                          {renderInline(block.text)}
                        </p>
                      )
                    }

                    default:
                      return null
                  }
                })}

                {/* Document Footer Callout */}
                <div className="mt-12 pt-6 border-t border-[#373333] flex flex-wrap items-center justify-between gap-4 text-xs text-[#E5E7EB] bg-[#171515] p-5 rounded-2xl border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>This document actively informs the AI CMO, SEO Agent, and Content Sprints.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{brandName} Knowledge Base</span>
                    <span>•</span>
                    <span>Verified Operating System</span>
                  </div>
                </div>

              </article>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
