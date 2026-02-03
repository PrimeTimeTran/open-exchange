import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className='relative inline-flex cursor-pointer items-center'>
        <input
          type='checkbox'
          className='peer sr-only'
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            'peer h-6 w-11 rounded-full bg-outline-variant transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            className,
          )}
        />
        <div className='absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-all peer-checked:translate-x-5 peer-checked:bg-on-primary' />
      </label>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
