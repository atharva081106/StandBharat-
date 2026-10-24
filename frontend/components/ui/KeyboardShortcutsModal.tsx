"use client"

import React, { useEffect } from 'react'
import { X, Command, Keyboard, Sparkles, Zap, ArrowRight } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  keys: string[]
  label: string
  category: 'NAVIGATION' | 'ACTIONS' | 'SYSTEM'
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['⌘', 'K'], label: 'Open Command Palette & Global Search', category: 'SYSTEM' },
  { keys: ['⌘', 'J'], label: 'Focus AI CMO Executive Chat', category: 'ACTIONS' },
  { keys: ['?'], label: 'Show Keyboard Shortcuts Cheatsheet', category: 'SYSTEM' },
  { keys: ['Esc'], label: 'Close Active Modal / Slide-over', category: 'SYSTEM' },
  { keys: ['1'], label: 'Jump to Grounding (Brand Brain Knowledge)', category: 'NAVIGATION' },
  { keys: ['2'], label: 'Jump to Telemetry (Command Center & GA4)', category: 'NAVIGATION' },
  { keys: ['3'], label: 'Jump to Fleet (15 Autonomous Agents)', category: 'NAVIGATION' },
  { keys: ['4'], label: 'Jump to AI CMO (Strategic Copilot)', category: 'NAVIGATION' },
  { keys: ['A'], label: 'Open Deliverable Approvals Slide-Over', category: 'ACTIONS' },
  { keys: ['S'], label: 'Launch Autonomous Marketing Sprint', category: 'ACTIONS' }
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const navigationShortcuts = SHORTCUTS.filter(s => s.category === 'NAVIGATION')
  const actionShortcuts = SHORTCUTS.filter(s => s.category === 'ACTIONS')
  const systemShortcuts = SHORTCUTS.filter(s => s.category === 'SYSTEM')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#1C1A1A] border border-[#373333] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2E2A2A] flex items-center justify-between bg-[#201D1D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8F0028] to-[#B80033] text-white flex items-center justify-center shadow-md">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Keyboard Shortcuts
                <span className="text-[10px] font-semibold text-[#8F0028] bg-[#8F0028]/15 border border-[#8F0028]/30 px-2 py-0.5 rounded-full">
                  Power User
                </span>
              </h3>
              <p className="text-[11px] text-[#A39E9E]">Navigate StandBharat at maximum velocity</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A39E9E] hover:text-white hover:bg-[#2A2828] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Section: Panes & Navigation */}
          <div>
            <h4 className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#8F0028]" /> 4-Pane Navigation
            </h4>
            <div className="space-y-1.5">
              {navigationShortcuts.map((s, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#242222] border border-[#332E2E] text-xs hover:border-[#474040] transition-colors"
                >
                  <span className="text-white font-medium">{s.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map((k, kidx) => (
                      <kbd 
                        key={kidx} 
                        className="font-mono text-[11px] font-bold text-white bg-[#1A1818] border border-[#3E3838] px-2 py-0.5 rounded shadow-sm min-w-[24px] text-center"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Fast Workflow Actions */}
          <div>
            <h4 className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#8F0028]" /> Actions & Autonomous Loops
            </h4>
            <div className="space-y-1.5">
              {actionShortcuts.map((s, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#242222] border border-[#332E2E] text-xs hover:border-[#474040] transition-colors"
                >
                  <span className="text-white font-medium">{s.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map((k, kidx) => (
                      <kbd 
                        key={kidx} 
                        className="font-mono text-[11px] font-bold text-white bg-[#1A1818] border border-[#3E3838] px-2 py-0.5 rounded shadow-sm min-w-[24px] text-center"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: System & Quick Controls */}
          <div>
            <h4 className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Command className="w-3 h-3 text-[#8F0028]" /> System Controls
            </h4>
            <div className="space-y-1.5">
              {systemShortcuts.map((s, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#242222] border border-[#332E2E] text-xs hover:border-[#474040] transition-colors"
                >
                  <span className="text-white font-medium">{s.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map((k, kidx) => (
                      <kbd 
                        key={kidx} 
                        className="font-mono text-[11px] font-bold text-white bg-[#1A1818] border border-[#3E3838] px-2 py-0.5 rounded shadow-sm min-w-[24px] text-center"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2E2A2A] bg-[#201D1D] flex items-center justify-between text-[11px] text-[#A39E9E]">
          <span>Tip: Press <kbd className="font-mono text-[10px] text-white bg-[#1A1818] px-1.5 py-0.5 rounded border border-[#373333]">?</kbd> anywhere to toggle this cheatsheet</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#2A2828] text-white hover:bg-[#343030] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
