'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

import { Typewriter, ShadowParticles, CursorFlock } from '@/components/ui'

import { PALETTES } from '@/utils/color'
import { ThemeController } from './theme-controller'
import { SectionNavigation } from './section-navigation'
import { useDesignSystem } from '@/providers/design-system'

import { FormsSection } from './kits/forms'
import { CardsSection } from './kits/cards'
import { AlertsSection } from './kits/alerts'
import { ShadowsSection } from './kits/shadows'
import { CarouselSection } from './kits/carousel'
import { FeedbackSection } from './kits/feedback'
import { TypographySection } from './kits/typography'
import { ColorPaletteSection } from './kits/color-palette'
import { BorderRadiusSection } from './kits/border-radius'
import { ButtonsPillsSection } from './kits/buttons-pills'

export default function DesignKitPage() {
  const { resolvedTheme } = useTheme()
  const { currentSeed, setCurrentSeed } = useDesignSystem()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentPaletteName =
    PALETTES.find((p) => p.color === currentSeed)?.name || 'Default'

  if (!mounted) return null

  return (
    <div className='min-h-screen w-full relative'>
      <ThemeController
        currentSeed={currentSeed}
        onSeedChange={setCurrentSeed}
      />
      <SectionNavigation />
      <CursorFlock seed={currentSeed} />
      <section className='bg-surface-variant py-24 text-on-surface-variant relative overflow-hidden'>
        <ShadowParticles seed={currentSeed} />
        <div className='container mx-auto px-6 relative z-10'>
          <div className='flex items-start justify-between'>
            <div className='space-y-4'>
              <h1 className='font-display text-4xl md:text-5xl font-bold text-primary'>
                Design System
              </h1>
              <h2 className='flex items-center gap-3 text-3xl text-on-surface-variant/80'>
                <span className='capitalize'>{resolvedTheme} Mode</span>
                <span>•</span>
                <span>{currentPaletteName} Theme</span>
              </h2>{' '}
              <div className='text-sm font-mono text-primary pt-2 h-6'>
                <Typewriter
                  strings={[
                    `Press ⌥ + T to toggle ☀️ /🌙 modes`,
                    `Press ⌥ + C to cycle 🎨 themes`,
                  ]}
                  typeSpeed={70}
                  deleteSpeed={50}
                  delayBetween={3000}
                />
              </div>{' '}
              <p className='text-muted-foreground text-lg max-w-2xl'>
                Comprehensive design system including tokens, colors,
                typography, and components used across web development.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div id='colors'>
        <ColorPaletteSection key={`${currentSeed}-${resolvedTheme}`} />
      </div>
      <div id='typography'>
        <TypographySection />
      </div>
      <div id='buttons'>
        <ButtonsPillsSection />
      </div>
      <div id='shadows'>
        <ShadowsSection />
      </div>
      <div id='cards'>
        <CardsSection />
      </div>
      <div id='carousel'>
        <CarouselSection />
      </div>
      <div id='forms'>
        <FormsSection />
      </div>
      <div id='feedback'>
        <FeedbackSection />
      </div>
      <div id='alerts'>
        <AlertsSection />
      </div>
      <div id='radius'>
        <BorderRadiusSection />
      </div>
    </div>
  )
}
