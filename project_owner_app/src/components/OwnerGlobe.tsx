import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-50m.json'

interface GlobePoint { lat: number; lng: number; label: string }
interface GlobeArc { startLat: number; startLng: number; endLat: number; endLng: number; index: number }

const ownerNodes: GlobePoint[] = [
  { lat: 52.52, lng: 13.405, label: 'Berlin' },
  { lat: 38.7223, lng: -9.1393, label: 'Lisbon' },
  { lat: -1.2921, lng: 36.8219, label: 'Nairobi' },
  { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  { lat: -23.5505, lng: -46.6333, label: 'São Paulo' },
  { lat: 43.6532, lng: -79.3832, label: 'Toronto' },
]

export function OwnerGlobe() {
  const globeRef = useRef(undefined)
  const [size, setSize] = useState({ width: 700, height: 650 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      setSize({
        width: Math.max(420, Math.round(rect?.width || 700)),
        height: Math.max(520, Math.round(rect?.height || 650)),
      })
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const countries = useMemo(() => {
    const topology = world as unknown as Topology<{ countries: GeometryCollection }>
    const collection = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    return collection.features.filter((item) => String(item.properties?.name) !== 'Antarctica')
  }, [])

  const projection = useMemo(() => geoNaturalEarth1().fitExtent([[12, 12], [688, 638]], {
    type: 'FeatureCollection',
    features: countries,
  } as FeatureCollection<Geometry, GeoJsonProperties>), [countries])
  const path = useMemo(() => geoPath(projection), [projection])

  return (
    <div ref={containerRef} className="owner-real-globe">
      <svg viewBox="0 0 700 650" aria-label="Distributed owner network globe">
        {countries.map((country, index) => (
          <path
            key={`${String(country.properties?.name)}-${index}`}
            d={path(country) ?? undefined}
            fill="#18322d"
            stroke="#93bdae"
            strokeOpacity=".28"
            strokeWidth=".7"
          />
        ))}
      </svg>
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#87c7b2"
        atmosphereAltitude={0.12}
        pointsData={ownerNodes}
        pointLat={(point: object) => (point as GlobePoint).lat}
        pointLng={(point: object) => (point as GlobePoint).lng}
        pointAltitude={0.035}
        pointRadius={0.38}
        pointColor={() => '#c7ebda'}
        pointLabel={(point: object) => `<strong>${(point as GlobePoint).label}</strong><div>Active compute region</div>`}
        arcsData={ownerNodes.slice(1).map((point, index) => ({
          startLat: ownerNodes[0].lat,
          startLng: ownerNodes[0].lng,
          endLat: point.lat,
          endLng: point.lng,
          index,
        }))}
        arcStartLat={(arc: object) => (arc as GlobeArc).startLat}
        arcStartLng={(arc: object) => (arc as GlobeArc).startLng}
        arcEndLat={(arc: object) => (arc as GlobeArc).endLat}
        arcEndLng={(arc: object) => (arc as GlobeArc).endLng}
        arcAltitude={0.22}
        arcColor={() => ['rgba(149,217,189,.8)', 'rgba(199,235,218,.55)']}
        arcStroke={0.42}
        arcDashLength={0.18}
        arcDashGap={0.12}
        arcDashAnimateTime={2400}
      />
    </div>
  )
}
