import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import "./ComputeGlobe.css";
import countries from "../../assets/countries.json";
import {
  energyData,
  getMockCountryData,
  getTimeAdjustedCountryData,
} from "../../data/energyData";
import { fetchLiveZones, getCachedElectricityZones } from "../../services/electricityMaps";

const getCountryCode = (country) => {
  const iso2 =
    country.properties.ISO_A2 ||
    country.properties.ISO_A2_EH ||
    "";
  if (iso2 && iso2 !== "-99") return iso2;

  const rawCode =
    country.properties.ISO_A3 ||
    country.properties.ADM0_A3 ||
    country.properties.iso_a3 ||
    "";

  const normalized = {
    DEU: "DE",
    FRA: "FR",
    DNK: "DK",
    USA: "US",
    BRA: "BR",
    IND: "IN",
    NOR: "NO",
    POL: "PL",
  };

  return normalized[rawCode] || rawCode;
};

const NO_DATA_COUNTRIES = new Set([
  "RU", "CN", "JP", "KR", "KP", "PK", "AF",
  "IR", "SA", "SY", "DZ", "LY", "SD", "CD",
  "CU", "VE", "BY", "UA", "MM",
]);

const hasCountryData = (country) => {
  return !NO_DATA_COUNTRIES.has(getCountryCode(country));
};

const normalizeLiveZoneCode = (zoneId) => {
  if (zoneId === 'DE-LU' || zoneId.startsWith('DE')) return 'DE';
  if (zoneId.startsWith('US-')) return 'US';
  if (zoneId.startsWith('CA-')) return 'CA';
  if (zoneId.startsWith('BR-')) return 'BR';
  if (zoneId.startsWith('AU-')) return 'AU';
  if (zoneId.startsWith('IN-')) return 'IN';
  if (zoneId.startsWith('JP-')) return 'JP';
  return zoneId;
};

const getCountryData = (country, timeOfDay, season, liveZones = []) => {
  const code = getCountryCode(country);
  const name = country.properties.NAME_EN || country.properties.ADMIN || code;
  const continent = country.properties.CONTINENT || "";
  const baseData = energyData[code] || getMockCountryData(code, name, continent);
  const liveZone = liveZones.find((zone) => normalizeLiveZoneCode(zone.id) === code);
  const adjusted = getTimeAdjustedCountryData(baseData, timeOfDay, season);
  if (!liveZone) return adjusted;
  return {
    ...adjusted,
    carbonIntensity: liveZone.carbonIntensity,
    totalLoadMw: liveZone.totalLoadMw,
    isLive: true,
  };
};

const getSuitability = (country, timeOfDay, season, liveZones = []) => {
  return getCountryData(country, timeOfDay, season, liveZones).suitability;
};

const getColor = (score) => {
  if (score === null) return "rgba(142, 150, 145, 0.58)";
  if (score >= 85) return "rgba(184, 237, 112, 0.82)";
  if (score >= 70) return "rgba(174, 205, 118, 0.82)";
  if (score >= 55) return "rgba(231, 182, 108, 0.82)";
  if (score >= 40) return "rgba(222, 143, 104, 0.82)";
  return "rgba(214, 112, 96, 0.82)";
};

const getRank = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Preferred";
  if (score >= 55) return "Moderate";
  if (score >= 40) return "Limited";
  return "Least preferred";
};

const getSourceRows = (data) => {
  const sources = data.energySources || {};
  return Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([source, value]) => `
      <div class="energy-source-row">
        <span>${source}</span>
        <div class="energy-source-track"><i style="width:${value}%"></i></div>
        <strong>${value}%</strong>
      </div>
    `)
    .join("");
};

