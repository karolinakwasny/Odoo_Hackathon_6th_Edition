import type { Project } from '../features/projects/types'

export const initialProjects: Project[] = [
  {
    id: 'climate-forest',
    name: 'European Forest Climate Model',
    description: 'Long-range carbon capture and drought resilience simulations.',
    category: 'Climate',
    status: 'Running',
    priority: 'High',
    schedulingStrategy: 'Energy-aware',
    completedTasks: 148,
    requirements: { taskCount: 240, cpuCoresPerTask: 8, memoryMbPerTask: 16384, estimatedDurationSeconds: 900, postponeForRenewableEnergy: true },
    createdAt: '2026-11-18',
    allocatedNodes: ['Berlin-03', 'Amsterdam-02', 'Copenhagen-01'],
    recentActivity: [
      { id: 'cf-1', title: 'Batch 149 completed', detail: 'Node Berlin-03 returned results', time: '12 minutes ago' },
      { id: 'cf-2', title: 'Additional capacity allocated', detail: 'Copenhagen-01 joined the project', time: '38 minutes ago' },
      { id: 'cf-3', title: 'Project resumed', detail: 'Renewable energy threshold restored', time: 'Yesterday' },
    ],
  },
]
