import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-50m.json'
import { worldwideZoneCountries } from '../../../mocks/electricity'
import type { ElectricityMode, ElectricityZone } from '../types'

interface ElectricityMapProps {
  mode: ElectricityMode
  onZoneSelect: (zone: ElectricityZone) => void
  zones?: ElectricityZone[]
}

const ZONE_COUNTRIES = worldwideZoneCountries

export function ElectricityMap({ mode, onZoneSelect, zones }: ElectricityMapProps) {
  const [zoom, setZoom] = useState(1)
  const panRef = useRef({ x: 0, y: 0 })
  const mapGroupRef = useRef<SVGGElement>(null)
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const frameRef = useRef<number | null>(null)

  const adjustedZones = useMemo(
    () => zones ?? [],
    [zones],
  )

  useEffect(() => {
    if (mapGroupRef.current) {
      mapGroupRef.current.setAttribute(
        'transform',
        `translate(${500 + panRef.current.x} ${325 + panRef.current.y}) scale(${zoom}) translate(-500 -325)`,
      )
    }
  }, [zoom])

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
  }, [])

  const countries = useMemo(() => {
    const topology = world as unknown as Topology<{ countries: GeometryCollection }>
    const collection = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    return {
      type: 'FeatureCollection',
      features: collection.features.filter((item) =>
        String(item.properties?.name ?? '') !== 'Antarctica'
      ),
    } satisfies FeatureCollection<Geometry, GeoJsonProperties>
  }, [])

  const projection = useMemo(() => geoNaturalEarth1().fitExtent([[12, 18], [988, 632]], countries), [countries])
  const path = useMemo(() => geoPath(projection), [projection])

  const zoneColor = (zone: ElectricityZone) => {
    if (mode === 'load') {
      const load = zone.totalLoadMw ?? 0
      if (load < 10000) return '#b7d3a3'
      if (load < 30000) return '#89b66f'
      if (load < 60000) return '#d2c86a'
      if (load < 100000) return '#d99a58'
      return '#c56e55'
    }
    if (zone.carbonIntensity < 100) return '#70a965'
    if (zone.carbonIntensity < 200) return '#aeca77'
    if (zone.carbonIntensity < 350) return '#d4c66f'
    if (zone.carbonIntensity < 500) return '#d99a58'
    return '#c56e55'
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    const nextX = dragRef.current.panX + (event.clientX - dragRef.current.x)
    const nextY = dragRef.current.panY + (event.clientY - dragRef.current.y)
    panRef.current = { x: nextX, y: nextY }
    if (frameRef.current !== null) return
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null
      if (mapGroupRef.current) {
        mapGroupRef.current.setAttribute(
          'transform',
          `translate(${500 + panRef.current.x} ${325 + panRef.current.y}) scale(${zoom}) translate(-500 -325)`,
        )
      }
    })
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function resetMap() {
    panRef.current = { x: 0, y: 0 }
    setZoom(1)
    if (mapGroupRef.current) {
      mapGroupRef.current.setAttribute(
        'transform',
        'translate(500 325) scale(1) translate(-500 -325)',
      )
    }
  }

  return (
    <div className="europe-map">
      <svg
        viewBox="0 0 1000 650"
        role="img"
        aria-label="World electricity zones"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <rect width="1000" height="650" fill="#edf1e9" />
        <g ref={mapGroupRef} transform={`translate(500 325) scale(${zoom}) translate(-500 -325)`}>
          {countries.features.map((country, index) => {
            const countryName = String(country.properties?.name ?? '')
            const zone = adjustedZones.find((item) =>
              (ZONE_COUNTRIES[item.id] ?? []).includes(countryName)
            )
            return (
              <path
                key={String(countryName || index)}
                d={path(country) ?? undefined}
                fill={zone ? zoneColor(zone) : '#dfe7da'}
                fillOpacity={zone ? '.82' : '.95'}
                stroke="#f8faf6"
                strokeWidth={1.2 / zoom}
                className={zone ? 'electricity-zone' : undefined}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => zone && onZoneSelect(zone)}
              >
                {zone && <title>{zone.name}: {zone.carbonIntensity} gCO₂eq/kWh</title>}
              </path>
            )
          })}
        </g>
      </svg>
      <div className="europe-map-navigation" aria-label="Map navigation">
        <button type="button" onClick={() => setZoom((value) => Math.min(4, value * 1.25))} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(.8, value / 1.25))} aria-label="Zoom out">−</button>
        <button type="button" onClick={resetMap} aria-label="Reset map">Reset</button>
      </div>
    </div>
  )
}
