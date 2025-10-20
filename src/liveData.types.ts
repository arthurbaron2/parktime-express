export type EntityType = 'DESTINATION' | 'PARK' | 'ATTRACTION' | 'SHOW'

export type Status = 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT'

export interface Destination {
  id: string
  name: string
  entityType: EntityType
  timezone: string
  liveData: LiveData[]
}

export type LiveData = ShowLiveData | AttractionLiveData

export interface ShowLiveData {
  id: string
  name: string
  entityType: 'SHOW'
  parkId: string
  showtimes: {
    type: string
    endTime: string
    startTime: string
  }[]
  status: Status
  lastUpdated: string
}

export interface AttractionLiveData {
  id: string
  name: string
  entityType: 'ATTRACTION'
  parkId: string
  standbyWait: number | null
  singleRiderWait: number | null
  status: Status
  lastUpdated: string
}
