"use client"

import React from 'react'

export interface LogoProps {
  className?: string
  size?: number | string
}

// 1. Google Analytics 4 (GA4) - Official Multi-Bar Emblem
export const GA4Logo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    aria-label="Google Analytics 4"
  >
    <rect width="24" height="24" rx="5" fill="#202124" />
    {/* Bar 1 (Left - Yellow/Orange) */}
    <rect x="5" y="13" width="3.2" height="6" rx="1.6" fill="#F9AB00" />
    {/* Bar 2 (Middle - Orange) */}
    <rect x="10.4" y="9" width="3.2" height="10" rx="1.6" fill="#E37400" />
    {/* Bar 3 (Right - Blue) */}
    <rect x="15.8" y="5" width="3.2" height="14" rx="1.6" fill="#1A73E8" />
  </svg>
)

// 2. Google Search Console (GSC) - Official Multi-Color Shield & Magnifier
export const GSCLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Google Search Console"
  >
    <rect width="24" height="24" rx="5" fill="#202124" />
    {/* Document Base */}
    <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h5.5l5 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.5v-13z" fill="#4285F4" />
    <path d="M13 4v4a1 1 0 0 0 1 1h4l-5-5z" fill="#2A56C6" />
    {/* Search Lens overlay with Google 4-colors */}
    <circle cx="11.5" cy="13.5" r="3.5" fill="none" stroke="#F4B400" strokeWidth="1.6" />
    <path d="M14 16l3 3" stroke="#DB4437" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="11.5" cy="13.5" r="1.8" fill="#0F9D58" />
  </svg>
)

// 3. LinkedIn - Official Blue Square 'in'
export const LinkedInLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="LinkedIn"
  >
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path 
      d="M7.4 6.2a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0zm-.2 3.5H4.8v9.1h2.4V9.7zm3.8 0h-2.3v9.1h2.3v-4.8c0-1.3.2-2.5 1.8-2.5 1.5 0 1.6 1.4 1.6 2.6v4.7h2.4v-5.2c0-2.6-.6-4.5-3.5-4.5-1.5 0-2.4.8-2.8 1.5h-.1V9.7z" 
      fill="#FFFFFF" 
    />
  </svg>
)

// 4. Meta Ads / Meta - Official Solid Blue Infinity Loop
export const MetaLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Meta Ads"
  >
    <rect width="24" height="24" rx="5" fill="#1C1E21" />
    <path 
      d="M17.2 7.8c-.8 0-1.6.4-2.2 1.1-.9-1-2-1.5-3.2-1.5-2.6 0-4.6 2.1-4.6 4.7 0 2.6 2 4.7 4.6 4.7 1.2 0 2.3-.5 3.2-1.5.6.7 1.4 1.1 2.2 1.1 1.7 0 3-1.4 3-3.1 0-1.8-1.3-3.2-3-3.2zm-5.4 6.8c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5c1.1 0 2.1.7 2.4 1.8h-2.1c-.2-.4-.5-.6-.9-.6-.7 0-1.2.6-1.2 1.3s.5 1.3 1.2 1.3c.4 0 .8-.2.9-.6h2.1c-.3 1.1-1.3 1.8-2.4 1.8zm5.4.3c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" 
      fill="#0081FB" 
    />
  </svg>
)

// 5. Instagram - Official Solid Magenta Camera
export const InstagramLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Instagram"
  >
    <rect width="24" height="24" rx="6" fill="#C13584" />
    {/* Outer Camera Outline */}
    <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    {/* Inner Lens */}
    <circle cx="12" cy="12" r="3.2" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    {/* Flash Dot */}
    <circle cx="15.8" cy="8.2" r="1" fill="#FFFFFF" />
  </svg>
)

// 6. WordPress - Official Deep Blue Circle & Serif 'W'
export const WordPressLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="WordPress"
  >
    <circle cx="12" cy="12" r="11" fill="#21759B" />
    <path 
      d="M12 3a9 9 0 0 0-9 9c0 3.7 2.2 6.9 5.4 8.3L4.8 9.8c-.1-.4.2-.7.6-.7h2.1c.3 0 .6.2.7.5l2.6 8.3 1.7-5.5-1.2-3.3c-.1-.3.1-.5.4-.5h2.1c.3 0 .6.2.7.5l2.6 8.4 2.8-8.5c.1-.3.3-.4.6-.4h1.7c.4 0 .6.3.5.7L16.4 20.2A9 9 0 0 0 21 12a9 9 0 0 0-9-9zm-1.8 15.6L7.4 10.3l2.8 8.3zm3.6 0l2.8-8.3-2.8 8.3z" 
      fill="#FFFFFF" 
    />
  </svg>
)

