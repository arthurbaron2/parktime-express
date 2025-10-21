import type { Destination, AttractionLiveData } from '../liveData.types.js'
import type { EnrichedAttractionLiveData, WaitTimeRow } from '../types.js'
import { getLiveData } from '../states/liveData.js'

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
