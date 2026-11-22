// Country code -> flag emoji and name, for showing worker countries as flags.
// `zone` is the Electricity Maps zone for countries the API splits into regions
// (it must be one of the zones requested in services/electricityMaps.ts).
// Add more countries here as needed.
export const countryFlags: Record<string, { flag: string; name: string; zone?: string }> = {
  AT: { flag: '🇦🇹', name: 'Austria' },
  BE: { flag: '🇧🇪', name: 'Belgium' },
  CZ: { flag: '🇨🇿', name: 'Czechia' },
  DE: { flag: '🇩🇪', name: 'Germany' },
  FR: { flag: '🇫🇷', name: 'France' },
  HU: { flag: '🇭🇺', name: 'Hungary' },
  IT: { flag: '🇮🇹', name: 'Italy' },
  NL: { flag: '🇳🇱', name: 'Netherlands' },
  NO: { flag: '🇳🇴', name: 'Norway', zone: 'NO-NO1' },
  PL: { flag: '🇵🇱', name: 'Poland' },
  SE: { flag: '🇸🇪', name: 'Sweden' },
}

/** The flag for a country code, or the code itself if it isn't in the list (e.g. "UNSET"). */
export function countryFlag(code: string): string {
  return countryFlags[code.toUpperCase()]?.flag ?? code
}

/** The country's name, e.g. "Belgium", or the code itself if it isn't in the list. */
export function countryName(code: string): string {
  return countryFlags[code.toUpperCase()]?.name ?? code
}

/** The Electricity Maps zone for a country code, e.g. "NO" -> "NO-NO1"; usually just the code. */
export function countryZone(code: string): string {
  return countryFlags[code.toUpperCase()]?.zone ?? code.toUpperCase()
}

/** "Belgium (BE)" for tooltips, or just the code if unknown. */
export function countryLabel(code: string): string {
  const country = countryFlags[code.toUpperCase()]
  return country ? `${country.name} (${code.toUpperCase()})` : code
}
