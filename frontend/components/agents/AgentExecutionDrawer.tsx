"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  X, Play, CheckCircle2, Loader2, Sparkles, Terminal, 
  ArrowRight, ShieldCheck, Zap, RefreshCw, ExternalLink,
  ChevronRight, Minimize2, Maximize2
} from 'lucide-react'
import { AgentLogo } from '@/components/agents/AgentLogo'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

export interface AgentExecutionState {
  agentId: string
  agentName: string
  category: string
  taskDescription: string
}

interface AgentExecutionDrawerProps {
  execution: AgentExecutionState | null
  onClose: () => void
  onOpenApprovals?: () => void
}

interface ExecutionLog {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warn' | 'stream'
}

export function AgentExecutionDrawer({
  execution,
  onClose,
  onOpenApprovals
}: AgentExecutionDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!execution) {
      setCurrentStep(1)
      setLogs([])
      setIsCompleted(false)
      return
    }

    // Reset and start automated simulated execution
    setCurrentStep(1)
    setIsCompleted(false)
    const initialLogs: ExecutionLog[] = [
      { timestamp: '00:01', message: `Initializing runtime container for ${execution.agentName}...`, type: 'info' },
      { timestamp: '00:02', message: 'Grounding against active Brand Brain DNA and indexed documents...', type: 'info' }
    ]
    setLogs(initialLogs)

    const timer1 = setTimeout(() => {
      setCurrentStep(2)
      setLogs(prev => [
        ...prev,
        { timestamp: '00:04', message: 'Brand grounding verified (match confidence: 99.2%).', type: 'success' },
        { timestamp: '00:05', message: `Synthesizing task: "${execution.taskDescription}"...`, type: 'stream' },
        { timestamp: '00:07', message: 'Generating multi-variant copy tokens with localized tone calibration...', type: 'stream' }
      ])
    }, 1200)

    const timer2 = setTimeout(() => {
      setCurrentStep(3)
      setLogs(prev => [
        ...prev,
        { timestamp: '00:09', message: 'Generated 3 high-conviction creative variants.', type: 'success' },
        { timestamp: '00:10', message: 'Running automated brand voice guardrails & hallucination checks...', type: 'info' },
        { timestamp: '00:11', message: 'Safety validation passed: 0 risk flags detected.', type: 'success' }
      ])
    }, 2800)

    const timer3 = setTimeout(() => {
      setCurrentStep(4)
      setIsCompleted(true)
      setLogs(prev => [
        ...prev,
        { timestamp: '00:13', message: 'Exporting final artifacts into Fast Approvals Queue...', type: 'info' },
        { timestamp: '00:14', message: 'Autonomous task execution finished successfully.', type: 'success' }
      ])
    }, 4200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [execution])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (!execution) return null

  const STEPS = [
    { num: 1, title: 'Grounding & Signals', desc: 'Pulling Brand Brain DNA & competitors' },
    { num: 2, title: 'Autonomous Synthesis', desc: 'Synthesizing creative variations' },
    { num: 3, title: 'Guardrail Audit', desc: 'Validating tone and compliance' },
    { num: 4, title: 'Artifact Delivery', desc: 'Dispatched to Approvals Queue' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg h-full bg-[#1C1A1A] border-l border-[#373333] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#2E2A2A] flex items-center justify-between bg-[#201D1D] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <AgentLogo id={execution.agentId} name={execution.agentName} size="md" showRing={!isCompleted} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <HoverScrollText 
                  text={execution.agentName} 
                  className="text-sm font-bold text-white block" 
                />
                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                  isCompleted 
                    ? 'bg-[#16291C] text-[#00A650] border border-[#1E4D2B]'
                    : 'bg-[#2E181D] text-[#FF4560] border border-[#8F0028]/50'
                }`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#00A650]" />
                      Finished
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4560] animate-pulse" />
                      Live Stream
                    </>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-[#A39E9E] truncate block mt-0.5">
                {execution.category}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A39E9E] hover:text-white hover:bg-[#2A2828] transition-colors cursor-pointer"
            title="Close Drawer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {/* Active Goal / Prompt Card */}
          <div className="p-3.5 rounded-xl bg-[#242222] border border-[#373333] space-y-1">
            <span className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider block">
              Autonomous Objective
            </span>
            <p className="text-xs text-white font-medium leading-relaxed">
              {execution.taskDescription}
            </p>
          </div>

          {/* 4 Execution Steps Tracker */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#A39E9E] uppercase tracking-wider block px-1">
              Live Pipeline Stages
            </span>
            <div className="space-y-2">
              {STEPS.map((st) => {
                const isStepDone = currentStep > st.num || isCompleted
                const isStepRunning = currentStep === st.num && !isCompleted
                return (
                  <div 
                    key={st.num}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isStepRunning
                        ? 'bg-[#29171C] border-[#8F0028] shadow-md shadow-[#8F0028]/20'
                        : isStepDone
                        ? 'bg-[#201D1D] border-[#302B2B]'
                        : 'bg-[#1C1A1A] border-[#2A2626] opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isStepDone 
                          ? 'bg-[#16291C] text-[#00A650] border border-[#1E4D2B]'
                          : isStepRunning
                          ? 'bg-[#8F0028] text-white animate-pulse'
                          : 'bg-[#262323] text-[#A39E9E]'
                      }`}>
                        {isStepDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{st.title}</div>
                        <div className="text-[10.5px] text-[#A39E9E] truncate">{st.desc}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-[10px] font-mono">
                      {isStepDone ? (
                        <span className="text-[#00A650] font-bold">Done ✓</span>
                      ) : isStepRunning ? (
                        <span className="text-[#FF4560] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Running
                        </span>
                      ) : (
                        <span className="text-[#6E6A67]">Waiting</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Real-time Telemetry Stream Terminal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[10.5px]">
              <span className="font-bold text-[#A39E9E] uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#8F0028]" /> Agent Telemetry Console
              </span>
              <span className="text-[#00A650] font-mono font-semibold">stdout: connected</span>
            </div>
            
            <div className="bg-[#121111] border border-[#2D2A2A] rounded-xl p-3.5 h-48 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1.5 text-[#E5E7EB]">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#6E6A67] select-none shrink-0 font-mono text-[10px] pt-0.5">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'success' 
                      ? 'text-[#00A650]' 
                      : log.type === 'warn'
                      ? 'text-[#F5A623]'
                      : log.type === 'stream'
                      ? 'text-[#38BDF8]'
                      : 'text-[#E5E7EB]'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
              {!isCompleted && (
                <div className="flex items-center gap-1 text-[#8F0028] pt-1">
                  <span className="inline-block w-2 h-3.5 bg-[#8F0028] animate-pulse" />
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2E2A2A] bg-[#201D1D] shrink-0 flex items-center gap-2.5">
          {isCompleted ? (
            <>
              <button
                onClick={() => {
                  onClose()
                  if (onOpenApprovals) onOpenApprovals()
                }}
                className="flex-1 py-2.5 bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#8F0028]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Review Generated Deliverables</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="px-3.5 py-2.5 bg-[#262323] hover:bg-[#302B2B] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#262323] hover:bg-[#302B2B] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 text-[#A39E9E]" />
              <span>Let Run in Background</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
