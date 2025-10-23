import type {
  RawAttractionStatistics,
  DayAttractionWaitTimes,
  AttractionWaitTime,
  AttractionEvent,
} from '../types.js'
import { toLocal } from './date.js'

export const transformRawStatisticsToDayWaitTimes = (
  rawStatistics: RawAttractionStatistics[],
  timezone: string,
): DayAttractionWaitTimes => {
  const standby: AttractionWaitTime[] = []
  const singleRider: AttractionWaitTime[] = []
  const closedEvents: AttractionEvent[] = []
  const downEvents: AttractionEvent[] = []

  // Ajouter un événement de fermeture entre minuit et la première ouverture
  if (rawStatistics.length > 0) {
    const firstRecord = rawStatistics[0]

    if (firstRecord) {
      const firstRecordDate = new Date(firstRecord.recorded_at)
      const midnight = new Date(firstRecordDate)
      midnight.setHours(0, 0, 0, 0)

      // Vérifier si la première entrée n'est pas déjà à minuit
      if (firstRecordDate.getTime() !== midnight.getTime()) {
        closedEvents.push({
          start: toLocal(midnight.toISOString(), timezone),
          end: firstRecord.recorded_at,
        })
      }
    }
  }

  rawStatistics.forEach((stat, index) => {
    // Ajouter les temps d'attente
    if (stat.standby_wait !== null) {
      standby.push({
        recordedAt: stat.recorded_at,
        waitTime: stat.standby_wait,
      })
    }

    if (stat.single_rider_wait !== null) {
      singleRider.push({
        recordedAt: stat.recorded_at,
        waitTime: stat.single_rider_wait,
      })
    }

    if (stat.status === 'DOWN' || stat.status === 'CLOSED') {
      const currentTime = stat.recorded_at
      const nextTime =
        rawStatistics[index + 1]?.recorded_at || toLocal(new Date().toISOString(), timezone)

      const event: AttractionEvent = {
        start: currentTime,
        end: nextTime,
      }

      if (stat.status === 'DOWN') {
        downEvents.push(event)
      } else if (stat.status === 'CLOSED') {
        closedEvents.push(event)
      }
    }
  })

  return {
    standby,
    singleRider,
    closedEvents,
    downEvents,
  }
}
