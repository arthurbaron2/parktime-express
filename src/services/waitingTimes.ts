import type { WaitTimeRow } from '../types.js'
import type { Destination } from '../themeParksAPI.types.js'
import { filterAttractionsData } from '../utils/attractions.js'
import { getFlattenAttractionsData } from '../utils/attractions.js'
import waitingTimesQueries from '../queries/waitingTimes.js'

const putAllDestimationsWaitTimes = async (
  destinations: Record<string, Destination>,
): Promise<void> => {
  const filteredAttractionsData = filterAttractionsData(getFlattenAttractionsData(destinations))

  const data: WaitTimeRow[] = filteredAttractionsData.map((attraction) => {
    return {
      attractionId: attraction.id,
      standbyWait: attraction.queue?.STANDBY?.waitTime ?? null,
      singleRiderWait: attraction.queue?.SINGLE_RIDER?.waitTime ?? null,
    }
  })

  if (data.length > 0) {
    await waitingTimesQueries.insertManyWaitTimes(data)
  }
}

export default { putAllDestimationsWaitTimes }