// 7. X (Twitter) - Official Geometric X Emblem
export const XLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="X"
  >
    <rect width="24" height="24" rx="5" fill="#000000" />
    <path 
      d="M17.4 5h2.4l-5.3 6.1 6.2 8.2h-4.8l-3.8-5-4.3 5H5.4l5.6-6.5L5 5h5l3.5 4.6L17.4 5zm-.8 13h1.3L8.6 6.3H7.2L16.6 18z" 
      fill="#FFFFFF" 
    />
  </svg>
)

// 8. Reddit - Official Vibrant Orange Snoo Alien
export const RedditLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Reddit"
  >
    <circle cx="12" cy="12" r="11" fill="#FF4500" />
    {/* Antenna */}
    <circle cx="17.4" cy="6.2" r="1.4" fill="#FFFFFF" />
    <path d="M12.5 9l2.8-1 1.2 2" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Head & Ears */}
    <ellipse cx="12" cy="13.5" rx="5.5" ry="4" fill="#FFFFFF" />
    <circle cx="6.2" cy="12.5" r="1.7" fill="#FFFFFF" />
    <circle cx="17.8" cy="12.5" r="1.7" fill="#FFFFFF" />
    {/* Red Eyes */}
    <circle cx="9.8" cy="13" r="1.1" fill="#FF4500" />
    <circle cx="14.2" cy="13" r="1.1" fill="#FF4500" />
    {/* Smile */}
    <path d="M9.8 15.2c1.2.9 3.2.9 4.4 0" stroke="#FF4500" strokeWidth="1.1" strokeLinecap="round" fill="none" />
  </svg>
)

// 9. YouTube - Official Red Rounded Badge & White Play Button
export const YouTubeLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="YouTube"
  >
    <rect width="24" height="24" rx="5" fill="#202124" />
    <path 
      d="M20.5 8.2c-.2-.8-.8-1.4-1.6-1.6C17.5 6.2 12 6.2 12 6.2s-5.5 0-6.9.4c-.8.2-1.4.8-1.6 1.6C3.1 9.6 3.1 12 3.1 12s0 2.4.4 3.8c.2.8.8 1.4 1.6 1.6 1.4.4 6.9.4 6.9.4s5.5 0 6.9-.4c.8-.2 1.4-.8 1.6-1.6.4-1.4.4-3.8.4-3.8s0-2.4-.4-3.8z" 
      fill="#FF0000" 
    />
    <polygon points="10.2,9.6 15,12 10.2,14.4" fill="#FFFFFF" />
  </svg>
)

// 10. TikTok - Official Layered Cyan/Magenta Musical Note
export const TikTokLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="TikTok"
  >
    <rect width="24" height="24" rx="5" fill="#010101" />
    {/* Cyan layer offset */}
    <path 
      d="M13.2 5.5v9.1a3 3 0 1 1-2.5-3v-2.2a5.2 5.2 0 1 0 4.7 5.2V9.4a7 7 0 0 0 3.8 1.1V8.3a4.8 4.8 0 0 1-3.6-2.8h-2.4z" 
      fill="#25F4EE" 
      opacity="0.85"
      transform="translate(-0.5, -0.4)"
    />
    {/* Magenta layer offset */}
    <path 
      d="M13.2 5.5v9.1a3 3 0 1 1-2.5-3v-2.2a5.2 5.2 0 1 0 4.7 5.2V9.4a7 7 0 0 0 3.8 1.1V8.3a4.8 4.8 0 0 1-3.6-2.8h-2.4z" 
      fill="#FE2C55" 
      opacity="0.85"
      transform="translate(0.5, 0.4)"
    />
    {/* White base note */}
    <path 
      d="M13.2 5.5v9.1a3 3 0 1 1-2.5-3v-2.2a5.2 5.2 0 1 0 4.7 5.2V9.4a7 7 0 0 0 3.8 1.1V8.3a4.8 4.8 0 0 1-3.6-2.8h-2.4z" 
      fill="#FFFFFF" 
    />
  </svg>
)

