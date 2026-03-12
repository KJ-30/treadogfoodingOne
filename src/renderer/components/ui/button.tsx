import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50'
    
    const variants = {
      primary: 'bg-app-accent hover:bg-app-accent-hover text-white',
      secondary: 'bg-app-bg-secondary hover:bg-app-bg-hover border border-app-border text-app-text-primary',
      ghost: 'hover:bg-app-bg-hover text-app-text-primary',
      danger: 'bg-app-error hover:opacity-80 text-white',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
