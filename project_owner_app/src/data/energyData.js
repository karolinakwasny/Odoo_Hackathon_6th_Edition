export const energyData = {
  DE: {
    name: "Germany",
    suitability: 78,
    carbonIntensity: 142,
    renewableShare: 64,
    availableNodes: 243,
    activeWorkloads: 86,
    energySources: {
      wind: 35,
      solar: 18,
      hydro: 11,
      fossil: 36,
    },
    status: "good",
    primarySource: "Wind and solar",
    renewableOverproduction: 1.8,
    gridTrend: "Renewable share rising",
    explanation:
      "Low-carbon electricity and available computing capacity make this region suitable for flexible workloads.",
  },

  PL: {
    name: "Poland",
    suitability: 42,
    carbonIntensity: 510,
    renewableShare: 28,
    availableNodes: 89,
    activeWorkloads: 31,
    energySources: {
      wind: 18,
      solar: 10,
      hydro: 0,
      fossil: 72,
    },
    status: "poor",
    primarySource: "Fossil-heavy generation",
    renewableOverproduction: 0,
    gridTrend: "Grid demand exceeds clean supply",
    explanation:
      "High carbon intensity makes this region less favorable for additional computing workloads.",
  },

  FR: {
    name: "France",
    suitability: 91,
    carbonIntensity: 58,
    renewableShare: 42,
    availableNodes: 312,
    activeWorkloads: 102,
    energySources: {
      wind: 15,
      solar: 12,
      hydro: 15,
      fossil: 8,
      nuclear: 50,
    },
    status: "excellent",
    primarySource: "Hydro and nuclear",
    renewableOverproduction: 4.6,
    gridTrend: "Clean supply in surplus",
    explanation:
      "Low-carbon electricity generation provides favorable conditions for computation.",
  },

  DK: {
    name: "Denmark",
    suitability: 96,
    carbonIntensity: 35,
    renewableShare: 82,
    availableNodes: 134,
    activeWorkloads: 58,
    energySources: {
      wind: 62,
      solar: 12,
      hydro: 0,
      fossil: 26,
    },
    status: "excellent",
    primarySource: "Wind",
    renewableOverproduction: 6.2,
    gridTrend: "Strong wind overproduction",
    explanation:
      "Strong wind generation and low carbon intensity make Denmark an excellent destination.",
  },

  US: {
    name: "United States",
    suitability: 65,
    carbonIntensity: 320,
    renewableShare: 24,
    availableNodes: 421,
    activeWorkloads: 187,
    energySources: {
      wind: 12,
      solar: 7,
      hydro: 5,
      fossil: 60,
      nuclear: 16,
    },
    status: "moderate",
    primarySource: "Mixed regional supply",
    renewableOverproduction: 0.4,
    gridTrend: "Clean availability varies by region",
    explanation:
      "Conditions vary significantly between regions. Some areas have abundant renewable electricity.",
  },

  BR: {
    name: "Brazil",
    suitability: 88,
    carbonIntensity: 90,
    renewableShare: 86,
    availableNodes: 115,
    activeWorkloads: 45,
    energySources: {
      wind: 14,
      solar: 12,
      hydro: 60,
      fossil: 14,
    },
    status: "excellent",
    primarySource: "Hydro",
    renewableOverproduction: 5.4,
    gridTrend: "Hydropower abundant",
    explanation:
      "A high renewable electricity share makes this region promising for flexible computing.",
  },

  IN: {
    name: "India",
    suitability: 54,
    carbonIntensity: 460,
    renewableShare: 30,
    availableNodes: 92,
    activeWorkloads: 41,
    energySources: {
      wind: 10,
      solar: 15,
      hydro: 5,
      fossil: 70,
    },
    status: "moderate",
    primarySource: "Fossil-heavy generation",
    renewableOverproduction: 0,
    gridTrend: "Solar capacity growing",
    explanation:
      "Conditions are mixed, with growing renewable capacity and substantial fossil generation.",
  },

  NO: {
    name: "Norway",
    suitability: 98,
    carbonIntensity: 25,
    renewableShare: 98,
    availableNodes: 174,
    activeWorkloads: 65,
    energySources: {
      wind: 10,
      solar: 1,
      hydro: 87,
      fossil: 2,
    },
    status: "excellent",
    primarySource: "Hydropower",
    renewableOverproduction: 7.8,
    gridTrend: "Clean supply in surplus",
    explanation:
      "Extremely low-carbon electricity and abundant hydropower create favorable conditions.",
  },
};