// 11. GitHub - Official Octocat Silhouette
export const GitHubLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="GitHub"
  >
    <rect width="24" height="24" rx="5" fill="#181717" />
    <path 
      d="M12 4a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.7-.9-3.7-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.2 0 0 .7-.2 2.3.8a7.8 7.8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.5 1.2.2 2 .1 2.2.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.4c0 .2.2.5.5.4A8 8 0 0 0 12 4z" 
      fill="#FFFFFF" 
    />
  </svg>
)

// 12. Shopify - Official Green Bag & 'S'
export const ShopifyLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Shopify"
  >
    <rect width="24" height="24" rx="5" fill="#202124" />
    <path d="M18.8 8.4l-1.3-.4c-.1 0-.1-.1-.1-.2l-.6-4.5c0-.2-.2-.3-.4-.3l-3.2.7-.8-1.5c-.1-.2-.4-.3-.6-.1L6.7 4.9c-.2.1-.3.3-.2.5l2 14.5c0 .2.2.3.4.3h8c.2 0 .4-.2.4-.4l1.5-11.2c0-.1 0-.2 0-.2z" fill="#95BF47" />
    <path d="M11.8 10.4c-.6 0-1.1.3-1.1.8 0 .8 1.8 1 1.8 2.2 0 .8-.6 1.4-1.5 1.4-.9 0-1.5-.5-1.6-1.1l.9-.3c0 .4.3.6.7.6.4 0 .7-.2.7-.5 0-.8-1.8-1-1.8-2.1 0-.8.6-1.4 1.5-1.4.8 0 1.3.4 1.4.9l-.9.3c0-.3-.2-.5-.6-.5z" fill="#FFFFFF" />
  </svg>
)

// 13. Slack - Official 4-Color Hash Octothorpe
export const SlackLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Slack"
  >
    <rect width="24" height="24" rx="5" fill="#1A1D21" />
    {/* Blue Pill & Drop */}
    <path d="M6.8 13.2a1.4 1.4 0 0 1-1.4-1.4c0-.8.6-1.4 1.4-1.4h1.4v1.4a1.4 1.4 0 0 1-1.4 1.4z" fill="#36C5F0" />
    <path d="M9.6 13.2a1.4 1.4 0 0 1-1.4-1.4V8.2c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v3.6c0 .8-.6 1.4-1.4 1.4z" fill="#36C5F0" />
    {/* Green Pill & Drop */}
    <path d="M10.8 6.8a1.4 1.4 0 0 1-1.4-1.4c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v1.4h-1.4z" fill="#2EB67D" />
    <path d="M10.8 9.6a1.4 1.4 0 0 1-1.4-1.4c0-.8.6-1.4 1.4-1.4h3.6c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4h-3.6z" fill="#2EB67D" />
    {/* Red/Magenta Pill & Drop */}
    <path d="M17.2 10.8a1.4 1.4 0 0 1 1.4 1.4c0 .8-.6 1.4-1.4 1.4h-1.4v-1.4c0-.8.6-1.4 1.4-1.4z" fill="#E01E5A" />
    <path d="M14.4 10.8a1.4 1.4 0 0 1 1.4 1.4v3.6c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4v-3.6c0-.8.6-1.4 1.4-1.4z" fill="#E01E5A" />
    {/* Yellow/Gold Pill & Drop */}
    <path d="M13.2 17.2a1.4 1.4 0 0 1 1.4 1.4c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4v-1.4h1.4z" fill="#ECB22E" />
    <path d="M13.2 14.4a1.4 1.4 0 0 1 1.4 1.4c0 .8-.6 1.4-1.4 1.4H9.6c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4h3.6z" fill="#ECB22E" />
  </svg>
)

// 14. HubSpot - Official Orange Sprocket
export const HubSpotLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    aria-label="HubSpot"
  >
    <rect width="24" height="24" rx="5" fill="#202124" />
    <path 
      d="M16.5 8.2V6.1c.7-.3 1.2-1 1.2-1.8 0-1.1-.9-2-2-2s-2 .9-2 2c0 .8.5 1.5 1.2 1.8v2.1c-.8.2-1.5.8-1.8 1.5l-4-3.1c.1-.3.1-.5.1-.8 0-1.4-1.1-2.5-2.5-2.5S4.2 4.4 4.2 5.8s1.1 2.5 2.5 2.5c.6 0 1.2-.2 1.6-.6l3.9 3.1c-.4.8-.4 1.7 0 2.5l-2.6 2.6c-.3-.1-.6-.2-.9-.2-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5c0-.3-.1-.6-.2-.9l2.6-2.6c.7.4 1.5.5 2.3.2v2.8c-.7.3-1.2 1-1.2 1.8 0 1.1.9 2 2 2s2-.9 2-2c0-.8-.5-1.5-1.2-1.8v-2.8c1.3-.5 2.2-1.8 2.2-3.3 0-1.6-.9-2.9-2.2-3.4zm-.8 5.6c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6z" 
      fill="#FF7A59" 
    />
  </svg>
)

