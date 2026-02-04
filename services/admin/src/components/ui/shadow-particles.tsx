'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

export function ShadowParticles({ seed }: { seed?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const mouse = useRef({ x: -1000, y: -1000 })
  const particles = useRef<Particle[]>([])

  // Helper to convert hex to rgb string "r, g, b"
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '128, 128, 128' // Fallback
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let parentElement: HTMLElement | null = null

    const resize = () => {
      // Use parent element dimensions if available, otherwise window
      parentElement = canvas.parentElement
      if (parentElement) {
        canvas.width = parentElement.clientWidth
        canvas.height = parentElement.clientHeight
      } else {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Need mouse coordinates relative to the canvas
      const rect = canvas.getBoundingClientRect()
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // Initialize particles
    const initParticles = () => {
      const particleCount = 60
      const newParticles: Particle[] = []

      // Get theme colors from CSS variables
      const style = getComputedStyle(document.documentElement)
      const themeColors = [
        style.getPropertyValue('--primary'),
        style.getPropertyValue('--secondary'),
        style.getPropertyValue('--tertiary'),
        style.getPropertyValue('--error'),
        style.getPropertyValue('--success'),
        style.getPropertyValue('--warning'),
        style.getPropertyValue('--info'),
      ].filter(Boolean)

      // Fallback if variables aren't ready
      if (themeColors.length === 0) {
        const isDark = resolvedTheme === 'dark'
        themeColors.push(isDark ? '#ffffff' : '#000000')
      }

      for (let i = 0; i < particleCount; i++) {
        const randomColorHex =
          themeColors[Math.floor(Math.random() * themeColors.length)]
        const rgb = hexToRgb(randomColorHex)

        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5, // Slower movement for shadows
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: `rgba(${rgb}, ${Math.random() * 0.3 + 0.1})`, // Varying opacity
        })
      }
      particles.current = newParticles
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((p) => {
        // Physics logic - simple float with connection

        // Mouse repulsion/attraction (optional, subtle for shadows)
        const dx = mouse.current.x - p.x
        const dy = mouse.current.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          // Gentle repulsion to clear space
          p.vx -= dx * 0.0005
          p.vy -= dy * 0.0005
        }

        p.x += p.vx
        p.y += p.vy

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Shadow Logic: Cast shadows from particles as if mouse is the light source
        const vectorX = p.x - mouse.current.x
        const vectorY = p.y - mouse.current.y
        const len = Math.sqrt(vectorX * vectorX + vectorY * vectorY)

        if (len > 0) {
          // Shadow length inversely proportional to distance (closer = longer/stark shadow)
          const shadowLen = Math.min(10000 / len, 150)

          const shadowEndX = p.x + (vectorX / len) * shadowLen
          const shadowEndY = p.y + (vectorY / len) * shadowLen

          // Create fading shadow gradient
          // Use the particle's own color but very faint for the shadow
          const shadowColor = p.color.replace(/[\d.]+\)$/g, '0.05)')
          const gradient = ctx.createLinearGradient(
            p.x,
            p.y,
            shadowEndX,
            shadowEndY,
          )
          gradient.addColorStop(0, shadowColor)
          gradient.addColorStop(1, 'rgba(0,0,0,0)')

          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(shadowEndX, shadowEndY)
          ctx.strokeStyle = gradient
          ctx.lineWidth = p.size * 2 // Shadow slightly wider/softer
          ctx.stroke()
        }

        // Draw connections
        particles.current.forEach((other) => {
          if (p === other) return
          const distX = p.x - other.x
          const distY = p.y - other.y
          const dist = Math.sqrt(distX * distX + distY * distY)

          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(other.x, other.y)
            // Line opacity based on distance
            const opacity = (1 - dist / 100) * 0.15
            ctx.strokeStyle = p.color.replace(/[\d.]+\)$/g, `${opacity})`)
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    // Attach mouse move to window so we track it even if outside canvas (but calc relative pos)
    window.addEventListener('mousemove', handleMouseMove)

    // Initial setup needs delay to ensure parent is rendered/sized
    setTimeout(() => {
      resize()
      initParticles()
      animate()
    }, 100)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [resolvedTheme, seed])

  return (
    <canvas
      ref={canvasRef}
      className='absolute inset-0 pointer-events-none z-0'
    />
  )
}
