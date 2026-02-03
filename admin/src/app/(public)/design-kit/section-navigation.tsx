'use client'

import { cn } from '@/lib/utils'
import {
  Type,
  Layers,
  Palette,
  Loader2,
  FileText,
  CircleDot,
  CreditCard,
  AlertTriangle,
  MousePointer2,
  LayoutTemplate,
} from 'lucide-react'

export const SECTIONS = [
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'buttons', label: 'Buttons', icon: MousePointer2 },
  { id: 'shadows', label: 'Shadows', icon: Layers },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'carousel', label: 'Carousel', icon: LayoutTemplate },
  { id: 'forms', label: 'Forms', icon: FileText },
  { id: 'feedback', label: 'Feedback', icon: Loader2 },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'radius', label: 'Radius', icon: CircleDot },
]

export function SectionNavigation() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className='fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-surface/80 backdrop-blur-md rounded-full shadow-xl border border-outline-variant z-50'>
      {SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => scrollToSection(id)}
          className='group relative flex items-center justify-center p-2 rounded-full hover:bg-surface-variant/50 transition-colors'
        >
          <span className='absolute left-full ml-3 px-2 py-1 bg-surface text-on-surface text-xs font-medium rounded shadow-sm border border-outline-variant opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none'>
            {label}
          </span>
          <Icon className='w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors' />
        </button>
      ))}
    </div>
  )
}
