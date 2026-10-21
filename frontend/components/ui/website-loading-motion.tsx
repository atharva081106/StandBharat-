"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

export interface WebsiteLoadingMotionProps {
  /** If true, fills the entire viewport with a dark solid overlay. Default true */
  fullscreen?: boolean
  /** If true, renders as an inline container for embedding inside cards or dashboard sections */
  inline?: boolean
  /** Primary title text or brand label. Defaults to undefined (clean visual-only mode) */
  title?: string
  /** Subtitle description (optional) */
  subtitle?: string
  /** If true, simulates 0-100% progress for realistic UX loading. Default true */
  simulateProgress?: boolean
  /** Duration in ms for simulated loading progression. Default 5000ms (5 seconds) */
  targetDurationMs?: number
  /** Callback fired when simulated progress reaches 100% */
  onFinish?: () => void
  /** Custom operational milestones (kept for backward compatibility) */
  customSteps?: string[]
  /** Whether to show the bottom agent cluster. Kept for backward compatibility */
  showAgentCluster?: boolean
}

export function WebsiteLoadingMotion({
  fullscreen = true,
  inline = false,
  title,
  simulateProgress = true,
  targetDurationMs = 5000,
  onFinish
}: WebsiteLoadingMotionProps) {
  const [progress, setProgress] = useState(0)

  const onFinishRef = React.useRef(onFinish)
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    if (!simulateProgress) {
      setProgress(50)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentPct = Math.min(100, Math.floor((elapsed / targetDurationMs) * 100))
      setProgress(currentPct)

      if (elapsed >= targetDurationMs) {
        clearInterval(interval)
        setProgress(100)
        if (onFinishRef.current) {
          setTimeout(() => {
            onFinishRef.current?.()
          }, 120)
        }
      }
    }, 35)

    return () => clearInterval(interval)
  }, [simulateProgress, targetDurationMs])

  const content = (
    <div className={`relative z-10 flex flex-col items-center justify-center text-center ${inline ? 'p-10' : 'p-6'}`}>
      
      {/* ======================================================== */}
      {/* 1. CENTRAL NEURAL APERTURE & ORBITAL CORE */}
      {/* ======================================================== */}
      <div className="relative w-44 h-44 flex items-center justify-center mb-8">
        
        {/* Soft Ambient Radial Halo (Subtle Muted Burgundy) */}
        <div className="absolute inset-4 rounded-full bg-[#521320]/15 blur-2xl pointer-events-none" />

        {/* Outer Fine Muted Ring with subtle pulse */}
        <div className="absolute inset-0 rounded-full border border-[#2B2727] animate-pulse-ring pointer-events-none" />
        
        {/* Counter-Rotating Segmented Aperture (Subtle Graphite) */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#3D3737] animate-spin-reverse-slow pointer-events-none opacity-60" />
        
        {/* Clockwise Precision Arc Ring with Subtle Off-White / Muted Burgundy Tips */}
        <div className="absolute inset-5 rounded-full border-2 border-transparent border-t-[#D4CECE]/70 border-r-[#7A1D31]/80 animate-spin-slow pointer-events-none" />

        {/* Subtle Conic Radar Sweep */}
        <div className="absolute inset-7 rounded-full overflow-hidden pointer-events-none opacity-25">
          <div className="w-full h-full animate-radar-sweep origin-center bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(255,255,255,0.2)_360deg)]" />
        </div>

        {/* Central Core Well */}
        <div className="absolute inset-9 rounded-full bg-[#181616] border border-[#2B2727] shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center justify-center" />

        {/* Central Brand Nucleus with Logo Icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#141212] border border-[#363131] shadow-xl flex items-center justify-center p-3">
          <Image 
            src="/logo-icon.png" 
            alt="StandBharat Logo" 
            width={38} 
            height={38}
            className="w-9 h-9 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] animate-pulse"
            priority
          />
        </div>

        {/* 4 Subtle Orbital Beacons (Muted Warm Accents) */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#8E8A85] border border-[#141212]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#8E8A85] border border-[#141212]" />
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#8E8A85] border border-[#141212]" />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7A1D31] border border-[#141212] shadow-[0_0_6px_#7A1D31]" />
      </div>

      {/* ======================================================== */}
      {/* 2. SLEEK MINIMAL PROGRESS TRACK & PERCENTAGE */}
      {/* ======================================================== */}
      <div className="w-64 sm:w-72 space-y-3">
        {/* Progress Bar Container */}
        <div className="relative w-full h-1.5 rounded-full bg-[#201D1D] border border-[#2B2727] overflow-hidden">
          {/* Active Fill */}
          <div 
            className="h-full rounded-full bg-[#ECE8E4] transition-all duration-100 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Subtle Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7A1D31]/40 to-transparent animate-shimmer-slide" />
          </div>
        </div>

        {/* Clean Subtle Monospace Indicator (Visual percentage only) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#E5E7EB] tracking-wider px-0.5">
          <span className="opacity-60 uppercase">{title || "StandBharat"}</span>
          <span className="text-[#ECE8E4] font-medium">{progress}%</span>
        </div>
      </div>

    </div>
  )

  if (inline) {
    return (
      <div className="w-full rounded-2xl bg-[#141212] border border-[#262323] shadow-lg overflow-hidden relative">
        {content}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#141212] flex items-center justify-center overflow-hidden animate-in fade-in duration-300">
      {/* Subtle solid tech background grid texture */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      {content}
    </div>
  )
}
