'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGradientSectionProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  speed?: number
}

export function AnimatedGradientSection({
  className,
  children,
  speed = 15,
  style,
  ...props
}: AnimatedGradientSectionProps) {
  // Using CSS variables allows the gradient to adapt to the current theme
  // We use container colors which are usually softer/background-appropriate
  const gradient = `linear-gradient(-45deg, var(--surface-variant), var(--primary-container), var(--secondary-container), var(--tertiary-container))`

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-[length:400%_400%] animate-gradient',
        className,
      )}
      style={{
        backgroundImage: gradient,
        animationDuration: `${speed}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </section>
  )
}
