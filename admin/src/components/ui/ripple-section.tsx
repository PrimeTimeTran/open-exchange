'use client'

import React, { useState, useRef } from 'react'

interface RippleSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  themes?: string[]
  children?: React.ReactNode
}

export function RippleSection({
  themes = ['#FFFFFF', '#000000'],
  className,
  children,
  ...props
}: RippleSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [isRippling, setIsRippling] = useState(false)
  const [ripple, setRipple] = useState({ x: 0, y: 0, radius: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on an interactive element (button, link, input), don't trigger ripple
    // This is a heuristic; might need refinement
    const target = e.target as HTMLElement
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'OPTION' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('select')
    ) {
      return
    }

    if (isRippling || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate distance to farthest corner
    const dists = [
      Math.hypot(x, y), // top-left
      Math.hypot(rect.width - x, y), // top-right
      Math.hypot(x, rect.height - y), // bottom-left
      Math.hypot(rect.width - x, rect.height - y), // bottom-right
    ]
    const maxRadius = Math.max(...dists)

    // Determine next color index
    const newNextIndex = (currentIndex + 1) % themes.length
    setNextIndex(newNextIndex)

    // Set initial ripple state (0 radius)
    setRipple({ x, y, radius: 0 })
    setIsRippling(true)

    // Trigger animation in next frame (double RAF to ensure browser paints initial state)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRipple({ x, y, radius: maxRadius })
      })
    })
  }

  const onTransitionEnd = () => {
    setCurrentIndex(nextIndex)
    setIsRippling(false)
    setRipple((prev) => ({ ...prev, radius: 0 }))
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className || ''}`}
      onClick={handleClick}
      {...props}
    >
      {/* Current Background */}
      <div
        className='absolute inset-0 z-0'
        style={{ backgroundColor: themes[currentIndex] }}
      />

      {/* Ripple Background */}
      <div
        className='absolute inset-0 z-10'
        style={{
          backgroundColor: themes[nextIndex],
          clipPath: `circle(${ripple.radius}px at ${ripple.x}px ${ripple.y}px)`,
          transition: isRippling
            ? 'clip-path 1s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none',
        }}
        onTransitionEnd={onTransitionEnd}
      />

      {/* Content */}
      <div className='relative z-20 pointer-events-none h-full w-full'>
        <div className='pointer-events-auto h-full w-full'>{children}</div>
      </div>
    </div>
  )
}