// 15. WhatsApp Business - Official Solid Emerald Emblem for Bharat & D2C
export const WhatsAppLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    aria-label="WhatsApp Business"
  >
    <rect width="24" height="24" rx="5" fill="#128C7E" />
    <path 
      d="M12 4a8 8 0 0 0-6.9 12L4 20l4.1-1.1A8 8 0 1 0 12 4zm4.6 11.4c-.2.6-1.1 1.1-1.6 1.1-.4 0-.9.2-2.8-.6-2.3-.9-3.7-3.3-3.8-3.5-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.8.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.5.7 1.7.8 1.8.1.2.1.3 0 .5s-.2.3-.3.4l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.3.9-1 1.1-1.4.2-.4.4-.3.7-.2.3.1 1.8.9 2.1 1 .3.2.5.3.6.4.1.2.1 1.1-.1 1.7z" 
      fill="#FFFFFF" 
    />
  </svg>
)

// 16. StandBharat Crest - Official Saffron/Burgundy Lion & Tech Emblem
export const StandBharatLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg 
    viewBox="0 0 32 32" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    aria-label="StandBharat"
  >
    <rect width="32" height="32" rx="8" fill="#1C1A1A" stroke="#373333" strokeWidth="1" />
    {/* Geometric Winged Crest in Solid Deep Burgundy */}
    <path 
      d="M16 4.5l8 4.6v9.8L16 27.5 8 18.9V9.1L16 4.5z" 
      fill="#8F0028" 
      stroke="#B30032"
      strokeWidth="1.2"
    />
    {/* Center Core in Solid Warm Amber */}
    <path 
      d="M16 9.5l4 3.5-4 9-4-9 4-3.5z" 
      fill="#E65100"
    />
    <circle cx="16" cy="15.5" r="2.2" fill="#FFFFFF" />
  </svg>
)

// Unified Platform Logo Dispatcher
export interface PlatformLogoProps extends LogoProps {
  platform: string
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({ platform, className = 'w-5 h-5', size }) => {
  const p = (platform || '').toLowerCase().trim().replace(/[-_]/g, '')
  
  if (p.includes('whatsapp') || p.includes('wa')) {
    return <WhatsAppLogo className={className} size={size} />
  }
  if (p.includes('ga4') || p.includes('googleanalytics') || p.includes('analytics')) {
    return <GA4Logo className={className} size={size} />
  }
  if (p.includes('gsc') || p.includes('searchconsole') || p.includes('googlesearch')) {
    return <GSCLogo className={className} size={size} />
  }
  if (p.includes('linkedin')) {
    return <LinkedInLogo className={className} size={size} />
  }
  if (p.includes('instagram') || p.includes('insta')) {
    return <InstagramLogo className={className} size={size} />
  }
  if (p.includes('meta') || p.includes('facebook') || p.includes('fb') || p.includes('ads')) {
    return <MetaLogo className={className} size={size} />
  }
  if (p.includes('wordpress') || p.includes('wp') || p.includes('blog')) {
    return <WordPressLogo className={className} size={size} />
  }
  if (p === 'x' || p.includes('twitter') || p.includes('tweet')) {
    return <XLogo className={className} size={size} />
  }
  if (p.includes('reddit')) {
    return <RedditLogo className={className} size={size} />
  }
  if (p.includes('youtube') || p.includes('yt')) {
    return <YouTubeLogo className={className} size={size} />
  }
  if (p.includes('tiktok')) {
    return <TikTokLogo className={className} size={size} />
  }
  if (p.includes('github') || p.includes('code') || p.includes('git')) {
    return <GitHubLogo className={className} size={size} />
  }
  if (p.includes('shopify')) {
    return <ShopifyLogo className={className} size={size} />
  }
  if (p.includes('hubspot')) {
    return <HubSpotLogo className={className} size={size} />
  }
  if (p.includes('slack')) {
    return <SlackLogo className={className} size={size} />
  }

  // Fallback to StandBharat brand crest
  return <StandBharatLogo className={className} size={size} />
}
