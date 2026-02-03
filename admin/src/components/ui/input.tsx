import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-on-surface transition-colors hover:border-outline-variant',
          error && 'border-error focus-visible:ring-error',
          success && 'border-success focus-visible:ring-success',
          className,
        )}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
