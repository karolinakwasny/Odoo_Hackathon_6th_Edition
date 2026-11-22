import { useMemo } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-50m.json'
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'

interface WorldMapProps {
  selectedCountry?: string
  onCountrySelect?: (country: string) => void
  compact?: boolean
  highlightedProject?: string
}

const COUNTRY_VALUES: Record<string, number> = {
  Germany: 82,
  France: 91,
  Denmark: 96,
  Norway: 98,
  Brazil: 88,
  Poland: 42,
  India: 54,
  'United States of America': 65,
  Canada: 72,
  Spain: 76,
  Portugal: 84,
  Australia: 58,
  'South Africa': 48,
  Japan: 44,
}

const colorFor = (value: number | undefined) =>
  value === undefined ? '#c7cfc7'
  : value >= 85 ? '#b8ed70'
  : value >= 70 ? '#aecb76'
  : value >= 55 ? '#e7b66c'
  : value >= 40 ? '#de8f68'
  : '#d67060'

export function WorldMap({ selectedCountry, onCountrySelect, compact = false, highlightedProject }: WorldMapProps) {
  const countries = useMemo(() => {
    const topology = world as unknown as Topology<{ countries: GeometryCollection }>
    const collection = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    return collection.features.filter((item) => String(item.properties?.name) !== 'Antarctica')
  }, [])

  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent(compact ? [[18, 18], [282, 180]] : [[24, 20], [676, 410]], {
      type: 'FeatureCollection',
      features: countries,
    } as FeatureCollection<Geometry, GeoJsonProperties>),
    [compact, countries],
  )
  const path = useMemo(() => geoPath(projection), [projection])

  return (
    <div className={`world-map${compact ? ' compact' : ''}`}>
      {highlightedProject && <span className="map-project-tag">{highlightedProject}</span>}
      <svg viewBox={compact ? '0 0 300 200' : '0 0 700 430'} role="img" aria-label="World energy and project map">
        {countries.map((country, index) => {
          const name = String(country.properties?.name ?? '')
          const value = COUNTRY_VALUES[name]
          const selected = name === selectedCountry
          return (
            <path
              key={`${name}-${index}`}
              d={path(country) ?? undefined}
              fill={selected ? '#f2df91' : colorFor(value)}
              fillOpacity={value === undefined ? 0.48 : 0.82}
              stroke={selected ? '#4e7355' : '#f7f8f3'}
              strokeWidth={selected ? 2 : 0.8}
              className={onCountrySelect ? 'country-selectable' : undefined}
              onClick={() => onCountrySelect?.(name)}
            >
              <title>{name}{value !== undefined ? ` · suitability ${value}/100` : ' · grid data unavailable'}</title>
            </path>
          )
        })}
      </svg>
    </div>
  )
}
