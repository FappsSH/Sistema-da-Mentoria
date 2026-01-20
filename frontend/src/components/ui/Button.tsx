import { ButtonHTMLAttributes, ReactNode, CSSProperties, useState } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<string, { base: CSSProperties; hover: CSSProperties }> = {
  primary: {
    base: { backgroundColor: '#1a1a4e', color: '#ffffff' },
    hover: { backgroundColor: '#2d2d7a' }
  },
  secondary: {
    base: { backgroundColor: '#6366f1', color: '#ffffff' },
    hover: { backgroundColor: '#4f46e5' }
  },
  outline: {
    base: { backgroundColor: 'transparent', color: '#1a1a4e', border: '2px solid #1a1a4e' },
    hover: { backgroundColor: '#1a1a4e', color: '#ffffff' }
  },
  danger: {
    base: { backgroundColor: '#ef4444', color: '#ffffff' },
    hover: { backgroundColor: '#dc2626' }
  },
  ghost: {
    base: { backgroundColor: 'transparent', color: '#64748b' },
    hover: { backgroundColor: '#f8fafc', color: '#1e293b' }
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const currentVariant = variantStyles[variant]
  const variantStyle: CSSProperties = {
    ...currentVariant.base,
    ...(isHovered && !disabled ? currentVariant.hover : {}),
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : { cursor: 'pointer' }),
    ...style
  }

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={variantStyle}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Carregando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
