'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  action,
  className
}: QuickActionCardProps) {
  return (
    <div className={cn(
      'bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer group',
      'hover:shadow-lg hover:shadow-primary/5',
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{title}</h4>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
