export interface UserProfile {
  name: string
  email: string
  username: string
  displayName?: string
  country: string
  region?: string
  city?: string
  electricityZone?: string
  interests: ProjectCategory[]
  deviceType: 'Desktop' | 'Laptop' | 'Server'
  cpuUsage: number
  availability: 'Always' | 'When idle' | 'Scheduled hours'
  activeHours?: string
  prioritizeRenewableEnergy: boolean
  allowPostponement: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  organization: string
  image: string
  requirements: 'Low' | 'Medium' | 'High'
  estimatedDurationMinutes: number
  contributors: number
  progress: number
  energyPreference: 'Flexible' | 'Renewable preferred' | 'Anytime'
  status: 'Active' | 'Recruiting' | 'Paused'
  whyItMatters: string
  whatItDoes: string
  resultsUsedFor: string
}

export type ProjectCategory =
  | 'Climate & Environment'
  | 'Biodiversity & Ecosystems'
  | 'Scientific Research'
  | 'Open Source & Public Infrastructure'
  | 'Space & Astronomy'
  | 'Social Good'
  | 'Education'

export interface Device {
  name: string
  deviceType: UserProfile['deviceType']
  status: 'Connected' | 'Paused'
  cpuAvailable: number
  currentCpuUsage: number
  availableMemoryGb: number
  currentTasks: number
}

export interface ContributionPreferences {
  cpuUsage: number
  availability: UserProfile['availability']
  prioritizeRenewableEnergy: boolean
  allowPostponement: boolean
  activeHours?: string
}

export interface ActivityEvent {
  id: string
  title: string
  detail: string
  time: string
}
