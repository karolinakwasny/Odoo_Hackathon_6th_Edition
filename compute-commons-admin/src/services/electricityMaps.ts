import type { ElectricityMapsApiResponse, ElectricityZone } from '../features/network/types'
import { worldwideZoneCountries } from '../mocks/electricity'

type LiveEndpoint = 'carbon-intensity' | 'total-load'

const ZONE_IDS = [
  'DE', 'FR', 'NL', 'DK-DK1', 'ES', 'PT', 'IT-NORTH', 'NO-NO1', 'CZ', 'PL',
  'BE', 'GB', 'IE', 'SE', 'FI', 'AT', 'CH', 'GR', 'RO', 'HU', 'HR', 'BG',
  'US-CAL-CISO', 'US-TEX-ERCO', 'US-NW-BPAT', 'CA-ON', 'CA-QC', 'MX',
  'BR-CS', 'BR-N', 'BR-NE', 'BR-S', 'AR', 'CL', 'AU-NEM-NSW', 'AU-NEM-VIC',
  'NZ-NZN', 'CN', 'IN-WEST', 'IN-NORTH', 'JP-TK', 'KR', 'ZA', 'NG', 'KE', 'MA', 'EG',
]

function normalizeWorldZoneId(apiZoneId: string): string {
  if (apiZoneId.startsWith('US-')) return 'US'
  if (apiZoneId.startsWith('CA-')) return 'CA'
  if (apiZoneId.startsWith('BR-')) return 'BR'
  if (apiZoneId.startsWith('AU-')) return 'AU'
  if (apiZoneId.startsWith('NZ-')) return 'NZ'
  if (apiZoneId.startsWith('IN-')) return 'IN'
  if (apiZoneId.startsWith('JP-')) return 'JP'
  return apiZoneId
}

async function fetchLatest(endpoint: LiveEndpoint, zone: string): Promise<ElectricityMapsApiResponse | null> {
  try {
    const response = await fetch(`/electricity-maps/v4/${endpoint}/latest?zone=${encodeURIComponent(zone)}`)
    if (!response.ok) return null
    return await response.json() as ElectricityMapsApiResponse
  } catch {
    return null
  }
}

export async function fetchLatestElectricityZones(): Promise<{
  zones: ElectricityZone[]
  live: boolean
}> {
  const liveZones = await Promise.all(ZONE_IDS.map(async (apiZoneId) => {
    const [carbon, load] = await Promise.all([
      fetchLatest('carbon-intensity', apiZoneId),
      fetchLatest('total-load', apiZoneId),
    ])
    if (!carbon && !load) return null

    const zoneId = normalizeWorldZoneId(apiZoneId)
    const countryNames = worldwideZoneCountries[zoneId] ?? [zoneId]
    const timestamp = carbon?.datetime ?? load?.datetime ?? new Date().toISOString()
    const merged: ElectricityZone = {
      id: zoneId,
      name: countryNames[0],
      country: countryNames[0],
      carbonIntensity: carbon?.carbonIntensity ?? 0,
      totalLoadMw: load?.value,
      timestamp,
      dataSource: 'live',
    }
    return merged
  }))

  const available = liveZones.filter((zone): zone is ElectricityZone => zone !== null)
  const worldZones = new Map<string, ElectricityZone>()
  available.forEach((liveZone) => {
    const existing = worldZones.get(liveZone.id)
    if (!existing) {
      worldZones.set(liveZone.id, liveZone)
      return
    }
    worldZones.set(liveZone.id, {
      ...existing,
      carbonIntensity: liveZone.carbonIntensity || existing.carbonIntensity,
      totalLoadMw: liveZone.totalLoadMw ?? existing.totalLoadMw,
      timestamp: liveZone.timestamp,
      dataSource: 'live',
    })
  })
  return {
    zones: Array.from(worldZones.values()),
    live: available.length > 0,
  }
}
