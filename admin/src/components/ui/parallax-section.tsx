'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ParallaxSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

function Star({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      className={className}
      style={style}
    >
      <path d='M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z' />
    </svg>
  )
}

export function ParallaxSection({
  className,
  children,
  ...props
}: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [stars, setStars] = useState<
    Array<{
      id: number
      top: string
      left: string
      size: number
      delay: number
      duration: number
      layer: number
      opacity: number
    }>
  >([])

  useEffect(() => {
    // Generate stars only on client to avoid hydration mismatch
    const newStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 8 + 4, // 4px to 12px
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      layer: Math.floor(Math.random() * 3), // 0: far, 1: mid, 2: near
      opacity: Math.random() * 0.5 + 0.3,
    }))
    setStars(newStars)
  }, [])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return
          const rect = containerRef.current.getBoundingClientRect()
          const viewportCenter = window.innerHeight / 2
          const elementCenter = rect.top + rect.height / 2
          const distanceFromCenter = elementCenter - viewportCenter

          setOffset(distanceFromCenter)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className={cn('relative overflow-hidden py-24', className)}
      {...props}
    >
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }
      `}</style>
      {/* Background Parallax Elements */}
      <div className='absolute inset-0 pointer-events-none select-none z-0'>
        {/* Nebula / Atmosphere */}
        <div
          className='absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl'
          style={{ transform: `translateY(${offset * 0.05}px)` }}
        />
        <div
          className='absolute bottom-0 -right-20 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl'
          style={{ transform: `translateY(${offset * 0.04}px)` }}
        />

        {/* Far Stars (Slow) */}
        <div
          style={{ transform: `translateY(${offset * 0.1}px)` }}
          className='absolute inset-0'
        >
          {stars
            .filter((s) => s.layer === 0)
            .map((s) => (
              <Star
                key={s.id}
                className='absolute text-foreground/40'
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size * 0.6,
                  height: s.size * 0.6,
                  opacity: s.opacity,
                  animation: `twinkle ${s.duration}s infinite ease-in-out ${s.delay}s`,
                }}
              />
            ))}
        </div>

        {/* Mid Stars (Medium) */}
        <div
          style={{ transform: `translateY(${offset * 0.2}px)` }}
          className='absolute inset-0'
        >
          {stars
            .filter((s) => s.layer === 1)
            .map((s) => (
              <Star
                key={s.id}
                className='absolute text-foreground/60'
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size * 0.8,
                  height: s.size * 0.8,
                  opacity: s.opacity,
                  animation: `twinkle ${s.duration}s infinite ease-in-out ${s.delay}s`,
                }}
              />
            ))}
        </div>

        {/* Near Objects (Fast) */}
        <div
          style={{ transform: `translateY(${offset * 0.4}px)` }}
          className='absolute inset-0'
        >
          {stars
            .filter((s) => s.layer === 2)
            .map((s) => (
              <Star
                key={s.id}
                className='absolute text-foreground/80'
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size,
                  height: s.size,
                  opacity: s.opacity,
                  animation: `twinkle ${s.duration}s infinite ease-in-out ${s.delay}s`,
                }}
              />
            ))}
        </div>
      </div>

      <div className='relative z-10'>{children}</div>
    </section>
  )
}
