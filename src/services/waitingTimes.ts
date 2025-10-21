import type { WaitTimeRow } from '../types.js'
import type { Destination } from '../liveData.types.js'
import { getFlattenAttractionsData } from '../utils/attractions.js'
import waitingTimesQueries from '../queries/waitingTimes.js'

const putAllDestimationsWaitTimes = async (
  destinations: Record<string, Destination>,
): Promise<void> => {
  const filteredAttractionsData = getFlattenAttractionsData(destinations)

  const data: WaitTimeRow[] = filteredAttractionsData.map((attraction) => {
    return {
      attractionId: attraction.id,
      standbyWait: attraction.standbyWait,
      singleRiderWait: attraction.singleRiderWait,
      recordedAt: attraction.lastUpdated,
      status: attraction.status,
    }
  })

  if (data.length <= 0) return

  const chunkSize = 500
  for (let i = 0; i < data.length; i += chunkSize) {
    await waitingTimesQueries.insertManyWaitTimes(data.slice(i, i + chunkSize))
  }
}

export default { putAllDestimationsWaitTimes }
