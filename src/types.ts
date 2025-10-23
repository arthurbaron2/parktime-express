import type { AttractionLiveData, Status } from './liveData.types.js'

export interface WaitTimeRow {
  attractionId: string
  standbyWait: number | null
  singleRiderWait: number | null
  recordedAt: string
  status: Status
}

export interface EnrichedAttractionLiveData extends AttractionLiveData {
  parkId: string
  parkName: string
}

export interface RawAttraction {
  id: string
  name: string
  park_id: string
  park_name: string
  park_zone: string
  height_restriction: string
  interests: string[]
}

export interface Attraction {
  id: string
  name: string
  parkId: string
  parkName: string
  parkZone: string
  heightRestriction: string
  interests: string[]
}

export interface AttractionWithWaitTimes extends Attraction {
  standbyWait: number | null
  singleRiderWait: number | null
}

export interface RawAttractionStatistics {
  recorded_at: string
  standby_wait: number
  single_rider_wait: number
  status: Status
}

export interface DayAttractionWaitTimes {
  singleRider: AttractionWaitTime[]
  standby: AttractionWaitTime[]
  closedEvents: AttractionEvent[]
  downEvents: AttractionEvent[]
}

export interface AttractionWaitTime {
  recordedAt: string
  waitTime: number
}

export interface AttractionEvent {
  start: string
  end: string
}

export interface Uptime {
  totalTime: number
  operatingTime: number
  downTime: number
  uptimePercentage: number
}
