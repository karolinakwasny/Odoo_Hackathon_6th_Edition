export type ElectricityMode = 'carbon' | 'renewable'
export type TimeView = 'current' | 'historical' | 'forecast'
export type TimeInterval = '15m' | 'hourly'
export type NodeStatus = 'Processing' | 'Idle' | 'Maintenance'

export interface ElectricityMix {
  wind: number
  solar: number
  hydro: number
  nuclear: number
  fossil: number
  other: number
}

export interface ElectricityZone {
  id: string
  name: string
  country: string
  carbonIntensity: number
  renewablePercentage: number
  electricityMix: ElectricityMix
  timestamp: string
  polygon: [number, number][]
}

export interface ComputingNode {
  id: string
  name: string
  zoneId: string
  latitude: number
  longitude: number
  cpuCapacity: number
  cpuUtilization: number
  availableMemoryGb: number
  currentTaskCount: number
  status: NodeStatus
}
