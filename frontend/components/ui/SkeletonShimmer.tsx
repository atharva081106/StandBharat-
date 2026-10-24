"use client"

import React from 'react'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-shimmer rounded-lg ${className}`} />
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-[#201D1D] border border-[#332E2E] rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-[96px] animate-pulse">
      <Skeleton className="h-3 w-28 mb-3" />
      <div className="space-y-2 mt-auto">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function AgentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent bg-[#201D1D] animate-pulse">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-12" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

export function DocumentItemSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#201D1D] animate-pulse">
      <Skeleton className="w-4 h-4 rounded shrink-0" />
      <Skeleton className="h-3 w-36 flex-1" />
    </div>
  )
}
