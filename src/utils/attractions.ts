import type { Destination, AttractionLiveData } from '../liveData.types.js'
import type {
  EnrichedAttractionLiveData,
  WaitTimeRow,
  Uptime,
  AttractionStatistics,
} from '../types.js'
import { getLiveData } from '../states/liveData.js'
import { toLocal } from './date.js'

export const getFlattenAttractionsData = (
  destinations: Record<string, Destination>,
): EnrichedAttractionLiveData[] =>
  Object.entries(destinations).reduce<EnrichedAttractionLiveData[]>(
    (acc, [parkId, destination]) => {
      const attractions = destination.liveData
        .filter((attraction) => attraction.entityType === 'ATTRACTION')
        .map((attraction) => getEnrichedAttractionLiveData(attraction, parkId, destination.name))

      return [...acc, ...attractions]
    },
    [],
  )

const getEnrichedAttractionLiveData = (
  attraction: AttractionLiveData,
  parkId: string,
  parkName: string,
): EnrichedAttractionLiveData => ({
  ...attraction,
  parkId: parkId,
  parkName: parkName,
})

export const getAttractionWaitTimes = (attractionId: string, parkId: string): WaitTimeRow => {
  const data = getLiveData()
  const attraction = data[parkId]?.liveData.find((attraction) => attraction.id === attractionId) as
    | AttractionLiveData
    | undefined

  if (!attraction) {
    throw new Error(`Attraction ${attractionId} not found in park ${parkId}`)
  }

  return {
    attractionId,
    standbyWait: attraction.standbyWait,
    singleRiderWait: attraction.singleRiderWait,
    recordedAt: attraction.lastUpdated,
    status: attraction.status,
  }
}

export const getParkTimezone = (parkId: string): string => {
  const data = getLiveData()
  const park = data[parkId]
  if (!park) {
    throw new Error(`Park ${parkId} not found`)
  }
  return park.timezone
}

export const getAttractionDayUptime = (
  dayStatistics: AttractionStatistics[],
  timezone: string,
): Uptime => {
  const openingTime = toLocal(dayStatistics[0]?.recordedAt, timezone)
  const closingTime = toLocal(dayStatistics[dayStatistics.length - 1]?.recordedAt, timezone)

  const totalOperatingTimeMs = new Date(closingTime).getTime() - new Date(openingTime).getTime()
  const totalOperatingTime = Math.floor(totalOperatingTimeMs / (1000 * 60))

  const totalDownTimeMs = dayStatistics.reduce((acc, curr, index) => {
    if (curr.status === 'DOWN') {
      const currentDate = new Date(toLocal(curr.recordedAt, timezone)).getTime()
      const nextDate = new Date(toLocal(dayStatistics[index + 1]?.recordedAt, timezone)).getTime()
      const currentDuration = nextDate - currentDate
      return acc + currentDuration
    }
    return acc
  }, 0)

  const totalDownTime = Math.floor(totalDownTimeMs / (1000 * 60))

  const uptimePercentage =
    totalOperatingTimeMs > 0
      ? Math.round(((totalOperatingTimeMs - totalDownTimeMs) / totalOperatingTimeMs) * 100 * 100) /
        100
      : 0

  return {
    totalTime: totalOperatingTime,
    operatingTime: totalOperatingTime - totalDownTime,
    downTime: totalDownTime,
    uptimePercentage: uptimePercentage,
  }
}
