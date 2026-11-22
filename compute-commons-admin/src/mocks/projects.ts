import type { Project } from '../features/projects/types'

export const initialProjects: Project[] = [
  {
    id: 'climate-forest',
    name: 'Forest Guardian',
    description: 'Process satellite imagery to identify deforestation and vegetation change.',
    category: 'Biodiversity',
    status: 'Running',
    priority: 'High',
    schedulingStrategy: 'Energy-aware',
    completedTasks: 0,
    requirements: { taskCount: 250, cpuCoresPerTask: 8, memoryMbPerTask: 16384, estimatedDurationSeconds: 900, postponeForRenewableEnergy: true },
    createdAt: '2026-11-18',
    allocatedNodes: ['Berlin-03', 'Amsterdam-02', 'Copenhagen-01'],
    recentActivity: [
      { id: 'fg-1', title: 'Project created', detail: '250 tasks prepared for the network', time: '2026-11-18' },
    ],
  },
]
