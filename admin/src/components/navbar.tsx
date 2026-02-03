'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GlobalSidebar } from './global-sidebar'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      <nav className='w-full border-b border-outline-variant bg-surface transition-colors duration-300'>
        <div className='mx-auto max-w-6xl px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='p-2 -ml-2 rounded-full text-on-surface hover:bg-surface-variant transition-colors'
              aria-label='Open menu'
            >
              <Menu className='w-6 h-6' />
            </button>
            <Link href='/home'>
              <div className='font-semibold text-on-surface'>
                AI Marketplace
              </div>
            </Link>
          </div>

          <div className='flex items-center gap-6'>
            <a
              href='/design-kit'
              className='text-sm font-medium text-on-surface-variant hover:text-on-surface'
            >
              Design Kit
            </a>

            {mounted && (
              <button
                onClick={toggleTheme}
                className='relative rounded-full p-2 hover:bg-surface-variant transition-colors'
                aria-label='Toggle theme'
              >
                <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-warning' />
                <Moon className='absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary' />
              </button>
            )}
          </div>
        </div>
      </nav>

      <GlobalSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  )
}
