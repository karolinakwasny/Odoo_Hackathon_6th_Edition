export type ElectricityMode = 'carbon' | 'load'
export type TimeView = 'current'
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
  timestamp: string
  totalLoadMw?: number
  renewablePercentage?: number
  dataSource: 'live'
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

export interface ElectricityMapsApiResponse {
  zone: string
  datetime: string
  carbonIntensity?: number
  renewablePercentage?: number
  value?: number
  unit?: string
}
