export type ProjectStatus = 'Active' | 'Recruiting' | 'Paused' | 'Completed'
export type ProjectCategory =
  | 'Climate & Environment'
  | 'Biodiversity & Ecosystems'
  | 'Scientific Research'
  | 'Open Source & Public Infrastructure'
  | 'Space & Astronomy'
  | 'Social Good'
  | 'Education'

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  organization: string
  status: ProjectStatus
  progress: number
  contributors: number
  activeNodes: number
  nodeCount: number
  image: string
  requirements?: 'Low' | 'Medium' | 'High'
  estimatedDurationMinutes?: number
  energyPreference?: 'Flexible' | 'Renewable preferred' | 'Anytime'
  whyItMatters: string
  whatItDoes: string
  resultsUsedFor: string
  collaboratorCountries: string[]
}
