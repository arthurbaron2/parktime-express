import type { Destination } from '../liveData.types.js'
import { getFlattenAttractionsData } from '../utils/attractions.js'
import { transformRawStatisticsToDayWaitTimes } from '../utils/dayWaitTimes.js'
import attractionsQueries from '../queries/attractions.js'
import type { Attraction, DayAttractionWaitTimes } from '../types.js'

const putAllDestimationsAttractions = async (
  destinations: Record<string, Destination>,
): Promise<void> => {
  const attractionsData = getFlattenAttractionsData(destinations)
  await attractionsQueries.insertManyAttractions(attractionsData, Object.keys(destinations).length)
}

const getAttractionById = async (id: string): Promise<Attraction | null> => {
  return await attractionsQueries.getAttractionById(id)
}

const getAttractionWaitTimesByDate = async (
  id: string,
  timezone: string,
  date?: string,
): Promise<DayAttractionWaitTimes> => {
  const rawStatistics = await attractionsQueries.getAttractionStatisticsByDate(id, timezone, date)
  return transformRawStatisticsToDayWaitTimes(rawStatistics, timezone)
}

export default { putAllDestimationsAttractions, getAttractionById, getAttractionWaitTimesByDate }