const seededValue = (seed, min, max) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return min + (hash % (max - min + 1));
};

export const getMockCountryData = (code, name, continent = "") => {
  const known = energyData[code];
  if (known) return known;

  const renewableBase =
    continent === "Europe" ? 58 :
    continent === "South America" ? 62 :
    continent === "Oceania" ? 52 :
    continent === "North America" ? 42 :
    continent === "Africa" ? 38 :
    continent === "Asia" ? 34 : 42;

  const renewableShare = Math.min(
    92,
    Math.max(
      18,
      renewableBase + seededValue(`${code}-renewable`, -24, 24),
    ),
  );
  const fossil = Math.min(
    82,
    Math.max(8, 82 - renewableShare + seededValue(`${code}-fossil`, -8, 8)),
  );
  const hydro = continent === "South America"
    ? seededValue(`${code}-hydro`, 25, 55)
    : seededValue(`${code}-hydro`, 2, 22);
  const wind = seededValue(`${code}-wind`, 8, 30);
  const solar = seededValue(`${code}-solar`, 5, 24);
  const nuclear = continent === "Europe"
    ? seededValue(`${code}-nuclear`, 0, 18)
    : seededValue(`${code}-nuclear`, 0, 8);
  const sum = hydro + wind + solar + fossil + nuclear;
  const normalize = (value) => Math.round((value / sum) * 100);

  const carbonIntensity = Math.round(
    620 - renewableShare * 5.2 + seededValue(`${code}-carbon`, -35, 35),
  );
  const suitability = Math.round(
    18 + renewableShare * 0.72 - Math.max(0, carbonIntensity - 180) * 0.08
      + seededValue(`${code}-suitability`, -6, 6),
  );
  const clampedSuitability = Math.min(98, Math.max(18, suitability));
  const status = clampedSuitability >= 75
    ? "excellent"
    : clampedSuitability >= 45
      ? "good"
      : "poor";
  const renewableOverproduction =
    clampedSuitability >= 75
      ? (seededValue(`${code}-surplus`, 8, 68) / 10)
      : clampedSuitability >= 45
        ? (seededValue(`${code}-surplus`, 1, 25) / 10)
        : 0;
  const primarySource =
    hydro >= wind && hydro >= solar
      ? "Hydropower"
      : wind >= solar
        ? "Wind"
        : "Solar";
  const gridTrend =
    status === "excellent"
      ? "Clean supply in surplus"
      : status === "good"
        ? "Renewable supply available"
        : "Clean supply limited";

  return {
    name,
    suitability: clampedSuitability,
    carbonIntensity: Math.max(20, carbonIntensity),
    renewableShare,
    availableNodes: seededValue(`${code}-nodes`, 34, 280),
    activeWorkloads: seededValue(`${code}-workloads`, 12, 115),
    energySources: {
      wind: normalize(wind),
      solar: normalize(solar),
      hydro: normalize(hydro),
      nuclear: normalize(nuclear),
      fossil: normalize(fossil),
    },
    status,
    primarySource,
    renewableOverproduction,
    gridTrend,
    isMock: true,
    explanation:
      status === "excellent"
        ? "Strong renewable availability and low estimated carbon intensity make this a preferred destination for flexible computing."
        : status === "good"
          ? "A balanced clean-energy supply makes this region suitable, with conditions varying by time and local grid zone."
          : "Estimated fossil generation and carbon intensity make this region less favorable for additional computing workloads.",
  };
};

export const TIME_PERIODS = ["Night", "Morning", "Midday", "Evening"];
export const SEASONS = ["Winter", "Spring", "Summer", "Autumn"];

