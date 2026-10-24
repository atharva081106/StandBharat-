"use client"

import React, { useState } from 'react'
import { 
  X, Zap, Play, CheckCircle2, Loader2, ArrowRight, 
  Sparkles, Layers, ShieldCheck, Flame, Rocket, RefreshCw,
  ExternalLink, FileText
} from 'lucide-react'
import { AgentLogo } from '@/components/agents/AgentLogo'
import { HoverScrollText } from '@/components/ui/HoverScrollText'

interface AutonomousSprintModalProps {
  isOpen: boolean
  onClose: () => void
  onSprintComplete?: (sprintName: string) => void
  onOpenApprovals?: () => void
}

interface SprintStep {
  agentId: string
  name: string
  task: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED'
}

interface SprintPlaybook {
  id: string
  title: string
  description: string
  badge: string
  estimatedTime: string
  steps: SprintStep[]
}

const PLAYBOOKS: SprintPlaybook[] = [
  {
    id: 'launch_sprint',
    title: 'New Product Launch & Positioning Sprint',
    description: 'Comprehensive 5-agent coordinated sprint to benchmark competitors, architect launch pillars, write viral hooks, and prep multi-channel social distribution.',
    badge: 'Flagship Multi-Agent Sprint',
    estimatedTime: '2 mins (Autonomous)',
    steps: [
      { agentId: 'competitor', name: 'Competitor Radar & Spy Agent', task: 'Benchmarking top 3 competitors for pricing & feature gaps', status: 'PENDING' },
      { agentId: 'content_strategy', name: 'Content Strategy & Roadmap Agent', task: 'Formulating 30-day launch roadmap and pillar topics', status: 'PENDING' },
      { agentId: 'content_writer', name: 'High-Velocity Content Writer Agent', task: 'Drafting 5 viral hook variations and launch announcement copy', status: 'PENDING' },
      { agentId: 'ugc', name: 'UGC & Video Hook Studio', task: 'Scripting 3-second short-form video storyboards', status: 'PENDING' },
      { agentId: 'linkedin', name: 'LinkedIn Thought Leadership Agent', task: 'Generating multi-slide B2B launch carousel', status: 'PENDING' },
    ]
  },
  {
    id: 'organic_sprint',
    title: '7-Day Organic Search & AI Answer Engine (GEO) Sprint',
    description: 'Optimize on-page technical factors, boost AI answer citations on Perplexity and ChatGPT Search, and formulate landing page conversion rate experiments.',
    badge: 'Organic Traffic Multiplier',
    estimatedTime: '90s (Autonomous)',
    steps: [
      { agentId: 'seo', name: 'SEO & Topical Authority Agent', task: 'On-page crawl, heading hierarchy, and meta tag optimization', status: 'PENDING' },
      { agentId: 'geo', name: 'AI Answer Engine (GEO) Agent', task: 'Indexing semantic entity markup for Perplexity & ChatGPT', status: 'PENDING' },
      { agentId: 'growth', name: 'CRO & Growth Experiment Agent', task: 'Detecting signup friction and formulating 2 high-impact A/B tests', status: 'PENDING' },
    ]
  },
  {
    id: 'paid_sprint',
    title: 'High-ROI Paid Acquisition & Telemetry Sprint',
    description: 'Draft high-converting ad creative angles, generate structured programmatic landing schemas, and align revenue attribution models.',
    badge: 'Paid Acquisition & ROAS',
    estimatedTime: '90s (Autonomous)',
    steps: [
      { agentId: 'performance', name: 'Paid Ads & PPC Performance Agent', task: 'Generating Google Search copy & Meta hook angles', status: 'PENDING' },
      { agentId: 'coding', name: 'Technical Marketing & Code Agent', task: 'Building validated JSON-LD schemas and landing page tags', status: 'PENDING' },
      { agentId: 'analytics', name: 'Multi-Touch Revenue Attribution', task: 'Calibrating multi-touch pipeline attribution & CAC calculations', status: 'PENDING' },
    ]
  }
]

