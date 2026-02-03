import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className='relative flex items-center'>
        <input
          type='checkbox'
          className={cn(
            'peer h-5 w-5 shrink-0 appearance-none rounded-sm border border-outline bg-surface shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary',
            className,
          )}
          ref={ref}
          {...props}
        />
        <Check className='pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-on-primary opacity-0 transition-opacity peer-checked:opacity-100' />
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
