import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-50m.json'
import { electricityZones, computingNodes } from '../../../mocks/electricity'
import type { ComputingNode, ElectricityMode, ElectricityZone, TimeInterval, TimeView } from '../types'

interface ElectricityMapProps {
  mode: ElectricityMode
  timeView: TimeView
  interval: TimeInterval
  onZoneSelect: (zone: ElectricityZone) => void
  onNodeSelect: (node: ComputingNode) => void
}

const ZONE_COUNTRIES: Record<string, string[]> = {
  'DE-LU': ['Germany', 'Luxembourg'],
  FR: ['France'],
  NL: ['Netherlands'],
  'DK-DK1': ['Denmark'],
  ES: ['Spain'],
  PT: ['Portugal'],
  'IT-NORTH': ['Italy'],
  'NO-NO1': ['Norway'],
  CZ: ['Czechia'],
  PL: ['Poland'],
}

function adjustedZone(zone: ElectricityZone, timeView: TimeView, interval: TimeInterval): ElectricityZone {
  const intervalFactor = interval === 'hourly' ? 0.985 : 1
  if (timeView === 'historical') {
    return { ...zone, carbonIntensity: Math.round(zone.carbonIntensity * 1.08 * intervalFactor), renewablePercentage: Math.max(0, Math.round(zone.renewablePercentage * 0.94)) }
  }
  if (timeView === 'forecast') {
    return { ...zone, carbonIntensity: Math.round(zone.carbonIntensity * 0.82 * intervalFactor), renewablePercentage: Math.min(100, Math.round(zone.renewablePercentage * 1.09)) }
  }
  return { ...zone, carbonIntensity: Math.round(zone.carbonIntensity * intervalFactor) }
}

export function ElectricityMap({ mode, timeView, interval, onZoneSelect, onNodeSelect }: ElectricityMapProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const adjustedZones = useMemo(
    () => electricityZones.map((zone) => adjustedZone(zone, timeView, interval)),
    [timeView, interval],
  )

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

  const projection = useMemo(() => geoMercator().fitExtent([[12, 18], [988, 632]], countries), [countries])
  const path = useMemo(() => geoPath(projection), [projection])

  const zoneColor = (zone: ElectricityZone) => {
    if (mode === 'renewable') {
      if (zone.renewablePercentage >= 85) return '#70a965'
      if (zone.renewablePercentage >= 65) return '#aeca77'
      if (zone.renewablePercentage >= 45) return '#d4c66f'
      return '#d48a62'
    }
    if (zone.carbonIntensity < 100) return '#70a965'
    if (zone.carbonIntensity < 200) return '#aeca77'
    if (zone.carbonIntensity < 350) return '#d4c66f'
    if (zone.carbonIntensity < 500) return '#d99a58'
    return '#c56e55'
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    setPan({
      x: dragRef.current.panX + (event.clientX - dragRef.current.x),
      y: dragRef.current.panY + (event.clientY - dragRef.current.y),
    })
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function resetMap() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
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
        <g transform={`translate(${500 + pan.x} ${325 + pan.y}) scale(${zoom}) translate(-500 -325)`}>
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
          {computingNodes.map((node) => {
            const coordinates = projection([node.longitude, node.latitude])
            if (!coordinates) return null
            return (
              <g
                key={node.id}
                className={`electricity-node ${node.status.toLowerCase()}`}
                transform={`translate(${coordinates[0]} ${coordinates[1]})`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onNodeSelect(node)}
                role="button"
                aria-label={`Open ${node.name}`}
              >
                <circle r={13 / zoom} fill="#ffffff" />
                <circle r={9 / zoom} fill="#3f7450" />
                <circle r={3 / zoom} fill="#dff1b7" />
                <title>{node.name} · {node.status}</title>
              </g>
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
