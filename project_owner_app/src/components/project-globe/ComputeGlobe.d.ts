import type { JSX } from 'react'

export interface ProjectComputeGlobeProps {
  projectName?: string
  projectNodeCount?: number
  projectCountries?: string[] | null
  showProjectNodes?: boolean
  liveZoneData?: Array<{
    id: string
    name: string
    carbonIntensity: number
    totalLoadMw?: number
    timestamp: string
    live: boolean
  }>
  compact?: boolean
  selectedCountryCode?: string | null
  showControls?: boolean
  showDetailPanel?: boolean
  onCountrySelect?: (code: string | null) => void
  liveZones?: Array<{
    id: string
    name: string
    carbonIntensity: number
    totalLoadMw?: number
    timestamp: string
    live: boolean
  }>
}

declare const ComputeGlobe: (props: ProjectComputeGlobeProps) => JSX.Element
export default ComputeGlobe
