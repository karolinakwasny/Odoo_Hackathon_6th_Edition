export interface SchedulerAllocation {
  id: string
  region: string
  project: string
  node: string
  taskCount: number
  time: string
}

export const schedulerAllocations: SchedulerAllocation[] = [
  { id: 'sched-1', region: 'West Denmark', project: 'Forest climate model', node: 'Copenhagen-01', taskCount: 16, time: '2 min ago' },
  { id: 'sched-2', region: 'Portugal', project: 'Pollinator mapping', node: 'Lisbon-02', taskCount: 8, time: '11 min ago' },
  { id: 'sched-3', region: 'France', project: 'Urban heat forecast', node: 'Paris-05', taskCount: 24, time: '18 min ago' },
]
