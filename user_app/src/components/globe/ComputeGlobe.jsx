import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import "./ComputeGlobe.css";
import countries from "../../assets/countries.json";
import {
  energyData,
  getMockCountryData,
  getTimeAdjustedCountryData,
} from "../../data/energyData";

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

const getCountryData = (country, timeOfDay, season) => {
  const code = getCountryCode(country);
  const name = country.properties.NAME_EN || country.properties.ADMIN || code;
  const continent = country.properties.CONTINENT || "";
  const baseData = energyData[code] || getMockCountryData(code, name, continent);
  return getTimeAdjustedCountryData(baseData, timeOfDay, season);
};

const getSuitability = (country, timeOfDay, season) => {
  return getCountryData(country, timeOfDay, season).suitability;
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

const PROJECT_COLLABORATORS = {
  'Find New Antibiotics': [
    { code: 'DE', lat: 51.16, lng: 10.45, label: 'Berlin' },
    { code: 'FR', lat: 46.61, lng: 2.21, label: 'Paris' },
    { code: 'GB', lat: 55.38, lng: -3.43, label: 'London' },
    { code: 'US', lat: 37.09, lng: -95.71, label: 'Boston' },
  ],
  'Forest Guardian': [
    { code: 'BR', lat: -14.24, lng: -51.93, label: 'Manaus' },
    { code: 'NO', lat: 60.47, lng: 8.47, label: 'Oslo' },
    { code: 'DK', lat: 56.26, lng: 9.5, label: 'Copenhagen' },
  ],
  "People's AI": [
    { code: 'US', lat: 37.09, lng: -95.71, label: 'San Francisco' },
    { code: 'DE', lat: 51.16, lng: 10.45, label: 'Berlin' },
    { code: 'IN', lat: 20.59, lng: 78.96, label: 'Bengaluru' },
    { code: 'ZA', lat: -30.56, lng: 22.94, label: 'Cape Town' },
  ],
  'Cosmic Commons': [
    { code: 'CL', lat: -35.68, lng: -71.54, label: 'Atacama' },
    { code: 'AU', lat: -25.27, lng: 133.78, label: 'Canberra' },
    { code: 'ES', lat: 40.46, lng: -3.75, label: 'Granada' },
  ],
  'Climate Futures': [
    { code: 'DK', lat: 56.26, lng: 9.5, label: 'Copenhagen' },
    { code: 'NO', lat: 60.47, lng: 8.47, label: 'Oslo' },
    { code: 'DE', lat: 51.16, lng: 10.45, label: 'Hamburg' },
    { code: 'BR', lat: -14.24, lng: -51.93, label: 'São Paulo' },
  ],
  'Power the Future': [
    { code: 'CN', lat: 35.86, lng: 104.19, label: 'Shanghai' },
    { code: 'JP', lat: 36.2, lng: 138.25, label: 'Tsukuba' },
    { code: 'DE', lat: 51.16, lng: 10.45, label: 'Munich' },
  ],
}

export default function ComputeGlobe({
  compact = false,
  selectedCountryCode = null,
  highlightedProject = null,
  projectNodeCount = 3,
  projectCountries = null,
  showControls: _showControls = true,
  onCountrySelect = null,
  showDetailPanel = true,
}) {
  const globeRef = useRef();
  const containerRef = useRef(null);

  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCode, setSelectedCode] = useState(selectedCountryCode);
  const [timeOfDay] = useState("Midday");
  const [season] = useState("Summer");
  const [globeSize, setGlobeSize] = useState({
    width: compact ? 300 : 900,
    height: compact ? 220 : 590,
  });

  useEffect(() => {
    if (compact) {
      return undefined;
    }
    let frame = 0;
    const updateSize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        setGlobeSize({
          width: Math.max(320, Math.round(rect?.width || 900)),
          height: Math.max(590, Math.round(rect?.height || 590)),
        });
      });
    };
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [compact]);

  const countriesData = useMemo(
    () => countries.features,
    []
  );

  const collaborationPoints = useMemo(() => {
    if (compact || !highlightedProject) return [];
    const countryLocations = {
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
      AU: [{ lat: -33.8688, lng: 151.2093, label: 'Sydney' }, { lat: -35.2809, lng: 149.13, label: 'Canberra' }],
      CA: [{ lat: 45.5017, lng: -73.5673, label: 'Montreal' }],
      IN: [{ lat: 12.9716, lng: 77.5946, label: 'Bengaluru' }],
      ZA: [{ lat: -33.9249, lng: 18.4241, label: 'Cape Town' }],
      CL: [{ lat: -33.4489, lng: -70.6693, label: 'Santiago' }],
      JP: [{ lat: 36.2048, lng: 138.2529, label: 'Tsukuba' }],
    };
    const countriesToUse = projectCountries?.length
      ? projectCountries
      : (PROJECT_COLLABORATORS[highlightedProject] || []).map((point) => point.code);
    const uniqueCountries = [...new Set(countriesToUse)].slice(0, 12);
    const nodes = [];
    let seed = highlightedProject
      ? [...highlightedProject].reduce((sum, character) => sum + character.charCodeAt(0), 0)
      : 1;
    for (let index = 0; nodes.length < Math.max(3, Math.min(23, projectNodeCount)); index += 1) {
      const countryCode = uniqueCountries[index % uniqueCountries.length] || 'DE';
      const locations = countryLocations[countryCode] || [{ lat: 51.16, lng: 10.45, label: countryCode }];
      const location = locations[(seed + index) % locations.length];
      seed = (seed * 17 + 11) % 997;
      nodes.push({
        code: countryCode,
        lat: location.lat + ((seed % 7) - 3) * 0.18,
        lng: location.lng + ((seed % 9) - 4) * 0.18,
        label: `${location.label} node ${nodes.length + 1}`,
      });
    }
    return nodes;
  }, [compact, highlightedProject, projectCountries, projectNodeCount]);

  const selectedCountry = useMemo(() => {
    const activeCode = selectedCode || selectedCountryCode;
    if (!activeCode) return null;
    const countryFeature = countriesData.find(
      (country) => getCountryCode(country) === activeCode,
    );
    if (!countryFeature) return null;
    return {
      code: activeCode,
      ...getCountryData(countryFeature, timeOfDay, season),
    };
  }, [countriesData, selectedCode, selectedCountryCode, season, timeOfDay]);

  const handleCountryClick = (country) => {
    const code = getCountryCode(country);
    if (NO_DATA_COUNTRIES.has(code)) {
      setSelectedCode(null);
      onCountrySelect?.(null);
      return;
    }
    setSelectedCode(code);
    onCountrySelect?.(code);

  };

  return (
    <div ref={containerRef} className={`compute-globe${compact ? ' compact' : ''}${highlightedProject ? ' project-linked' : ''}`}>
      {/* {highlightedProject && (
        <div className="globe-project-ribbon">
          <span>Selected project</span>
          <strong>{highlightedProject}</strong>
        </div>
      )} */}
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
          country === hoveredCountry
            ? 0.025
            : getCountryCode(country) === (selectedCode || selectedCountryCode)
              ? 0.018
              : 0.008
        }
        polygonCapColor={(country) =>
          hasCountryData(country)
            ? getColor(getSuitability(country, timeOfDay, season))
            : getColor(null)
        }
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={(country) =>
          getCountryCode(country) === (selectedCode || selectedCountryCode)
            ? "#f2df91"
            : "rgba(82, 96, 82, 0.42)"
        }
        polygonLabel={(country) => {
          if (!hasCountryData(country)) {
            return `
              <div class="country-tooltip no-data-tooltip">
                <strong>${country.properties.NAME_EN || country.properties.ADMIN}</strong>
                <div class="no-data-label">No grid data available</div>
              </div>
            `;
          }
          const data = getCountryData(country, timeOfDay, season);

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
        pointsData={compact
          ? (selectedCode || selectedCountryCode
              ? (() => {
                  const countryFeature = countriesData.find(
                    (country) => getCountryCode(country) === (selectedCode || selectedCountryCode),
                  );
                  if (!countryFeature) return [];
                  const geometry = countryFeature.geometry;
                  if (geometry.type === 'Point') {
                    return [{ lat: geometry.coordinates[1], lng: geometry.coordinates[0], label: countryFeature.properties.NAME_EN || countryFeature.properties.ADMIN }];
                  }
                  const name = countryFeature.properties.NAME_EN || countryFeature.properties.ADMIN;
                  const knownLocations = {
                    Germany: { lat: 51.16, lng: 10.45 },
                    France: { lat: 46.61, lng: 2.21 },
                    Denmark: { lat: 56.26, lng: 9.5 },
                    Poland: { lat: 51.92, lng: 19.14 },
                    Norway: { lat: 60.47, lng: 8.47 },
                    Spain: { lat: 40.46, lng: -3.75 },
                    Portugal: { lat: 39.4, lng: -8.22 },
                    'United Kingdom': { lat: 55.38, lng: -3.43 },
                    'United States': { lat: 37.09, lng: -95.71 },
                    Brazil: { lat: -14.24, lng: -51.93 },
                    Canada: { lat: 56.13, lng: -106.35 },
                    India: { lat: 20.59, lng: 78.96 },
                    Japan: { lat: 36.2, lng: 138.25 },
                    Australia: { lat: -25.27, lng: 133.78 },
                    'South Africa': { lat: -30.56, lng: 22.94 },
                  };
                  const location = knownLocations[name] || { lat: 51.16, lng: 10.45 };
                  return [{ lat: location.lat, lng: location.lng, label: name }];
                })()
              : [])
          : collaborationPoints}
        pointLat={(point) => point.lat}
        pointLng={(point) => point.lng}
        pointAltitude={0.035}
        pointRadius={0.42}
        pointColor={() => '#d7ee91'}
        pointLabel={(point) => `
          <div class="collaboration-tooltip">
            <strong>${point.label}</strong>
            <div>Contributing to ${highlightedProject || 'this project'}</div>
          </div>
        `}
        arcsData={!compact && collaborationPoints.length > 1
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

      {/* {showControls && <div className="simulation-controls" aria-label="Energy forecast controls">
        <label>
          <span>Part of day</span>
          <select value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)}>
            {TIME_PERIODS.map((period) => <option key={period}>{period}</option>)}
          </select>
        </label>
        <label>
          <span>Season</span>
          <select value={season} onChange={(event) => setSeason(event.target.value)}>
            {SEASONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>} */}

      {showDetailPanel && selectedCountry && (
        <div className="country-panel">
          <button
            className="country-panel-close"
            onClick={() => setSelectedCode(null)}
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
      )}
    </div>
  );
}