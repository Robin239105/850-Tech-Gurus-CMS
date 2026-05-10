import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'green' | 'gray' | 'amber' | 'red' | 'blue' | 'indigo' | 'cyan'
}

function Badge({ className, variant = 'gray', ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600 border-gray-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-brand-indigo-light text-brand-indigo border-indigo-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
