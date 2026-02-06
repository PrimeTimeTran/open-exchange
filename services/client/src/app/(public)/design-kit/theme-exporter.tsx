'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { X, Copy, Check, Download } from 'lucide-react'

import { generateTheme } from '@/utils/color'
import { Button } from '@/components/ui/button'

interface ThemeExporterProps {
  isOpen: boolean
  onClose: () => void
  currentSeed: string
}

export function ThemeExporter({
  isOpen,
  onClose,
  currentSeed,
}: ThemeExporterProps) {
  const [copied, setCopied] = useState(false)
  const [cssContent, setCssContent] = useState('')

  useEffect(() => {
    if (!currentSeed) return

    const lightVars = generateTheme(currentSeed, 'light')
    const darkVars = generateTheme(currentSeed, 'dark')

    const formatVars = (vars: Record<string, string>) => {
      return Object.entries(vars)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n')
    }

    const css = `:root {
${formatVars(lightVars)}
}

.dark {
${formatVars(darkVars)}
}`
    setCssContent(css)
  }, [currentSeed])

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (typeof window === 'undefined') return null
  if (!isOpen) return null

  return createPortal(
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between p-6 border-b border-outline-variant'>
          <h2 className='text-xl font-semibold text-on-surface flex items-center gap-2'>
            <Download className='w-5 h-5 text-primary' />
            Export Theme CSS
          </h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-hidden p-0 relative'>
          <div className='absolute top-4 right-4 z-10'>
            <Button
              size='sm'
              variant='secondary'
              onClick={handleCopy}
              className='gap-2'
            >
              {copied ? (
                <Check className='w-4 h-4' />
              ) : (
                <Copy className='w-4 h-4' />
              )}
              {copied ? 'Copied' : 'Copy CSS'}
            </Button>
          </div>
          <pre className='h-full overflow-auto p-6 text-sm font-mono bg-surface-variant/10 text-on-surface'>
            <code>{cssContent}</code>
          </pre>
        </div>

        <div className='p-6 border-t border-outline-variant bg-surface rounded-b-xl'>
          <p className='text-sm text-on-surface-variant'>
            Paste this into your{' '}
            <code className='bg-surface-variant px-1 rounded'>
              app/globals.css
            </code>{' '}
            file to make this the default theme.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
