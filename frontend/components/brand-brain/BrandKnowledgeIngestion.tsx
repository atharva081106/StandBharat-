"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Trash2, 
  Database,
  ArrowRight,
  RefreshCw,
  Layers,
  FileCheck,
  FolderOpen
} from 'lucide-react'

export interface KnowledgeDoc {
  id: string
  name: string
  size: string
  type: string
  chunks: number
  uploadedAt: string
  status: 'INDEXED' | 'PROCESSING' | 'READY'
}

interface BrandKnowledgeIngestionProps {
  className?: string
  brandName?: string
}

export function BrandKnowledgeIngestion({
  className = '',
  brandName = 'StandBharat'
}: BrandKnowledgeIngestionProps) {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([
    {
      id: 'doc-1',
      name: 'StandBharat_Brand_Voice_&_Tone_Guidelines.pdf',
      size: '2.4 MB',
      type: 'Brand Style Guide',
      chunks: 38,
      uploadedAt: 'Oct 19, 2026',
      status: 'INDEXED'
    },
    {
      id: 'doc-2',
      name: 'Autonomous_Marketing_OS_Whitepaper.pdf',
      size: '4.1 MB',
      type: 'Product Architecture',
      chunks: 64,
      uploadedAt: 'Oct 20, 2026',
      status: 'INDEXED'
    },
    {
      id: 'doc-3',
      name: 'Enterprise_Customer_Case_Study_FinTech.pdf',
      size: '1.8 MB',
      type: 'Customer Proof',
      chunks: 26,
      uploadedAt: 'Yesterday',
      status: 'INDEXED'
    }
  ])

  const [isUploading, setIsUploading] = useState(false)
  const [uploadStep, setUploadStep] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [textModalOpen, setTextModalOpen] = useState(false)
  const [rawTextTitle, setRawTextTitle] = useState('')
  const [rawTextContent, setRawTextContent] = useState('')

  // Simulate file drop / upload with 3-stage RAG indexing
  const handleSimulatedUpload = (filename: string, fileType: string) => {
    setIsUploading(true)
    setUploadStep('Extracting document text & headings...')

    setTimeout(() => {
      setUploadStep('Recursive chunking & semantic tokenization...')
      setTimeout(() => {
        setUploadStep('Generating pgvector embeddings & updating Brand Brain...')
        setTimeout(() => {
          const newDoc: KnowledgeDoc = {
            id: `doc-${Date.now()}`,
            name: filename,
            size: '3.2 MB',
            type: fileType,
            chunks: 48,
            uploadedAt: 'Just now',
            status: 'INDEXED'
          }
          setDocs(prev => [newDoc, ...prev])
          setIsUploading(false)
          setUploadStep(null)
        }, 800)
      }, 700)
    }, 700)
  }

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const handleTestSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchResult(
      `[Rank #1 Match | ${docs[0]?.name}]: "...${brandName}'s positioning emphasizes an autonomous multi-agent operating system over point-solution SaaS copywriters. Tone must always remain high-conviction, authoritative, and data-backed..."`
    )
  }

  const handleSaveRawText = () => {
    if (!rawTextTitle.trim() || !rawTextContent.trim()) return
    handleSimulatedUpload(`${rawTextTitle.replace(/\s+/g, '_')}.txt`, 'Custom Knowledge')
    setRawTextTitle('')
    setRawTextContent('')
    setTextModalOpen(false)
  }

  return (
    <div className={`bg-[#171515] border border-[#2E2A2A] rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Header - Solid background, NO gradient */}
      <div className="px-6 py-4 bg-[#1F1C1C] border-b border-[#2E2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8F0028] text-white flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Brand Brain Knowledge & Document Ingestion (RAG)</h3>
              <Badge className="bg-[#262323] text-white border border-emerald-500/30 text-[10px] py-0">
                pgvector Synced
              </Badge>
            </div>
            <p className="text-xs text-[#E5E7EB]">
              Index company whitepapers, pitch decks, and guidelines so all 15 agents reason with internal context.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTextModalOpen(true)}
            className="border-[#3E3838] bg-[#242222] hover:bg-[#2C2929] text-white text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            + Paste Text Knowledge
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-[#171515]">
        {/* Drag and Drop Upload Area */}
        <div 
          onClick={() => !isUploading && handleSimulatedUpload('Brand_Positioning_Brief_2026.pdf', 'Strategy Brief')}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isUploading 
              ? 'border-[#8F0028] bg-[#242222]' 
              : 'border-[#373333] hover:border-[#8F0028] bg-[#1C1A1A] hover:bg-[#201D1D]'
          }`}
        >
          {isUploading ? (
            <div className="py-2 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#8F0028]/20 border border-[#8F0028] text-white flex items-center justify-center mx-auto">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <h4 className="text-xs font-bold text-white">{uploadStep}</h4>
              <p className="text-[11px] text-[#E5E7EB]">
                Generating high-dimensional semantic embeddings for agent vector retrieval.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#242222] border border-[#3E3838] text-white flex items-center justify-center mx-auto">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Drop brand documents here or <span className="text-white font-bold underline">click to upload</span>
                </h4>
                <p className="text-[11px] text-[#E5E7EB] mt-0.5">
                  Supports PDF, Markdown, DOCX, and TXT files up to 25MB each.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ingested Documents List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-white" />
              Active Knowledge Base Sources ({docs.length})
            </h4>
            <span className="text-[11px] text-[#E5E7EB] font-mono">
              Total Chunks Indexed: <strong className="text-white">{docs.reduce((acc, d) => acc + d.chunks, 0)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {docs.map(doc => (
              <div key={doc.id} className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-[#242222] border border-[#3E3838] flex items-center justify-center text-white shrink-0 mt-0.5">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate" title={doc.name}>
                        {doc.name}
                      </h5>
                      <span className="text-[10px] text-[#E5E7EB]">{doc.type} • {doc.size}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="text-[#6E6A67] hover:text-red-400 transition-colors p-1"
                    title="Remove document from index"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10.5px] pt-2 border-t border-[#262323] text-[#E5E7EB]">
                  <span className="flex items-center gap-1 text-white font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {doc.chunks} Semantic Chunks
                  </span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Vector Retrieval Tester */}
        <div className="bg-[#1C1A1A] border border-[#2E2A2A] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-white" />
              Test Vector Retrieval Against Ingested Knowledge
            </span>
            <span className="text-[10px] text-[#E5E7EB]">Simulate agent context fetch</span>
          </div>

          <form onSubmit={handleTestSearch} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. What is our core value proposition vs legacy agencies?"
              className="bg-[#242222] border-[#373333] text-xs text-white placeholder:text-[#6E6A67]"
            />
            <Button 
              type="submit" 
              size="sm"
              className="bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs shrink-0 cursor-pointer"
            >
              Search
            </Button>
          </form>

          {searchResult && (
            <div className="p-3 bg-[#242222] border border-[#373333] rounded-lg text-xs text-white leading-relaxed animate-in fade-in duration-200">
              <div className="text-[10px] text-white font-bold mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                Retrieved Context Injected into Agent Prompts:
              </div>
              {searchResult}
            </div>
          )}
        </div>
      </div>

      {/* Paste Raw Text Knowledge Modal */}
      {textModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1C1A1A] border border-[#373333] rounded-2xl p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-sm font-bold text-white">Add Raw Text Knowledge to Brand Brain</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#E5E7EB] block mb-1">Knowledge Title</label>
                <Input
                  value={rawTextTitle}
                  onChange={e => setRawTextTitle(e.target.value)}
                  placeholder="e.g. Q4 2026 Product Release Notes & Objections"
                  className="bg-[#242222] border-[#373333] text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-[#E5E7EB] block mb-1">Knowledge Content</label>
                <textarea
                  value={rawTextContent}
                  onChange={e => setRawTextContent(e.target.value)}
                  rows={6}
                  placeholder="Paste proprietary brand context, customer feedback quotes, or battle notes..."
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#8F0028]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2828]">
              <Button variant="outline" size="sm" onClick={() => setTextModalOpen(false)} className="border-[#373333] text-[#E5E7EB]">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveRawText} className="bg-[#8F0028] hover:bg-[#A8002F] text-white">
                Index Knowledge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
