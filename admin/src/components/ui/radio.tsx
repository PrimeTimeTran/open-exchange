import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className='relative flex items-center'>
        <input
          type='radio'
          className={cn(
            'peer h-5 w-5 appearance-none rounded-full border border-outline bg-surface shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary checked:bg-primary',
            className,
          )}
          ref={ref}
          {...props}
        />
        <div className='pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-primary opacity-0 transition-opacity peer-checked:opacity-100' />
      </div>
    )
  },
)
Radio.displayName = 'Radio'

export { Radio }
