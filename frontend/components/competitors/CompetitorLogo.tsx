"use client"

import React, { useState } from 'react'

export interface CompetitorLogoProps {
  name: string
  websiteUrl?: string | null
  className?: string
  size?: number
}

// Vector logos for prominent Indian & global competitors
const PractoLogo = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="Practo">
    <rect width="32" height="32" rx="8" fill="#141E33" />
    <circle cx="16" cy="16" r="10" fill="#28328C" />
    <path d="M16 10v12M10 16h12" stroke="#00D2D2" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const HealthKartLogo = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="HealthKart">
    <rect width="32" height="32" rx="8" fill="#001829" />
    <circle cx="16" cy="16" r="11" fill="#009688" />
    <path d="M11 11v10M21 11v10M11 16h10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const ApolloLogo = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="Apollo 24/7">
    <rect width="32" height="32" rx="8" fill="#2B0A12" />
    <path d="M16 6c-3 4-6 7-6 11 0 3.3 2.7 6 6 6s6-2.7 6-6c0-4-3-7-6-11z" fill="#FF5E14" />
    <path d="M16 13c-1.5 2-3 3.5-3 5.5 0 1.7 1.3 3 3 3s3-1.3 3-3c0-2-1.5-3.5-3-5.5z" fill="#FFC107" />
  </svg>
)

const Tata1mgLogo = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="Tata 1mg">
    <rect width="32" height="32" rx="8" fill="#1A1818" />
    <rect x="7" y="10" width="18" height="12" rx="6" fill="#E23E45" />
    <path d="M16 10v12" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="11.5" cy="16" r="2" fill="#FFFFFF" />
  </svg>
)

const SemrushLogo = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="Semrush">
    <rect width="32" height="32" rx="8" fill="#171A22" />
    <path d="M7 16l6-8 3 4-5 7 5 3-9 2z" fill="#FF642D" />
  </svg>
)

export const CompetitorLogo: React.FC<CompetitorLogoProps> = ({ 
  name, 
  websiteUrl, 
  className = 'w-9 h-9',
  size = 36 
}) => {
  const [imgError, setImgError] = useState(false)
  const normName = (name || '').toLowerCase()

  // 1. Check known brand match first
  if (normName.includes('practo')) {
    return <PractoLogo className={className} />
  }
  if (normName.includes('healthkart')) {
    return <HealthKartLogo className={className} />
  }
  if (normName.includes('apollo')) {
    return <ApolloLogo className={className} />
  }
  if (normName.includes('1mg') || normName.includes('tata')) {
    return <Tata1mgLogo className={className} />
  }
  if (normName.includes('semrush')) {
    return <SemrushLogo className={className} />
  }

  // 2. Extract domain from website_url or name
  let domain = ''
  if (websiteUrl) {
    try {
      const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      domain = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      domain = websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    }
  } else if (normName.includes('.')) {
    domain = normName
  }

  // 3. Render real favicon if domain exists and hasn't errored
  if (domain && !imgError) {
    return (
      <div 
        className={`${className} rounded-lg bg-[#242222] border border-[#373333] flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm`}
        style={{ width: size, height: size }}
      >
        <img 
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={`${name} logo`}
          className="w-full h-full object-contain rounded-sm"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  // 4. Elegant monogram fallback
  const initials = (name || 'CO')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <div 
      className={`${className} rounded-lg bg-gradient-to-br from-[#8F0028]/40 to-[#242222] border border-[#373333] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
}
