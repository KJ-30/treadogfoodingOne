import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`px-3 py-2 bg-app-bg-secondary border border-app-border rounded text-app-text-primary placeholder:text-app-text-muted focus:border-app-accent ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
