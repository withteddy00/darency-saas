'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  className
}: StatCardProps) {
  return (
    <div className={cn(
      'bg-surface rounded-xl p-6 border border-border hover:border-primary/20 transition-all duration-200',
      'hover:shadow-lg hover:shadow-primary/5',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-text-secondary font-medium">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-2 flex items-center gap-1',
              changeType === 'positive' && 'text-success',
              changeType === 'negative' && 'text-error',
              changeType === 'neutral' && 'text-text-tertiary'
            )}>
              {changeType === 'positive' && '↑'}
              {changeType === 'negative' && '↓'}
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-surface-elevated', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
