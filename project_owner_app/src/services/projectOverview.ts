export interface ProjectOverviewMetric {
  connectedNodes: number
  chunksProcessed: number
  activeContributors: number
  projectId: string
  projectName: string
  updatedAt: string
}

export async function getProjectOwnerOverview(): Promise<ProjectOverviewMetric> {
  return {
    projectId: 'forest-guardian',
    projectName: 'Forest Guardian',
    connectedNodes: 14,
    chunksProcessed: 128432,
    activeContributors: 1184,
    updatedAt: new Date().toISOString(),
  }
}