export default function ComputeGlobe({
  projectName = null,
  projectNodeCount = 3,
  projectCountries = null,
  showProjectNodes = true,
  liveZoneData = [],
}) {
  const globeRef = useRef();

  const [hoveredCountry, setHoveredCountry] = useState(null);
  const timeOfDay = "Midday";
  const season = "Summer";
  const [globeSize, setGlobeSize] = useState({
    width: 600,
    height: 600,
  });
  const [liveZones, setLiveZones] = useState(() => liveZoneData.length ? liveZoneData : (getCachedElectricityZones()?.zones ?? []));
  useEffect(() => {
    let active = true
    fetchLiveZones().then((zones) => {
      if (active) setLiveZones(zones)
    })
    return () => { active = false }
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const size = Math.max(320, Math.round(Math.min(rect?.width || 600, rect?.height || 600)));
      setGlobeSize({ width: size, height: size });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const countriesData = useMemo(
    () => countries.features,
    []
  );

  const collaborationPoints = useMemo(() => {
    if (!showProjectNodes) return [];
    const locations = {
      DE: [{ lat: 52.52, lng: 13.405, label: 'Berlin' }, { lat: 48.14, lng: 11.58, label: 'Munich' }],
      FR: [{ lat: 48.8566, lng: 2.3522, label: 'Paris' }, { lat: 43.2965, lng: 5.3698, label: 'Marseille' }],
      GB: [{ lat: 51.5072, lng: -0.1276, label: 'London' }],
      US: [{ lat: 40.7128, lng: -74.006, label: 'New York' }, { lat: 37.7749, lng: -122.4194, label: 'San Francisco' }],
      DK: [{ lat: 55.6761, lng: 12.5683, label: 'Copenhagen' }],
      NO: [{ lat: 59.9139, lng: 10.7522, label: 'Oslo' }],
      ES: [{ lat: 40.4168, lng: -3.7038, label: 'Madrid' }],
      PT: [{ lat: 38.7223, lng: -9.1393, label: 'Lisbon' }],
      NL: [{ lat: 52.3676, lng: 4.9041, label: 'Amsterdam' }],
      BR: [{ lat: -23.55, lng: -46.63, label: 'São Paulo' }, { lat: -3.119, lng: -60.0217, label: 'Manaus' }],
      AU: [{ lat: -33.8688, lng: 151.2093, label: 'Sydney' }],
      CA: [{ lat: 45.5017, lng: -73.5673, label: 'Montreal' }],
      IN: [{ lat: 12.9716, lng: 77.5946, label: 'Bengaluru' }],
      ZA: [{ lat: -33.9249, lng: 18.4241, label: 'Cape Town' }],
      CL: [{ lat: -33.4489, lng: -70.6693, label: 'Santiago' }],
      JP: [{ lat: 36.2048, lng: 138.2529, label: 'Tsukuba' }],
    };
    const countriesToUse = projectCountries?.length
      ? projectCountries
      : ['DE', 'FR', 'GB', 'US', 'NO', 'DK'];
    const nodes = [];
    let seed = projectName
      ? [...projectName].reduce((sum, character) => sum + character.charCodeAt(0), 0)
      : 1;
    for (let index = 0; nodes.length < Math.max(3, Math.min(23, projectNodeCount)); index += 1) {
      const code = countriesToUse[index % countriesToUse.length];
      const availableLocations = locations[code] || [{ lat: 51.16, lng: 10.45, label: code }];
      const location = availableLocations[(seed + index) % availableLocations.length];
      seed = (seed * 17 + 11) % 997;
      nodes.push({
        code,
        lat: location.lat + ((seed % 7) - 3) * 0.18,
        lng: location.lng + ((seed % 9) - 4) * 0.18,
        label: `${location.label} node ${nodes.length + 1}`,
      });
    }
    return nodes;
  }, [projectCountries, projectName, projectNodeCount, showProjectNodes]);


  const handleCountryClick = (country) => {
    const code = getCountryCode(country);
    if (NO_DATA_COUNTRIES.has(code)) {
      return;
    }

  };

  return (
    <div className="compute-globe">
      <Globe
        ref={globeRef}
        width={globeSize.width}
        height={globeSize.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterialColor="#D4D8D1"
        atmosphereColor="#A9BDAA"
        atmosphereAltitude={0.12}
        polygonsData={countriesData}
        polygonAltitude={(country) =>
          country === hoveredCountry ? 0.025 : 0.008
        }
        polygonCapColor={(country) =>
          hasCountryData(country)
            ? getColor(getSuitability(country, timeOfDay, season, liveZones))
            : getColor(null)
        }
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={() => "rgba(82, 96, 82, 0.42)"}
        polygonLabel={(country) => {
          if (!hasCountryData(country)) {
            return `
              <div class="country-tooltip no-data-tooltip">
                <strong>${country.properties.NAME_EN || country.properties.ADMIN}</strong>
                <div class="no-data-label">No grid data available</div>
              </div>
            `;
          }
          const data = getCountryData(country, timeOfDay, season, liveZones);

          return `
            <div class="country-tooltip">
              <strong>${data.name}</strong>
              <div class="tooltip-rank ${data.status}">
                <b>${getRank(data.suitability)}</b>
                <span>${data.suitability}/100</span>
              </div>
              <div>Carbon intensity: ${data.carbonIntensity} gCO₂/kWh</div>
              <div>Primary clean signal: ${data.primarySource}</div>
              <div>Renewable overproduction: ${data.renewableOverproduction} GW</div>
              <div>Available nodes: ${data.availableNodes}</div>
              ${getSourceRows(data)}
            </div>
          `;
        }}
        onPolygonHover={setHoveredCountry}
        onPolygonClick={handleCountryClick}
        polygonsTransitionDuration={300}
        pointsData={collaborationPoints}
        pointLat={(point) => point.lat}
        pointLng={(point) => point.lng}
        pointAltitude={0.035}
        pointRadius={0.42}
        pointColor={() => '#d7ee91'}
        pointLabel={(point) => `
          <div class="country-tooltip">
            <strong>${point.label}</strong>
            <div>Connected to ${projectName || 'this project'}</div>
          </div>
        `}
        arcsData={collaborationPoints.length > 1
          ? collaborationPoints.slice(1).map((point, index) => ({
              startLat: collaborationPoints[0].lat,
              startLng: collaborationPoints[0].lng,
              endLat: point.lat,
              endLng: point.lng,
              index,
            }))
          : []}
        arcStartLat={(arc) => arc.startLat}
        arcStartLng={(arc) => arc.startLng}
        arcEndLat={(arc) => arc.endLat}
        arcEndLng={(arc) => arc.endLng}
        arcAltitude={0.24}
        arcAltitudeAutoScale={0.7}
        arcColor={() => ['rgba(181,232,106,.75)', 'rgba(215,238,145,.55)']}
        arcStroke={0.42}
        arcDashLength={0.18}
        arcDashGap={0.12}
        arcDashInitialGap={() => 0.08}
        arcDashAnimateTime={2400}
      />

      

      {/* {selectedCountry && (
        <div className="country-panel">
          <button
            className="country-panel-close"
          >
            ×
          </button>

          <div className="country-panel-label">
            ENERGY INTELLIGENCE
          </div>

          <h2>{selectedCountry.name}</h2>
          {selectedCountry.isMock && (
            <span className="mock-data-label">Illustrative country estimate</span>
          )}
          <div className={`rank-badge ${selectedCountry.status}`}>
            {getRank(selectedCountry.suitability)} · {selectedCountry.status}
          </div>

          <div className="forecast-context">
            <span>{selectedCountry.forecastLabel}</span>
            <strong>{selectedCountry.gridTrend}</strong>
          </div>

          <div className="suitability-score">
            {selectedCountry.suitability}
            <span>/100</span>
          </div>

          <p>
            Compute suitability
          </p>

          <div className="energy-visual-grid">
            <div
              className="renewable-ring"
              style={{
                "--renewable": `${selectedCountry.renewableShare * 3.6}deg`,
              }}
            >
              <div>
                <strong>{selectedCountry.renewableShare}%</strong>
                <span>renewables</span>
              </div>
            </div>

            <div className="overproduction-card">
              <div className="surplus-visual">
                <span />
                <span />
                <span />
              </div>
              <strong>
                {selectedCountry.renewableOverproduction > 0
                  ? `+${selectedCountry.renewableOverproduction} GW`
                  : "No surplus"}
              </strong>
              <small>renewable overproduction</small>
            </div>
          </div>

          <div className="energy-mix">
            <span className="energy-mix-label">Electricity mix</span>
            {Object.entries(selectedCountry.energySources || {})
              .sort((a, b) => b[1] - a[1])
              .map(([source, value]) => (
                <div className="energy-source-row" key={source}>
                  <span>{source}</span>
                  <div className="energy-source-track">
                    <i style={{ width: `${value}%` }} />
                  </div>
                  <strong>{value}%</strong>
                </div>
              ))}
          </div>

          <div className="impact-card">
            <span>Estimated impact for a 100 kW workload</span>
            <strong>{selectedCountry.avoidedKgPerHour} kg CO₂ avoided / hour</strong>
            <small>Compared with a 620 gCO₂/kWh fossil-grid reference</small>
          </div>

         
          

        </div>
      )} */}
    </div>
  );
}