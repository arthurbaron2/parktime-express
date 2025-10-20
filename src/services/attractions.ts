import type { Destination } from '../themeParksAPI.types.js'
import { getFlattenAttractionsData } from '../utils/attractions.js'
import attractionsQueries from '../queries/attractions.js'
import type { Attraction, AttractionStatisticsGrouped } from '../types.js'

const putAllDestimationsAttractions = async (
  destinations: Record<string, Destination>,
): Promise<void> => {
  const attractionsData = getFlattenAttractionsData(destinations)
  await attractionsQueries.insertManyAttractions(attractionsData, Object.keys(destinations).length)
}

const getAttractionById = async (id: string): Promise<Attraction | null> => {
  return await attractionsQueries.getAttractionById(id)
}

const getAttractionStatisticsById = async (
  id: string,
  timezone: string = 'Europe/Paris',
): Promise<AttractionStatisticsGrouped> => {
  return await attractionsQueries.getAttractionStatisticsById(id, timezone)
}

export default { putAllDestimationsAttractions, getAttractionById, getAttractionStatisticsById }
