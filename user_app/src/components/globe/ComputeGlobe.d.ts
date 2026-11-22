import type { JSX } from 'react'

export interface ComputeGlobeProps {
  compact?: boolean
  selectedCountryCode?: string | null
  highlightedProject?: string | null
  projectNodeCount?: number
  projectCountries?: string[] | null
  showControls?: boolean
  showDetailPanel?: boolean
  onCountrySelect?: (code: string | null) => void
}

declare const ComputeGlobe: (props: ComputeGlobeProps) => JSX.Element
export default ComputeGlobe
