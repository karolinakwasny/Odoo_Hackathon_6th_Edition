import { useEffect, useState } from 'react'
import { fetchLatestElectricityZones } from '../services/electricityMaps'
import { countryZone } from '../utils/countryFlags'

/** Current carbon intensity (gCO₂eq/kWh) per Electricity Maps zone, from the same cached data as the network map. */
export function useCountryEmissions() {
  const [intensity, setIntensity] = useState<Record<string, number>>({})

  useEffect(() => {
    let active = true
    fetchLatestElectricityZones().then((result) => {
      if (!active) return
      setIntensity(Object.fromEntries(
        result.zones.filter((zone) => zone.carbonIntensity > 0).map((zone) => [zone.id, zone.carbonIntensity]),
      ))
    })
    return () => { active = false }
  }, [])

  /** gCO₂eq/kWh for a country code like "BE", or undefined if the API has no data for it. */
  return (code: string): number | undefined => intensity[countryZone(code)]
}

/** Same scale as the network map's colors: under 200 is low, under 350 medium, otherwise high. */
export function emissionLevel(gramsPerKwh: number): { label: 'Low' | 'Medium' | 'High'; color: string } {
  if (gramsPerKwh < 200) return { label: 'Low', color: 'green' }
  if (gramsPerKwh < 350) return { label: 'Medium', color: 'yellow' }
  return { label: 'High', color: 'orange' }
}
