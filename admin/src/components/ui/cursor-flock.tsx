'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseColor: string
  opacity: number
  fadeSpeed: number
  state: 'active' | 'leaving' | 'meandering'
  speedFactor: number
  flapOffset: number
  fleeTimer?: number
  isFlapping: boolean
  nextFlapToggleTime: number
}

export function CursorFlock({ seed }: { seed?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const mouse = useRef({ x: -1000, y: -1000 })
  const lastMouseTime = useRef(0)
  const mouseVelocity = useRef({ x: 0, y: 0 })
  const particles = useRef<Particle[]>([])
  const isVisible = useRef(true)

  const spawnState = useRef({ active: false, nextToggleTime: 0 })
  const leaveState = useRef({ active: false, nextToggleTime: 0 })

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
    let themeColors: string[] = []

    const updateThemeColors = () => {
      const style = getComputedStyle(document.documentElement)
      const colors = [
        style.getPropertyValue('--primary'),
        style.getPropertyValue('--secondary'),
        style.getPropertyValue('--tertiary'),
        style.getPropertyValue('--error'),
        style.getPropertyValue('--success'),
        style.getPropertyValue('--warning'),
        style.getPropertyValue('--info'),
      ].filter(Boolean)

      if (colors.length === 0) {
        const isDark = resolvedTheme === 'dark'
        colors.push(isDark ? '#ffffff' : '#000000')
      }
      themeColors = colors
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      const dt = now - lastMouseTime.current
      const dx = e.clientX - mouse.current.x
      const dy = e.clientY - mouse.current.y

      if (dt > 0 && lastMouseTime.current > 0) {
        mouseVelocity.current = { x: dx / dt, y: dy / dt }
      }

      mouse.current = { x: e.clientX, y: e.clientY }
      // Trigger initial appearance if we haven't yet
      if (lastMouseTime.current === 0) {
        lastMouseTime.current = now
        // Only start showing if not explicitly hidden by click
        if (isVisible.current) {
          // Reset opacities to ensure they can fade in
          particles.current.forEach((p) => {
            if (p.opacity <= 0) p.opacity = 0.01
          })
        }
      } else {
        lastMouseTime.current = now
      }
    }

    const createParticle = (
      startAtEdge = true,
      overrideState?: Particle['state'],
      overrides?: Partial<Particle>,
    ): Particle => {
      const randomColorHex =
        themeColors[Math.floor(Math.random() * themeColors.length)] || '#888888'
      const baseColor = hexToRgb(randomColorHex)

      let startX = 0,
        startY = 0
      let vx = (Math.random() - 0.5) * 2
      let vy = (Math.random() - 0.5) * 2

      if (overrides?.x !== undefined && overrides?.y !== undefined) {
        startX = overrides.x
        startY = overrides.y
      } else if (startAtEdge) {
        const edge = Math.floor(Math.random() * 4)
        switch (edge) {
          case 0:
            startX = Math.random() * canvas.width
            startY = -10
            vy = Math.random() * 2 + 3 // Move down, faster (3-5)
            vx = (Math.random() - 0.5) * 2
            break
          case 1:
            startX = canvas.width + 10
            startY = Math.random() * canvas.height
            vx = -(Math.random() * 2 + 3) // Move left, faster (3-5)
            vy = (Math.random() - 0.5) * 2
            break
          case 2:
            startX = Math.random() * canvas.width
            startY = canvas.height + 10
            vy = -(Math.random() * 2 + 3) // Move up, faster (3-5)
            vx = (Math.random() - 0.5) * 2
            break
          case 3:
            startX = -10
            startY = Math.random() * canvas.height
            vx = Math.random() * 2 + 3 // Move right, faster (3-5)
            vy = (Math.random() - 0.5) * 2
            break
        }
      } else {
        startX = Math.random() * canvas.width
        startY = Math.random() * canvas.height
      }

      // For standard 'active' particles, we want random initial velocity,
      // but for 'meandering', we want them to keep the directional velocity set above.
      if (!overrideState || overrideState === 'active') {
        // Reset to random for normal flocking behavior so they don't just fly straight
        vx = (Math.random() - 0.5) * 2
        vy = (Math.random() - 0.5) * 2
      }

      if (overrides?.vx !== undefined) vx = overrides.vx
      if (overrides?.vy !== undefined) vy = overrides.vy

      return {
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        size: Math.random() * 3 + 2, // Increased size (was 1-3, now 3-6)
        baseColor: baseColor,
        opacity: 0,
        fadeSpeed: Math.random() * 0.01 + 0.02,
        state: overrideState || 'active',
        speedFactor: Math.random() * 0.3 + 0.3, // Reduced base speed factor
        flapOffset: Math.random() * Math.PI * 2,
        isFlapping: Math.random() < 0.5,
        nextFlapToggleTime: Date.now() + Math.random() * 1000,
      }
    }

    const resetParticlesToEdges = () => {
      // Clear existing and respawn a fresh batch
      const newParticles: Particle[] = []
      const count = 40
      for (let i = 0; i < count; i++) {
        newParticles.push(createParticle(true))
      }
      particles.current = newParticles
    }

    const handleClick = () => {
      if (isVisible.current) {
        // currently visible, start hiding
        isVisible.current = false
      } else {
        // currently hidden, start over
        isVisible.current = true
        resetParticlesToEdges()
      }
    }

    const initParticles = () => {
      updateThemeColors()
      resetParticlesToEdges()
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Only consider idle if mouse hasn't moved yet (initial state)
      const isIdle = lastMouseTime.current === 0

      // Boids Parameters
      const separationDist = 25
      const mouseAttractionForce = 0.02 // Reduced from 0.04
      const now = Date.now()

      // Decay mouse velocity if idle
      if (now - lastMouseTime.current > 50) {
        mouseVelocity.current.x *= 0.9
        mouseVelocity.current.y *= 0.9
      }

      // --- Spawning Logic ---
      if (now > spawnState.current.nextToggleTime) {
        spawnState.current.active = !spawnState.current.active
        // If becoming active, stay active for 2-4s. If inactive, stay inactive for 4-8s (pauses)
        const duration = spawnState.current.active
          ? Math.random() * 2000 + 2000
          : Math.random() * 4000 + 2000
        spawnState.current.nextToggleTime = now + duration
      }

      // Dynamic Spawning
      if (isVisible.current && !isIdle && particles.current.length < 125) {
        if (spawnState.current.active) {
          // If active, moderate chance to spawn
          if (Math.random() < 0.04) {
            // 30% chance to be a "meanderer" (ignore cursor), 70% chance to join flock
            const isMeanderer = Math.random() < 0.3

            if (isMeanderer) {
              // 80% chance to be a group (2-5 birds), otherwise single
              const isGroup = Math.random() < 0.8
              const count = isGroup ? Math.floor(Math.random() * 4) + 2 : 1

              // Create leader to determine path
              const leader = createParticle(true, 'meandering')
              particles.current.push(leader)

              // Create followers
              // Loop starting from 1 because leader counts as 1
              for (let i = 1; i < count; i++) {
                // Offset slightly from leader
                const offsetX = (Math.random() - 0.5) * 40
                const offsetY = (Math.random() - 0.5) * 40

                particles.current.push(
                  createParticle(false, 'meandering', {
                    x: leader.x + offsetX,
                    y: leader.y + offsetY,
                    vx: leader.vx, // Same velocity
                    vy: leader.vy, // Same velocity
                  }),
                )
              }
            } else {
              particles.current.push(createParticle(true, 'active'))
            }
          }
        }
      }

      // --- Leaving Logic ---
      if (now > leaveState.current.nextToggleTime) {
        leaveState.current.active = !leaveState.current.active
        // If becoming active, stay active for 1-3s. If inactive, stay inactive for 8-15s (longer pauses)
        const duration = leaveState.current.active
          ? Math.random() * 2000 + 1000
          : Math.random() * 7000
        leaveState.current.nextToggleTime = now + duration
      }

      // Iterate backwards to allow removal
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i]

        // Randomly decide to leave if active
        if (
          p.state === 'active' &&
          isVisible.current &&
          !isIdle &&
          particles.current.length > 20
        ) {
          if (leaveState.current.active) {
            // Dynamic probability based on cursor activity
            const timeSinceMove = now - lastMouseTime.current
            let leaveChance = 0.005

            // If user is moving mouse (active < 1s), decrease chance significantly
            if (timeSinceMove < 1000) {
              leaveChance = 0.0005
            }
            // If idling (> 2s), increase chance
            else if (timeSinceMove > 2000) {
              leaveChance = 0.02
            }

            if (Math.random() < leaveChance) {
              p.state = 'leaving'
            }
          }
        }

        // 1. Separation
        let sepX = 0
        let sepY = 0
        let count = 0

        particles.current.forEach((other) => {
          if (p === other) return
          const dx = p.x - other.x
          const dy = p.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < separationDist && distance > 0) {
            const force = (separationDist - distance) / separationDist
            sepX += (dx / distance) * force
            sepY += (dy / distance) * force
            count++
          }
        })

        if (count > 0) {
          p.vx += sepX * 0.8
          p.vy += sepY * 0.8
        }

        // 2. Mouse Attraction / Visibility Logic
        let currentMaxSpeed = isIdle ? 1 : 6

        if (isVisible.current && !isIdle) {
          if (p.state === 'active') {
            const dx = mouse.current.x - p.x
            const dy = mouse.current.y - p.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Predator/Flee logic
            // Check if mouse is moving fast towards the bird
            const mSpeed = Math.sqrt(
              mouseVelocity.current.x ** 2 + mouseVelocity.current.y ** 2,
            )
            // Vector M->P is (-dx, -dy)
            // Dot product: V . (M->P)
            const dot =
              mouseVelocity.current.x * -dx + mouseVelocity.current.y * -dy

            if (mSpeed > 0.8 && dot > 0 && distance < 250) {
              // Random flee duration (approx 0.5s - 1.5s)
              // We set this every frame the threat is active, so when threat ends,
              // each bird will have a random remaining time, causing them to rejoin
              // the flock at staggered times.
              p.fleeTimer = Math.random() * 60 + 30
            }

            if (p.fleeTimer && p.fleeTimer > 0) {
              p.fleeTimer--
              currentMaxSpeed = 3.75 // Slightly panicked but not supersonic
              if (distance > 0) {
                // Moderate Repulsion - enough to turn them around but allows faster predator to overtake
                p.vx -= (dx / distance) * 0.5
                p.vy -= (dy / distance) * 0.5

                // Add randomness/scattering to flee direction
                p.vx += (Math.random() - 0.5) * 0.5
                p.vy += (Math.random() - 0.5) * 0.5
              }
            } else if (distance > 0) {
              // "Appear out of nowhere": Stronger pull and speed when far away
              const isFar = distance > 200
              const isClose = distance < 120

              const attractionMult = isFar
                ? 6 * p.speedFactor // Reduced from 8
                : isClose
                  ? 0.5
                  : 1 // Rush in if far, gentle if close

              if (isFar) {
                currentMaxSpeed = 2.6 * p.speedFactor
              } else if (isClose) {
                currentMaxSpeed = 1.1
              } else {
                currentMaxSpeed = 2.25
              }

              // Steering / Attraction Logic
              // Calculate desired direction
              const dirX = dx / distance
              const dirY = dy / distance

              const curSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
              const velX = curSpeed > 0 ? p.vx / curSpeed : 0
              const velY = curSpeed > 0 ? p.vy / curSpeed : 0

              // Dot product: 1 = moving towards, -1 = moving away
              const alignment = velX * dirX + velY * dirY

              let fx = dirX
              let fy = dirY

              // If we are moving away significantly (alignment < 0.2), we want to "u-turn" via an arc.
              // Instead of braking (pulling back), we steer (pull sideways) and maintain forward momentum.
              if (curSpeed > 0.5 && alignment < 0.2) {
                // Calculate component of desired direction perpendicular to current velocity
                // "Rejection": D - (D.V)V
                const perpX = dirX - alignment * velX
                const perpY = dirY - alignment * velY

                const perpLen = Math.sqrt(perpX * perpX + perpY * perpY)
                if (perpLen > 0) {
                  // Normalize perpendicular steering force
                  const steerX = perpX / perpLen
                  const steerY = perpY / perpLen

                  // Apply steering force (sideways)
                  fx = steerX
                  fy = steerY

                  // Add forward propulsion to maintain speed through the turn (banking)
                  // preventing the "stop on a dime" look
                  fx += velX * 0.5
                  fy += velY * 0.5
                }
              }

              p.vx += fx * mouseAttractionForce * attractionMult
              p.vy += fy * mouseAttractionForce * attractionMult

              // Add subtle wander so they don't move in perfect straight lines (prevents linear stop-and-reverse)
              p.vx += (Math.random() - 0.5) * 0.05
              p.vy += (Math.random() - 0.5) * 0.05

              // Add swirling/orbiting force when closer to keep them moving
              if (!isFar && distance > 20) {
                const orbitForce = 0.05 // Reduced from 0.08
                // Perpendicular vector for orbit (-y, x)
                p.vx += -(dy / distance) * orbitForce
                p.vy += (dx / distance) * orbitForce
              }
            }
          } else if (p.state === 'meandering') {
            // Check if close to mouse to join flock
            const dx = mouse.current.x - p.x
            const dy = mouse.current.y - p.y
            const distToMouse = Math.sqrt(dx * dx + dy * dy)
            if (distToMouse < 100) {
              p.state = 'active'
            }

            // Meandering behavior: Fly straight with momentum
            // Slight wobble
            p.vx += (Math.random() - 0.5) * 0.1
            p.vy += (Math.random() - 0.5) * 0.1

            // Propel forward to counteract friction
            const s = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
            if (s > 0 && s < 1.5) {
              p.vx += (p.vx / s) * 0.05
              p.vy += (p.vy / s) * 0.05
            }

            currentMaxSpeed = 2.0
          } else {
            // LEAVING state
            // Move away from mouse or keep momentum
            const dx = p.x - mouse.current.x
            const dy = p.y - mouse.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0) {
              // Repel
              p.vx += (dx / distance) * 0.1 // Reduced from 0.2
              p.vy += (dy / distance) * 0.1
            }
            // Add some random wandering so they don't just fly straight
            p.vx += (Math.random() - 0.5) * 0.1 // Reduced from 0.2
            p.vy += (Math.random() - 0.5) * 0.1

            currentMaxSpeed = 1.75
          }

          // 2% chance for a particle to get bored and fly away for a bit (only if active)
          if (p.state === 'active' && Math.random() < 0.01) {
            // Reduced chance
            p.vx += (Math.random() - 0.5) * 2 // Reduced impulsive force significantly (was 8)
            p.vy += (Math.random() - 0.5) * 2 // Reduced impulsive force significantly (was 8)
          }
          // Fade in
          if (p.opacity < 0.8) p.opacity += 0.01 // Increased max opacity for contrast, slowed fade slightly
        } else {
          // Disperse behavior (hidden/idle)
          if (!isVisible.current) {
            // Apply random "panic" vector
            p.vx += (Math.random() - 0.5) * 0.5 // Reduced from 1.5
            p.vy += (Math.random() - 0.5) * 0.5 // Reduced from 1.5

            // Repel from mouse
            const dx = p.x - mouse.current.x
            const dy = p.y - mouse.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0 && distance < 400) {
              p.vx += (dx / distance) * 0.5
              p.vy += (dy / distance) * 0.5
            }
          } else {
            // Idle drift
            p.vx += (Math.random() - 0.5) * 0.2
            p.vy += (Math.random() - 0.5) * 0.2
          }

          // Fade out
          if (p.opacity > 0) p.opacity -= p.fadeSpeed
        }

        // 3. Friction & Limits
        const baseFriction = isVisible.current && !isIdle ? 0.96 : 0.96
        // Less friction for meanderers so they glide far
        const friction = p.state === 'meandering' ? 0.99 : baseFriction
        p.vx *= friction
        p.vy *= friction

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > currentMaxSpeed) {
          // Soft limit: instead of clamping instantly, apply drag to bring it down smoothly
          // This preserves momentum and prevents "hitting a wall" when max speed drops
          const decay = 0.9
          p.vx *= decay
          p.vy *= decay
          // If still way too fast, clamp it gently
          if (speed > currentMaxSpeed * 1.5) {
            p.vx = (p.vx / speed) * currentMaxSpeed * 1.5
            p.vy = (p.vy / speed) * currentMaxSpeed * 1.5
          }
        }

        p.x += p.vx
        p.y += p.vy

        // Removal Check
        const isOffScreen =
          p.x < -100 ||
          p.x > canvas.width + 100 ||
          p.y < -100 ||
          p.y > canvas.height + 100

        if (isOffScreen) {
          if (
            p.state === 'leaving' ||
            p.state === 'meandering' ||
            !isVisible.current
          ) {
            // Remove particle
            particles.current.splice(i, 1)
            continue
          } else {
            // If 'active' but went off screen (e.g. drift), we can either wrap or remove.
            // User wants "come from edges", so removing and letting spawner handle new ones is fine.
            // But if we remove too aggressively, we might run out.
            // Let's just remove. The spawner will top up.
            particles.current.splice(i, 1)
            continue
          }
        }

        // Flapping Logic
        if (now > p.nextFlapToggleTime) {
          p.isFlapping = !p.isFlapping
          // Flap for 0.5-1.5s, Glide for 0.5-1.5s
          const duration = Math.random() * 1000 + 500
          p.nextFlapToggleTime = now + duration
        }

        // Force flap if fleeing or accelerating hard
        if (p.fleeTimer && p.fleeTimer > 0) {
          p.isFlapping = true
          p.nextFlapToggleTime = now + 200 // Keep flapping
        }

        // Draw
        if (p.opacity > 0.01) {
          ctx.save()
          ctx.translate(p.x, p.y)

          // Rotate bird to face velocity
          const angle = Math.atan2(p.vy, p.vx)
          ctx.rotate(angle)

          // Flapping animation
          // Use global time + offset. Speed depends on how fast bird is moving (speedFactor)
          const flapSpeed = 0.008 * p.speedFactor // Reduced from 0.015
          const time = Date.now()

          let wingSpread = 1.2 // Default glide wings extended
          if (p.isFlapping) {
            const flapScale = Math.sin(time * flapSpeed + p.flapOffset)
            // Map sin (-1 to 1) to wing spread scale (0.5 to 1.5)
            wingSpread = 1 + flapScale * 0.5
          }

          ctx.beginPath()
          // Bird shape: Head at (size, 0), Tail at (-size/2, 0), Wing tips at (-size, +/- size*spread)
          ctx.moveTo(p.size, 0) // Beak/Head
          ctx.lineTo(-p.size, -p.size * wingSpread) // Left Wing
          ctx.lineTo(-p.size / 2, 0) // Tail notch
          ctx.lineTo(-p.size, p.size * wingSpread) // Right Wing
          ctx.closePath()

          ctx.fillStyle = `rgba(${p.baseColor}, ${p.opacity})`
          ctx.fill()
          ctx.restore()

          if (isVisible.current && !isIdle && p.state === 'active') {
            // Only draw lines if active? Or maybe leaving ones can still connect?
            // Let's say only active ones connect to keep the "flock" tight.
            particles.current.forEach((other) => {
              if (p === other || other.state !== 'active') return
              const dx = p.x - other.x
              const dy = p.y - other.y
              const dist = Math.sqrt(dx * dx + dy * dy)

              if (dist < 60) {
                ctx.beginPath()
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(other.x, other.y)
                ctx.strokeStyle = `rgba(${p.baseColor}, ${p.opacity * 0.4})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            })
          }
        }
      }

      // Draw flock count
      const activeCount = particles.current.filter(
        (p) => p.state === 'active',
      ).length
      if (activeCount > 0) {
        ctx.save()
        ctx.font = '12px sans-serif'
        ctx.fillStyle =
          resolvedTheme === 'dark'
            ? 'rgba(255, 255, 255, 0.4)'
            : 'rgba(0, 0, 0, 0.4)'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText(
          `Flock of ${activeCount} birds`,
          canvas.width - 24,
          canvas.height - 24,
        )
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleClick)

    resize()
    initParticles()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleClick)
      cancelAnimationFrame(animationFrameId)
    }
  }, [resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none z-50'
    />
  )
}
