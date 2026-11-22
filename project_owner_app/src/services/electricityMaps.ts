export interface LiveZone {
  id: string
  name: string
  carbonIntensity: number
  totalLoadMw?: number
  timestamp: string
  live: boolean
}

const ZONE_IDS = ['DE','FR','NL','DK-DK1','ES','PT','IT-NORTH','NO-NO1','CZ','PL','BE','GB','IE','SE','FI','AT','CH','GR','RO','HU','HR','BG','US-CAL-CISO','US-TEX-ERCO','US-NW-BPAT','CA-ON','CA-QC','MX','BR-CS','BR-N','BR-NE','BR-S','AR','CL','AU-NEM-NSW','AU-NEM-VIC','NZ-NZN','CN','IN-WEST','IN-NORTH','JP-TK','KR','ZA','NG','KE','MA','EG']
const CACHE_KEY = 'project-owner:electricity-zones'
const CACHE_TTL_MS = 30 * 60 * 1000

let memoryCache: { fetchedAt: number; zones: LiveZone[] } | null = null
let inFlight: Promise<LiveZone[]> | null = null

function readCache() {
  if (memoryCache) return memoryCache
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { fetchedAt: number; zones: LiveZone[] }
    memoryCache = parsed
    return parsed
  } catch {
    return null
  }
}

export function getCachedElectricityZones() {
  return readCache()
}

export function isElectricityCacheFresh(cache: { fetchedAt: number } | null) {
  return cache !== null && Date.now() - cache.fetchedAt < CACHE_TTL_MS
}

async function fetchLatest(endpoint: 'carbon-intensity' | 'total-load', zone: string) {
  try {
    const response = await fetch(`/electricity-maps/v4/${endpoint}/latest?zone=${encodeURIComponent(zone)}`)
    if (!response.ok) return null
    return await response.json() as {
      zone: string
      datetime: string
      carbonIntensity?: number
      value?: number
    }
  } catch {
    return null
  }
}

export async function fetchLiveZones(): Promise<LiveZone[]> {
  const cache = readCache()
  if (isElectricityCacheFresh(cache)) return cache?.zones ?? []
  if (inFlight) return inFlight

  inFlight = (async () => {
    const zones = await Promise.all(ZONE_IDS.map(async (zone) => {
      const [carbon, load] = await Promise.all([
        fetchLatest('carbon-intensity', zone),
        fetchLatest('total-load', zone),
      ])
      if (!carbon && !load) return null
      const liveZone: LiveZone = {
        id: zone,
        name: zone,
        carbonIntensity: carbon?.carbonIntensity ?? 0,
        totalLoadMw: load?.value,
        timestamp: carbon?.datetime ?? load?.datetime ?? new Date().toISOString(),
        live: true,
      }
      return liveZone
    }))
    const liveZones: LiveZone[] = zones.filter((zone): zone is LiveZone => zone !== null)
    memoryCache = { fetchedAt: Date.now(), zones: liveZones }
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache))
    } catch {
      // In-memory cache remains usable if session storage is unavailable.
    }
    return liveZones
  })()

  try {
    return await inFlight
  } finally {
    inFlight = null
  }
}
