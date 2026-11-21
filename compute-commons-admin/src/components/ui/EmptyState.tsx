import type { ReactNode } from 'react'
import { IconSearchOff } from '@tabler/icons-react'

export function EmptyState({ title = 'No projects found', description, action }: { title?: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <IconSearchOff size={28} />
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  )
}
