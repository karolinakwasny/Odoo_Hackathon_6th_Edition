export type ProjectStatus = 'Running' | 'Queued' | 'Completed' | 'Paused'
export type ProjectPriority = 'Low' | 'Normal' | 'High' | 'Critical'
export type SchedulingStrategy = 'Energy-aware' | 'Performance-first' | 'Balanced'
export type ProjectCategory = 'Climate' | 'Biodiversity' | 'Research' | 'Other'

export interface ProjectRequirements {
  taskCount: number
  cpuCoresPerTask: number
  memoryMbPerTask: number
  estimatedDurationSeconds: number
  postponeForRenewableEnergy: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  priority: ProjectPriority
  schedulingStrategy: SchedulingStrategy
  completedTasks: number
  requirements: ProjectRequirements
  createdAt: string
  allocatedNodes: string[]
  recentActivity: Array<{
    id: string
    title: string
    detail: string
    time: string
  }>
}

export type CreateProjectInput = Omit<Project, 'id' | 'status' | 'completedTasks' | 'createdAt' | 'allocatedNodes' | 'recentActivity'>
