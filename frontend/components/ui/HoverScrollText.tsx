"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'

interface HoverScrollTextProps {
  text?: string
  children?: React.ReactNode
  className?: string
  wrapperClassName?: string
  speed?: number // pixels per second
  title?: string
}

export function HoverScrollText({
  text,
  children,
  className = "",
  wrapperClassName = "",
  speed = 40,
  title
}: HoverScrollTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflowDistance, setOverflowDistance] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const content = text ?? children
  const stringRepresentation = typeof text === 'string' ? text : (typeof children === 'string' ? children : '')

  const checkOverflow = useCallback(() => {
    if (!containerRef.current || !textRef.current) return
    const containerWidth = containerRef.current.clientWidth
    const textWidth = textRef.current.scrollWidth
    const diff = textWidth - containerWidth
    if (diff > 2) {
      setOverflowDistance(diff)
    } else {
      setOverflowDistance(0)
    }
  }, [])

  useEffect(() => {
    checkOverflow()
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      checkOverflow()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [stringRepresentation, checkOverflow])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Listen on container or parent interactive element (button, a, role=button, data-hover-group)
    const interactiveParent = el.closest('button, a, [role="button"], [data-hover-group="true"]') || el

    const handleEnter = () => setIsHovered(true)
    const handleLeave = () => setIsHovered(false)

    interactiveParent.addEventListener('mouseenter', handleEnter)
    interactiveParent.addEventListener('mouseleave', handleLeave)
    if (interactiveParent !== el) {
      el.addEventListener('mouseenter', handleEnter)
      el.addEventListener('mouseleave', handleLeave)
    }

    return () => {
      interactiveParent.removeEventListener('mouseenter', handleEnter)
      interactiveParent.removeEventListener('mouseleave', handleLeave)
      if (interactiveParent !== el) {
        el.removeEventListener('mouseenter', handleEnter)
        el.removeEventListener('mouseleave', handleLeave)
      }
    }
  }, [])

  // Duration scales dynamically with overflow distance for comfortable reading speed
  const duration = Math.max(2.2, Math.min(6, 1.4 + overflowDistance / speed))

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap min-w-0 max-w-full ${wrapperClassName}`}
      title={title || stringRepresentation || undefined}
    >
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap transition-transform duration-300 ${className} ${
          overflowDistance > 0 && isHovered
            ? 'animate-marquee-hover'
            : overflowDistance > 0
            ? 'truncate max-w-full'
            : ''
        }`}
        style={
          overflowDistance > 0
            ? ({
                '--marquee-distance': `-${overflowDistance + 6}px`,
                '--marquee-duration': `${duration}s`
              } as React.CSSProperties)
            : undefined
        }
      >
        {content}
      </span>
    </div>
  )
}
