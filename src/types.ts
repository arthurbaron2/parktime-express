import type { AttractionLiveData } from './themeParksAPI.types.js'

export interface WaitTimeRow {
  attractionId: string
  standbyWait: number | null
  singleRiderWait: number | null
  recorded_at: string
}

export interface EnrichedAttractionLiveData extends AttractionLiveData {
  park_id: string
}

export interface Attraction {
  id: string
  name: string
  park_id: string
}

export interface AttractionWithWaitTimes extends Attraction {
  standbyWait: number | null
  singleRiderWait: number | null
}

export interface RawAttractionStatistics {
  period: string
  recorded_at: string
  standby_wait: number
  single_rider_wait: number
}

export interface AttractionStatistics {
  recorded_at: string | null
  standby_wait: number
  single_rider_wait: number
}

export type AttractionStatisticsGrouped = Record<string, AttractionStatistics[]>
