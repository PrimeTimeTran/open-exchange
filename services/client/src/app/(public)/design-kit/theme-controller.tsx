'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Download } from 'lucide-react'

import { Button } from '@/components/ui'
import { PALETTES } from '@/utils/color'
import { ThemeExporter } from './theme-exporter'
import { getAltKeyLabel } from '@/utils/platform'

export function ThemeController({
  currentSeed,
  onSeedChange,
}: {
  currentSeed: string | null
  onSeedChange: (color: string) => void
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [altLabel, setAltLabel] = useState('Alt')
  const [isExporterOpen, setIsExporterOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAltLabel(getAltKeyLabel())
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('handleKeyDown theme')
      // Check for Alt+T using e.code to avoid issues with special characters (e.g. † on Mac)
      if (e.altKey && e.code === 'KeyT') {
        e.preventDefault()
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
      }

      // Check for Alt+C to cycle themes (Opt+N is a dead key on Mac `~`)
      if (e.altKey && e.code === 'KeyC') {
        e.preventDefault()
        const currentIndex = PALETTES.findIndex((p) => p.color === currentSeed)
        const nextIndex = (currentIndex + 1) % PALETTES.length
        onSeedChange(PALETTES[nextIndex].color)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resolvedTheme, setTheme, currentSeed, onSeedChange])

  if (!mounted) return null

  return (
    <div className='fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 p-3 bg-surface/80 backdrop-blur-md rounded-full shadow-xl border border-outline-variant z-50'>
      <div className='group relative'>
        <span className='absolute right-full mr-3 px-2 py-1 bg-surface text-on-surface text-xs font-medium rounded shadow-sm border border-outline-variant opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none flex items-center gap-1'>
          Toggle Theme{' '}
          <kbd className='font-mono bg-surface-variant px-1 rounded text-[10px]'>
            {altLabel}T
          </kbd>
        </span>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className='rounded-full hover:bg-surface-variant'
        >
          <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </div>

      <div className='w-full h-px bg-outline-variant/50' />

      <div className='grid grid-cols-2 gap-2'>
        {PALETTES.map(({ name, color }, index) => (
          <button
            key={name}
            onClick={() => onSeedChange(color)}
            className='group relative flex items-center justify-center'
          >
            <span className='absolute right-full mr-3 px-2 py-1 bg-surface text-on-surface text-xs font-medium rounded shadow-sm border border-outline-variant opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none'>
              {name}{' '}
              {index === 0 && (
                <kbd className='ml-1 font-mono bg-surface-variant px-1 rounded text-[10px]'>
                  {altLabel}C
                </kbd>
              )}
            </span>
            <div
              className={`h-6 w-6 rounded-full border border-outline transition-transform group-hover:scale-110 ${currentSeed === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
              style={{ backgroundColor: color }}
            />
          </button>
        ))}
      </div>

      {currentSeed && (
        <>
          <div className='w-full h-px bg-outline-variant/50' />
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setIsExporterOpen(true)}
            className='w-full justify-center text-xs text-on-surface-variant hover:text-primary'
          >
            <Download className='w-4 h-4' />
          </Button>
        </>
      )}

      <ThemeExporter
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
        currentSeed={currentSeed || PALETTES[0].color}
      />
    </div>
  )
}