export function AutonomousSprintModal({
  isOpen,
  onClose,
  onSprintComplete,
  onOpenApprovals
}: AutonomousSprintModalProps) {
  const [selectedPlaybookIndex, setSelectedPlaybookIndex] = useState(0)
  const [activeSprint, setActiveSprint] = useState<SprintPlaybook | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  if (!isOpen) return null

  const currentPlaybook = activeSprint || PLAYBOOKS[selectedPlaybookIndex]

  const handleStartSprint = () => {
    // Deep clone playbook steps so state is fresh
    const playbookCopy = JSON.parse(JSON.stringify(PLAYBOOKS[selectedPlaybookIndex]))
    setActiveSprint(playbookCopy)
    setIsRunning(true)
    setIsCompleted(false)
    setCurrentStepIndex(0)

    // Execute steps sequentially with real simulated delays
    playbookCopy.steps[0].status = 'RUNNING'

    const executeStep = (stepIdx: number) => {
      if (stepIdx >= playbookCopy.steps.length) {
        setIsRunning(false)
        setIsCompleted(true)
        onSprintComplete?.(playbookCopy.title)
        return
      }

      playbookCopy.steps[stepIdx].status = 'RUNNING'
      setCurrentStepIndex(stepIdx)
      setActiveSprint({ ...playbookCopy })

      const stepDuration = 1800 + Math.random() * 800

      setTimeout(() => {
        playbookCopy.steps[stepIdx].status = 'COMPLETED'
        setActiveSprint({ ...playbookCopy })

        if (stepIdx + 1 < playbookCopy.steps.length) {
          executeStep(stepIdx + 1)
        } else {
          setIsRunning(false)
          setIsCompleted(true)
          onSprintComplete?.(playbookCopy.title)
        }
      }, stepDuration)
    }

    setTimeout(() => {
      executeStep(0)
    }, 400)
  }

  const handleReset = () => {
    setActiveSprint(null)
    setIsRunning(false)
    setIsCompleted(false)
    setCurrentStepIndex(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#1C1A1A] border border-[#373333] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#373333] flex items-center justify-between bg-[#201D1D] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 bg-[#8F0028] text-white rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Autonomous Sprint
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-white bg-[#282424] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#3A3535]">
              {isRunning ? 'In Progress' : isCompleted ? 'Completed' : 'Select Playbook'}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-[#E5E7EB] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2727] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          
          {!isRunning && !isCompleted ? (
            <>
              {/* Playbook Selectors */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Available Multi-Agent Playbooks:
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {PLAYBOOKS.map((pb, idx) => {
                    const isSelected = selectedPlaybookIndex === idx
                    return (
                      <div
                        key={pb.id}
                        onClick={() => setSelectedPlaybookIndex(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#242222] border-[#8F0028] shadow-lg shadow-[#8F0028]/10 ring-1 ring-[#8F0028]'
                            : 'bg-[#201D1D] border-[#332F2F] hover:border-[#443F3F]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#1C1A1A] px-2.5 py-0.5 rounded-full border border-[#373333] mb-1.5 inline-block">
                              {pb.badge}
                            </span>
                            <h4 className="text-sm font-bold text-white">{pb.title}</h4>
                          </div>
                          <span className="text-[11px] text-[#E5E7EB] shrink-0 font-medium">
                            {pb.estimatedTime}
                          </span>
                        </div>
                        <p className="text-xs text-[#E5E7EB] leading-relaxed mb-3">
                          {pb.description}
                        </p>

                        {/* Agents Involved Mini Badges */}
                        <div className="flex items-center gap-2 pt-1 border-t border-[#2C2727]">
                          <span className="text-[10px] font-semibold text-[#E5E7EB]">Agents:</span>
                          <div className="flex items-center -space-x-1.5">
                            {pb.steps.map((st) => (
                              <AgentLogo 
                                key={st.agentId} 
                                id={st.agentId} 
                                size="sm" 
                                showRing={false} 
                                className="w-6 h-6 !rounded-md border-[#262121] shadow-sm" 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-white font-medium ml-2">
                            {pb.steps.length} coordinated agents
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Execution Summary Box */}
              <div className="p-4 rounded-2xl bg-[#201D1D] border border-[#302B2B] text-xs text-[#E5E7EB] space-y-2">
                <span className="font-bold text-white block">Autonomous Execution Protocol:</span>
                <p>• All agents execute using your verified Brand Brain context and active audience pain points.</p>
                <p>• Generated deliverables are deposited into your Approvals Queue for quality sign-off before publishing.</p>
              </div>
            </>
          ) : (
            /* Running / Completed Pipeline View */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-white">{currentPlaybook.title}</h3>
                <p className="text-xs text-[#E5E7EB]">
                  {isRunning ? 'Agents are executing autonomous marketing workflows...' : 'All sprint agents executed successfully!'}
                </p>
              </div>

              {/* Steps Progress Timeline */}
              <div className="space-y-3">
                {currentPlaybook.steps.map((step, idx) => {
                  const isDone = step.status === 'COMPLETED'
                  const isCurrent = step.status === 'RUNNING'

                  return (
                    <div
                      key={step.agentId + idx}
                      data-hover-group="true"
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isCurrent
                          ? 'bg-[#242222] border-[#8F0028] shadow-md shadow-[#8F0028]/20'
                          : isDone
                          ? 'bg-[#242222] border-[#373333]'
                          : 'bg-[#201D1D] border-[#2C2828] opacity-60'
                      }`}
                    >
                      <AgentLogo 
                        id={step.agentId} 
                        name={step.name} 
                        size="md" 
                        showRing={isCurrent} 
                        className={isCurrent ? 'animate-pulse' : ''} 
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <HoverScrollText text={step.name} className="text-xs font-bold text-white block" />
                          <span className="shrink-0 text-[10px] font-bold">
                            {isDone ? (
                              <span className="text-white bg-[#1C1A1A] border border-[#373333] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-white" /> Complete
                              </span>
                            ) : isCurrent ? (
                              <span className="text-white bg-[#1C1A1A] border border-[#8F0028]/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin text-white" /> Executing...
                              </span>
                            ) : (
                              <span className="text-[#E5E7EB] bg-[#1C1A1A] border border-[#332E2E] px-2 py-0.5 rounded-full">
                                Queued
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-[#E5E7EB] mt-1 leading-snug">
                          {step.task}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {isCompleted && (
                <div className="p-4 rounded-2xl bg-[#242222] border border-[#373333] text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
                  <h4 className="text-sm font-bold text-white">Campaign Sprint Completed!</h4>
                  <p className="text-xs text-[#E5E7EB] max-w-md mx-auto">
                    New deliverables (launch hooks, competitor counter-battlecards & 30-day pillar clusters) have been deposited into your Fast Approvals Queue.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#373333] bg-[#201D1D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0 safe-area-pb">
          {!isRunning && !isCompleted ? (
            <>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-semibold border border-[#3E3838] transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>

              <button
                onClick={handleStartSprint}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#8F0028]/25 transition-all transform active:scale-95 cursor-pointer order-1 sm:order-2"
              >
                <span>Launch Autonomous Sprint</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </>
          ) : isCompleted ? (
            <>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#282424] hover:bg-[#332E2E] text-white text-xs font-semibold border border-[#3E3838] transition-colors order-2 sm:order-1"
              >
                Configure Another Sprint
              </button>

              <button
                onClick={() => { onClose(); onOpenApprovals?.(); }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8F0028] hover:bg-[#A8002F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#8F0028]/30 transition-all cursor-pointer order-1 sm:order-2"
              >
                <span>Review Generated Drafts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs text-[#E5E7EB]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                Executing step {currentStepIndex + 1} of {currentPlaybook.steps.length}...
              </span>
              <span className="font-mono text-white text-[11px]">Engine Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
