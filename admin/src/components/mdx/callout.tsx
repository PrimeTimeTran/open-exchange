import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error'
  children: React.ReactNode
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    error: XCircle,
  }

  const styles = {
    info: 'bg-primary/10 border-primary/20 text-on-surface',
    warning: 'bg-warning/10 border-warning/20 text-on-surface',
    success: 'bg-success/10 border-success/20 text-on-surface',
    error: 'bg-error/10 border-error/20 text-on-surface',
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        'p-4 my-6 rounded-lg border flex items-start gap-3',
        styles[type],
      )}
    >
      <Icon className='w-5 h-5 shrink-0 mt-0.5 opacity-80' />
      <div className='text-sm leading-relaxed'>{children}</div>
    </div>
  )
}