export const getTimeAdjustedCountryData = (
  baseData,
  timeOfDay = "Midday",
  season = "Summer",
) => {
  const dayFactors = {
    Night: 0,
    Morning: 0.55,
    Midday: 1.15,
    Evening: 0.35,
  };
  const solarSeasonFactors = {
    Winter: 0.58,
    Spring: 0.95,
    Summer: 1.28,
    Autumn: 0.82,
  };
  const windSeasonFactors = {
    Winter: 1.22,
    Spring: 1.05,
    Summer: 0.82,
    Autumn: 1.12,
  };
  const hydroSeasonFactors = {
    Winter: 0.82,
    Spring: 1.18,
    Summer: 0.92,
    Autumn: 1.08,
  };
  const demandFactors = {
    Night: 0.82,
    Morning: 1.08,
    Midday: 1.18,
    Evening: 1.28,
  };

  const baseSources = baseData.energySources || {};
  const adjusted = {
    wind: (baseSources.wind || 0) * windSeasonFactors[season],
    solar: (baseSources.solar || 0) * dayFactors[timeOfDay] * solarSeasonFactors[season],
    hydro: (baseSources.hydro || 0) * hydroSeasonFactors[season],
    nuclear: baseSources.nuclear || 0,
    fossil: baseSources.fossil || 0,
  };

  const cleanGeneration =
    adjusted.wind + adjusted.solar + adjusted.hydro + adjusted.nuclear;
  const demandPressure = demandFactors[timeOfDay];
  const renewablePressure =
    (adjusted.wind + adjusted.solar + adjusted.hydro) * (1.08 - demandPressure * 0.08);
  const fossilAdjustment =
    demandPressure > 1.1
      ? (demandPressure - 1) * 12
      : -(Math.max(0, renewablePressure - 58) * 0.16);
  adjusted.fossil = Math.max(
    4,
    adjusted.fossil + fossilAdjustment,
  );

  const total = Object.values(adjusted).reduce((sum, value) => sum + value, 0);
  const normalizedSources = Object.fromEntries(
    Object.entries(adjusted).map(([source, value]) => [
      source,
      Math.round((value / total) * 100),
    ]),
  );

  const renewableShare =
    (normalizedSources.wind || 0)
    + (normalizedSources.solar || 0)
    + (normalizedSources.hydro || 0);
  const carbonIntensity = Math.round(
    (normalizedSources.fossil || 0) * 6.2
    + (normalizedSources.solar || 0) * 0.42
    + (normalizedSources.wind || 0) * 0.11
    + (normalizedSources.hydro || 0) * 0.24
    + (normalizedSources.nuclear || 0) * 0.12,
  );
  const cleanSurplus = Math.max(
    0,
    renewablePressure - 48 * demandPressure,
  );
  const renewableOverproduction = Math.round(cleanSurplus * 10) / 10;
  const surplusBonus =
    renewableOverproduction > 4 ? 12
    : renewableOverproduction > 1 ? 6
    : 0;
  const cleanMixBonus = renewableShare * 0.55;
  const lowCarbonBonus = Math.max(0, 220 - carbonIntensity) * 0.08;
  const nodesBonus = Math.min(8, (baseData.availableNodes || 0) / 45);
  const suitability = Math.max(
    10,
    Math.min(
      98,
      Math.round(
        22
        + cleanMixBonus
        + lowCarbonBonus
        + surplusBonus
        + nodesBonus
        - demandPressure * 4,
      ),
    ),
  );
  const status =
    suitability >= 85 ? "excellent"
    : suitability >= 70 ? "preferred"
    : suitability >= 55 ? "moderate"
    : suitability >= 40 ? "limited"
    : "poor";
  const gridTrend =
    renewableOverproduction > 4
      ? "Clean supply in surplus"
      : renewableShare > 55
        ? "Renewable generation is available"
        : demandPressure > 1.15
          ? "Peak demand is raising carbon intensity"
          : "Clean supply is limited";
  const primarySource =
    ["hydro", "wind", "solar", "nuclear"]
      .map((source) => [source, normalizedSources[source] || 0])
      .sort((a, b) => b[1] - a[1])[0][0];
  const primarySourceLabel =
    primarySource === "hydro" ? "Hydropower"
    : primarySource === "nuclear" ? "Nuclear"
    : primarySource === "wind" ? "Wind"
    : "Solar";
  const avoidedKgPerHour =
    Math.max(0, 620 - carbonIntensity) * 0.1;

  return {
    ...baseData,
    energySources: normalizedSources,
    renewableShare,
    carbonIntensity,
    renewableOverproduction,
    suitability,
    status,
    primarySource: primarySourceLabel,
    gridTrend,
    avoidedKgPerHour: Math.round(avoidedKgPerHour),
    forecastLabel: `${timeOfDay} · ${season}`,
    cleanGeneration,
  };
};