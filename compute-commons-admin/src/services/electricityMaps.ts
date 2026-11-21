import type {
  ElectricityMapsApiResponse,
  ElectricityMapsZoneMetadata,
  ElectricityZone,
} from '../features/network/types'

type LiveEndpoint = 'carbon-intensity' | 'total-load'

const CACHE_KEY = 'compute-commons:electricity-zones'
const CACHE_TTL_MS = 30 * 60 * 1000

interface ElectricityCache {
  fetchedAt: number
  zones: ElectricityZone[]
  live: boolean
}

let memoryCache: ElectricityCache | null = null
let inFlightRequest: Promise<{
  zones: ElectricityZone[]
  live: boolean
}> | null = null

function readCachedResult(): ElectricityCache | null {
  if (memoryCache) return memoryCache
  try {
    const stored = sessionStorage.getItem(CACHE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as ElectricityCache
    if (!Array.isArray(parsed.zones) || typeof parsed.fetchedAt !== 'number') return null
    memoryCache = parsed
    return parsed
  } catch {
    return null
  }
}

export function getCachedElectricityZones(): ElectricityCache | null {
  return readCachedResult()
}

export function isElectricityCacheFresh(cache: ElectricityCache | null): boolean {
  return cache !== null && Date.now() - cache.fetchedAt < CACHE_TTL_MS
}

async function fetchAvailableZones(): Promise<ElectricityMapsZoneMetadata[]> {
  const response = await fetch('/electricity-maps/v4/zones')
  if (!response.ok) throw new Error(`Failed to fetch zones: ${response.status}`)
  const data = await response.json() as Record<string, ElectricityMapsZoneMetadata>
  return Object.values(data).filter((zone) =>
    zone.isCommerciallyAvailable
    && (zone.access?.includes('*') || zone.access?.includes('carbon-intensity/latest') || zone.access?.includes('total-load/latest'))
  )
}

function hasAccess(apiZone: ElectricityMapsZoneMetadata, endpoint: LiveEndpoint): boolean {
  return !apiZone.access
    || apiZone.access.includes('*')
    || apiZone.access.includes(`${endpoint}/latest`)
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

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  transform: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await transform(items[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

export async function fetchLatestElectricityZones(): Promise<{
  zones: ElectricityZone[]
  live: boolean
}> {
  const cached = readCachedResult()
  if (isElectricityCacheFresh(cached)) {
    return { zones: cached?.zones ?? [], live: cached?.live ?? false }
  }
  if (inFlightRequest) return inFlightRequest

  inFlightRequest = (async () => {
  let apiZones: ElectricityMapsZoneMetadata[]
  try {
    apiZones = await fetchAvailableZones()
  } catch {
    return { zones: cached?.zones ?? [], live: false }
  }

  const liveZones = await mapWithConcurrency(apiZones, 8, async (apiZone) => {
    const [carbon, load] = await Promise.all([
      hasAccess(apiZone, 'carbon-intensity')
        ? fetchLatest('carbon-intensity', apiZone.zoneKey)
        : null,
      hasAccess(apiZone, 'total-load')
        ? fetchLatest('total-load', apiZone.zoneKey)
        : null,
    ])
    if (!carbon && !load) return null

    const timestamp = carbon?.datetime ?? load?.datetime ?? new Date().toISOString()
    const merged: ElectricityZone = {
      id: apiZone.zoneKey,
      name: apiZone.displayName || apiZone.zoneName,
      country: apiZone.countryName,
      countryCode: apiZone.countryCode,
      carbonIntensity: carbon?.carbonIntensity ?? null,
      totalLoadMw: load?.value,
      timestamp,
      dataSource: 'live',
    }
    return merged
  })

  const available = liveZones.filter((zone): zone is ElectricityZone => zone !== null)
  const result = {
    zones: available,
    live: available.length > 0,
  }
  memoryCache = {
    fetchedAt: Date.now(),
    ...result,
  }
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache))
  } catch {
    // In-memory cache remains available if storage is blocked.
  }
  return result
  })().finally(() => {
    inFlightRequest = null
  })

  return inFlightRequest
}
