import React, { useState, useRef, useEffect } from 'react';
import { useDocuments, BrandDocument } from '@/lib/providers/DocumentProvider';
import { ApiDocumentProvider } from '@/lib/providers/api/ApiDocumentProvider';
import { 
  FileText, Upload, Plus, Trash2, AlertCircle, File, CheckCircle2, 
  Loader2, Info, Sparkles, Copy, Check, ArrowLeft, RefreshCw
} from 'lucide-react';
import { DocumentDeliveryViewer } from './DocumentDeliveryViewer';

export const DocumentsPanel = () => {
  const { documents, loading, error, uploadDocument, createDocument, generateRealDocuments, deleteDocument, fetchDocuments } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<BrandDocument | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'Product Information',
    content: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When selectedDoc changes, load extracted_text if needed
  useEffect(() => {
    if (!selectedDoc) {
      setDocContent('');
      return;
    }

    if (selectedDoc.extracted_text) {
      setDocContent(selectedDoc.extracted_text);
    } else {
      setLoadingContent(true);
      ApiDocumentProvider.getDocument(selectedDoc.id)
        .then(doc => {
          if (doc?.extracted_text) {
            setDocContent(doc.extracted_text);
          } else {
            setDocContent('');
          }
        })
        .catch(err => {
          console.error('Failed to load doc detail', err);
          setDocContent('');
        })
        .finally(() => setLoadingContent(false));
    }
  }, [selectedDoc]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadDocument(file, 'Uncategorized');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateReal = async () => {
    try {
      setGenerating(true);
      await generateRealDocuments();
      await fetchDocuments();
    } catch (err: any) {
      alert('Failed to generate documents: ' + (err.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.content.trim()) return;

    try {
      setSavingDoc(true);
      const name = createForm.name.endsWith('.md') ? createForm.name : `${createForm.name}.md`;
      await createDocument({
        name,
        category: createForm.category,
        content: createForm.content,
        type: 'text/markdown'
      });
      setShowCreateModal(false);
      setCreateForm({ name: '', category: 'Product Information', content: '' });
    } catch (err: any) {
      alert('Failed to create document: ' + (err.message || 'Error occurred'));
    } finally {
      setSavingDoc(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPLOADED':
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 text-[#E5E7EB] animate-spin" />;
      case 'READY':
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'FAILED':
      case 'UNSUPPORTED':
        return <AlertCircle className="w-4 h-4 text-[#8F0028]" />;
      default:
        return <Info className="w-4 h-4 text-[#E5E7EB]" />;
    }
  };

  const copyToClipboard = () => {
    if (!docContent) return;
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown Styler for content rendering
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-sans text-[13px] leading-relaxed text-[#E5E7EB]">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-[20px] font-bold text-white pt-3 pb-1 border-b border-[#373333]">
                {trimmed.replace('# ', '')}
              </h1>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-[16px] font-bold text-white pt-3 pb-1">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-[14px] font-bold text-white pt-2">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8F0028] mt-2 shrink-0"></span>
                <span className="text-[#E5E7EB]">{trimmed.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-4 py-1 border-l-2 border-[#8F0028] bg-[#1C1A1A] italic text-[#E5E7EB] rounded-r">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          if (trimmed === '') {
            return <div key={idx} className="h-1"></div>;
          }

          return (
            <p key={idx} className="text-[#E5E7EB]">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  if (selectedDoc) {
    if (loadingContent) {
      return (
        <div className="flex-1 flex flex-col h-full bg-[#1C1A1A] items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#8F0028] animate-spin mb-3" />
          <p className="text-sm text-[#E5E7EB]">Loading publication-grade document...</p>
        </div>
      );
    }

    return (
      <DocumentDeliveryViewer
        title={selectedDoc.name}
        content={docContent || selectedDoc.extracted_text || ''}
        category={selectedDoc.category || 'Knowledge Base Document'}
        onBack={() => setSelectedDoc(null)}
        onRefresh={handleGenerateReal}
        isRefreshing={generating}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1C1A1A]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#373333] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8F0028]" />
            Knowledge Base
          </h2>
          <p className="text-[12px] text-[#E5E7EB] mt-1">Ground truth documents vectorized for autonomous AI execution</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt,.md,.csv"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateReal}
            disabled={generating}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#2A2828] hover:bg-[#333030] border border-[#373333] hover:border-[#8F0028]/50 text-white rounded-lg text-[13px] font-bold transition-all shadow-sm"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin text-[#8F0028]" /> : <Sparkles className="w-4 h-4 text-[#8F0028]" />}
            <span>{generating ? 'Generating Documents...' : 'Produce Real AI Documents'}</span>
          </button>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#2A2828] hover:bg-[#333030] border border-[#373333] text-white rounded-lg text-[13px] font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>

          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-[#8F0028] hover:bg-[#A80030] disabled:bg-[#8F0028]/50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-[#8F0028]/10 border border-[#8F0028]/50 rounded-xl text-[13px] text-white flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#8F0028] shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {loading && !documents.length ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <Loader2 className="w-8 h-8 text-[#8F0028] animate-spin mb-4" />
            <p className="text-[#E5E7EB] text-[13px]">Loading verified documents from database...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-[#373333] rounded-2xl p-10 bg-[#242222]/30">
            <div className="w-12 h-12 rounded-full bg-[#8F0028]/10 text-[#8F0028] flex items-center justify-center mb-4">
              <File className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-[16px] mb-2">No documents yet</h3>
            <p className="text-[#E5E7EB] text-[13px] max-w-md mb-6">
              Produce real AI documents with 1 click based on your website and products, or upload existing brand guidelines and marketing battlecards.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGenerateReal}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-[#8F0028] hover:bg-[#A80030] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Produce Real AI Documents
              </button>
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#242222] hover:bg-[#2A2828] text-white border border-[#373333] rounded-lg text-[13px] font-bold transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="flex items-center justify-between p-4 bg-[#242222] border border-[#373333] hover:border-[#8F0028]/60 hover:bg-[#282626] rounded-xl cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.processing_status === 'READY' ? 'bg-[#00A650]/10 text-white' :
                    ['FAILED', 'UNSUPPORTED'].includes(doc.processing_status) ? 'bg-[#8F0028]/10 text-[#8F0028]' :
                    'bg-[#A9A4A0]/10 text-[#E5E7EB]'
                  }`}>
                    {getStatusIcon(doc.processing_status)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white mb-1 group-hover:text-white transition-colors flex items-center gap-2">
                      {doc.name}
                      <span className="text-[11px] font-normal text-[#E5E7EB] px-2 py-0.5 rounded bg-[#1C1A1A] border border-[#373333]">
                        {doc.category}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-[12px] text-[#E5E7EB]">
                      <span>{formatSize(doc.file_size)}</span>
                      <span className="w-1 h-1 rounded-full bg-[#373333]"></span>
                      <span className="flex items-center gap-1 text-white">
                        <CheckCircle2 className="w-3 h-3" /> Indexed for AI
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[11px] font-medium text-[#E5E7EB] uppercase tracking-wider">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  <span className="text-[11px] text-[#8F0028] font-bold group-hover:underline">
                    View &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A1A] border border-[#373333] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#373333] pb-3">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8F0028]" />
                Create New Knowledge Document
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#E5E7EB] hover:text-white text-[16px] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Product Specifications"
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-[#242222] border border-[#373333] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-[#242222] border border-[#373333] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#8F0028]"
                  >
                    <option value="Product Information">Product Information</option>
                    <option value="Marketing Strategy">Marketing Strategy</option>
                    <option value="Brand Voice Guide">Brand Voice Guide</option>
                    <option value="Competitor Battlecards">Competitor Battlecards</option>
                    <option value="Technical Documentation">Technical Documentation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E5E7EB] mb-1">
                  Markdown Content *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="# Document Title&#10;&#10;Key architecture, capabilities, and target personas..."
                  value={createForm.content}
                  onChange={e => setCreateForm({ ...createForm, content: e.target.value })}
                  className="w-full bg-[#242222] border border-[#373333] rounded-lg p-3 text-[13px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#8F0028] font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#373333]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#373333] text-[#E5E7EB] hover:text-white rounded-lg text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-4 py-2 bg-[#8F0028] hover:bg-[#A8002F] disabled:bg-[#8F0028]/50 text-white rounded-lg text-[13px] font-bold transition-colors flex items-center gap-2"
                >
                  {savingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{savingDoc ? 'Saving...' : 'Save Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
