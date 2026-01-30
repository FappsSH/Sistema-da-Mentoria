import { ReactNode, CSSProperties } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
  style?: CSSProperties
}

const variantStyles: Record<string, CSSProperties> = {
  default: { backgroundColor: '#f8fafc', color: '#64748b' },
  success: { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
  warning: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
  danger: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  info: { backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
}

export function Badge({ children, variant = 'default', size = 'md', className = '', style }: BadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizes[size]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </span>
  )
}
