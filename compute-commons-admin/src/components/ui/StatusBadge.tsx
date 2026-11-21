import { Badge } from '@mantine/core'
import type { ProjectStatus } from '../../features/projects/types'

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const color = status === 'Running' ? 'green' : status === 'Queued' ? 'yellow' : status === 'Paused' ? 'orange' : 'blue'
  return <Badge color={color} variant="light" radius="sm">{status}</Badge>
}
