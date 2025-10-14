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
  externalId: string
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
  externalId: string
  queue?: {
    STANDBY: {
      waitTime: number
    }
    SINGLE_RIDER?: {
      waitTime: number
    }
  }
  status: Status
  lastUpdated: string
}

export interface ResortSchedule {
  id: string
  name: string
  entityType: 'DESTINATION'
  timezone: string
  parks: ParkSchedule[]
}

export interface ParkSchedule {
  id: string
  name: string
  entityType: 'PARK'
  schedule: Schedule[]
}

export interface Schedule {
  date: string
  type: 'EXTRA_HOURS' | 'OPERATING'
  closingTime: string
  description?: string
  openingTime: string
}
