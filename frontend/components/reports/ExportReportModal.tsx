"use client"

import React, { useState } from 'react'
import { 
  X, Download, Printer, Copy, Check, FileText, 
  Sparkles, CheckCircle2, ShieldCheck, BarChart2
} from 'lucide-react'

interface ExportReportModalProps {
  isOpen: boolean
  onClose: () => void
  brandName?: string
  domain?: string
}

export function ExportReportModal({
  isOpen,
  onClose,
  brandName = 'StandBharat Global',
  domain = 'standbharat.ai'
}: ExportReportModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  })

  const reportContent = `# STANDBHARAT AI MARKETING INTELLIGENCE REPORT
**Brand Target:** ${brandName} (${domain})  
**Generated On:** ${reportDate}  
**Classification:** Executive Growth & Attributed Revenue Briefing  

---

## 1. Executive Summary & Strategic Positioning
StandBharat has indexed complete brand voice and positioning signals for **${brandName}**. The autonomous marketing fleet operates across 15 specialized domains to capture organic search share, exploit competitor pricing shifts, and generate attributed pipeline revenue.

### Key Intelligence Signals:
1. **Competitor Counter-Positioning**: Competitors have raised enterprise pricing by +18%. High-intent buyers are seeking alternative solutions.
2. **Generative Engine Optimization (GEO)**: AI Answer Engines (Perplexity, ChatGPT Search) require entity schema markup to maintain top citation authority.
3. **Audience Intent**: Target ICP prioritizes unified autonomous execution over fragmented legacy agency retainers.

---

## 2. Telemetry & Revenue Attribution (Last 30 Days)
- **Attributed Pipeline Revenue**: ₹23,71,600 (+18.4% MoM)
- **High-Intent Inbound Leads**: 616 (+12.0% MoM)
- **Average Conversion Rate**: 9.4% (+0.8% increase)
- **Autonomous AI Credits Utilized**: 42,500 credits (Frontier Claude 3.5 Sonnet & GPT-4o)

### Channel Conversion Breakdown:
- **Organic Search & GEO Citations**: 42% share (₹9,96,000)
- **LinkedIn Thought Leadership**: 38% share (₹9,01,000)
- **Paid Ads & PPC Experiments**: 20% share (₹4,74,600)

---

## 3. 30-Day Autonomous Marketing Action Plan
1. **Phase 1 (Days 1–10) - Competitive Counter-Attack**:
   - Dispatch *Competitor Radar Agent* to produce side-by-side comparison battlecards.
   - Deploy high-converting landing page variants highlighting value-first pricing.
2. **Phase 2 (Days 11–20) - Generative Search Dominance**:
   - Deploy *GEO Agent* to validate JSON-LD structured schema entities.
   - Optimize for Perplexity AI source citations and ChatGPT Search references.
3. **Phase 3 (Days 21–30) - Multi-Channel Viral Distribution**:
   - Execute *Content Writer & LinkedIn Agents* for 5-part executive carousel series.
   - Script 3-second viral video hooks via *UGC Studio Agent*.

---

## 4. Autonomous Agent Fleet Governance
All 15 agents operate under strict human-in-the-loop oversight. No external publication occurs without executive sign-off in the Approvals Queue.
`

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${brandName.toLowerCase().replace(/\s+/g, '_')}_growth_report.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${brandName} - Executive Marketing Intelligence Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
              h1 { border-bottom: 2px solid #8F0028; padding-bottom: 8px; color: #8F0028; }
              h2 { margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
              code, pre { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
              hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit;">${reportContent}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#1C1A1A] border border-[#373333] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#373333] flex items-center justify-between bg-[#201D1D] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-[#8F0028] text-white rounded-full flex items-center gap-1.5 shadow-sm">
              <FileText className="w-3.5 h-3.5" />
              Executive Intelligence Report
            </span>
            <span className="text-xs font-bold text-[#E5E7EB] bg-[#282424] px-2.5 py-0.5 rounded-full border border-[#3A3535]">
              {reportDate}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2727] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#171515]">
          <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-2xl p-6 shadow-inner text-xs sm:text-sm text-[#E5E1DD] font-mono leading-relaxed whitespace-pre-wrap select-text break-words">
            {reportContent}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#373333] bg-[#201D1D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-semibold border border-[#3E3838] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-semibold border border-[#3E3838] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-semibold border border-[#3E3838] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.MD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
