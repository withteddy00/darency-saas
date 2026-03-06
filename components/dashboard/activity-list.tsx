'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ActivityItem {
  id: string
  title: string
  description?: string
  time: string
  icon?: LucideIcon
  iconColor?: string
}

interface ActivityListProps {
  items: ActivityItem[]
  className?: string
}

export function ActivityList({ items, className }: ActivityListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 p-3 rounded-lg hover:bg-surface-elevated transition-colors">
          {item.icon && (
            <div className={cn('p-2 rounded-lg bg-surface-elevated', item.iconColor || 'text-primary')}>
              <item.icon className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{item.title}</p>
            {item.description && (
              <p className="text-sm text-text-secondary mt-0.5 truncate">{item.description}</p>
            )}
          </div>
          <span className="text-xs text-text-tertiary whitespace-nowrap">{item.time}</span>
        </div>
      ))}
    </div>
  )
}
