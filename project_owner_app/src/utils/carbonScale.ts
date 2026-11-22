// Carbon intensity color scale (gCO₂eq/kWh) — the same five steps and colors as the
// network map in compute-commons-admin, so every map/globe reads the same way.
export const CARBON_SCALE = [
  { below: 100, color: '#70a965', label: '< 100' },
  { below: 200, color: '#aeca77', label: '100–200' },
  { below: 350, color: '#d4c66f', label: '200–350' },
  { below: 500, color: '#d99a58', label: '350–500' },
  { below: Infinity, color: '#c56e55', label: '500+' },
]

export const NO_DATA_COLOR = 'rgba(142, 150, 145, 0.58)'

/** Fill color for a carbon intensity, or grey when there's no live data. */
export function carbonColor(gramsPerKwh: number | undefined): string {
  if (gramsPerKwh === undefined) return NO_DATA_COLOR
  return CARBON_SCALE.find((step) => gramsPerKwh < step.below)?.color ?? NO_DATA_COLOR
}

/** Low / Medium / High, the same labels as the Coordinator's country speed controls. */
export function carbonLevel(gramsPerKwh: number): 'Low' | 'Medium' | 'High' {
  return gramsPerKwh < 200 ? 'Low' : gramsPerKwh < 350 ? 'Medium' : 'High'
}
