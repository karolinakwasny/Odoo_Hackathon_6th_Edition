import type { ElectricityZone, ComputingNode } from '../features/network/types'

export const electricityZones: ElectricityZone[] = [
  { id: 'DE-LU', name: 'Germany–Luxembourg', country: 'Germany / Luxembourg', carbonIntensity: 312, renewablePercentage: 58, electricityMix: { wind: 26, solar: 14, hydro: 4, nuclear: 7, fossil: 43, other: 6 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[5.8,49.1],[7.2,53.5],[9.4,54.9],[14.9,54.8],[15.1,51.1],[12.1,47.3],[8.2,47.4],[5.8,49.1]] },
  { id: 'FR', name: 'France', country: 'France', carbonIntensity: 68, renewablePercentage: 76, electricityMix: { wind: 11, solar: 8, hydro: 13, nuclear: 59, fossil: 5, other: 4 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[-4.7,42.3],[-1.1,46.5],[2.1,51.1],[8.2,49.8],[7.5,43.7],[2.7,42.3],[-4.7,42.3]] },
  { id: 'NL', name: 'Netherlands', country: 'Netherlands', carbonIntensity: 265, renewablePercentage: 49, electricityMix: { wind: 23, solar: 16, hydro: 1, nuclear: 4, fossil: 51, other: 5 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[3.4,51.1],[3.7,53.5],[7.2,53.5],[7.2,50.8],[5.8,50.7],[3.4,51.1]] },
  { id: 'DK-DK1', name: 'West Denmark', country: 'Denmark', carbonIntensity: 146, renewablePercentage: 82, electricityMix: { wind: 52, solar: 11, hydro: 1, nuclear: 0, fossil: 17, other: 19 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[8.0,54.7],[8.1,57.8],[10.6,57.7],[11.0,55.0],[9.6,54.5],[8.0,54.7]] },
  { id: 'ES', name: 'Spain', country: 'Spain', carbonIntensity: 191, renewablePercentage: 71, electricityMix: { wind: 19, solar: 24, hydro: 16, nuclear: 20, fossil: 17, other: 4 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[-9.4,36.0],[-9.2,43.7],[3.2,43.3],[3.1,38.7],[0.0,36.1],[-9.4,36.0]] },
  { id: 'PT', name: 'Portugal', country: 'Portugal', carbonIntensity: 118, renewablePercentage: 79, electricityMix: { wind: 29, solar: 21, hydro: 24, nuclear: 0, fossil: 20, other: 6 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[-9.5,36.9],[-9.4,42.1],[-6.2,42.0],[-6.7,36.9],[-9.5,36.9]] },
  { id: 'IT-NORTH', name: 'North Italy', country: 'Italy', carbonIntensity: 244, renewablePercentage: 54, electricityMix: { wind: 5, solar: 18, hydro: 22, nuclear: 0, fossil: 48, other: 7 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[6.6,43.6],[7.5,46.5],[13.8,46.7],[16.2,44.0],[12.6,42.4],[9.2,42.8],[6.6,43.6]] },
  { id: 'NO-NO1', name: 'Oslo / East Norway', country: 'Norway', carbonIntensity: 32, renewablePercentage: 96, electricityMix: { wind: 8, solar: 1, hydro: 87, nuclear: 0, fossil: 2, other: 2 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[4.8,57.8],[5.0,62.0],[12.0,69.0],[20.0,69.0],[18.0,58.0],[12.0,57.8],[4.8,57.8]] },
  { id: 'CZ', name: 'Czechia', country: 'Czechia', carbonIntensity: 338, renewablePercentage: 31, electricityMix: { wind: 2, solar: 14, hydro: 3, nuclear: 38, fossil: 39, other: 4 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[12.0,48.6],[12.1,51.1],[18.9,51.0],[18.8,48.6],[16.0,47.7],[12.0,48.6]] },
  { id: 'PL', name: 'Poland', country: 'Poland', carbonIntensity: 612, renewablePercentage: 23, electricityMix: { wind: 12, solar: 6, hydro: 2, nuclear: 0, fossil: 77, other: 3 }, timestamp: '2026-11-21T12:00:00Z', polygon: [[14.1,49.0],[14.2,54.8],[19.1,54.9],[24.0,53.8],[23.7,49.0],[14.1,49.0]] },
]

export const computingNodes: ComputingNode[] = [
  { id: 'de-berlin-03', name: 'Berlin-03', zoneId: 'DE-LU', latitude: 52.52, longitude: 13.405, cpuCapacity: 128, cpuUtilization: 72, availableMemoryGb: 246, currentTaskCount: 38, status: 'Processing' },
  { id: 'nl-amsterdam-02', name: 'Amsterdam-02', zoneId: 'NL', latitude: 52.3676, longitude: 4.9041, cpuCapacity: 96, cpuUtilization: 61, availableMemoryGb: 188, currentTaskCount: 24, status: 'Processing' },
  { id: 'fr-paris-05', name: 'Paris-05', zoneId: 'FR', latitude: 48.8566, longitude: 2.3522, cpuCapacity: 160, cpuUtilization: 48, availableMemoryGb: 320, currentTaskCount: 31, status: 'Idle' },
  { id: 'dk-copenhagen-01', name: 'Copenhagen-01', zoneId: 'DK-DK1', latitude: 55.6761, longitude: 12.5683, cpuCapacity: 112, cpuUtilization: 83, availableMemoryGb: 142, currentTaskCount: 42, status: 'Processing' },
  { id: 'pt-lisbon-02', name: 'Lisbon-02', zoneId: 'PT', latitude: 38.7223, longitude: -9.1393, cpuCapacity: 64, cpuUtilization: 38, availableMemoryGb: 128, currentTaskCount: 11, status: 'Idle' },
  { id: 'es-madrid-04', name: 'Madrid-04', zoneId: 'ES', latitude: 40.4168, longitude: -3.7038, cpuCapacity: 128, cpuUtilization: 67, availableMemoryGb: 214, currentTaskCount: 29, status: 'Processing' },
  { id: 'no-oslo-01', name: 'Oslo-01', zoneId: 'NO-NO1', latitude: 59.9139, longitude: 10.7522, cpuCapacity: 192, cpuUtilization: 55, availableMemoryGb: 384, currentTaskCount: 46, status: 'Processing' },
  { id: 'cz-prague-02', name: 'Prague-02', zoneId: 'CZ', latitude: 50.0755, longitude: 14.4378, cpuCapacity: 80, cpuUtilization: 29, availableMemoryGb: 96, currentTaskCount: 8, status: 'Maintenance' },
]
