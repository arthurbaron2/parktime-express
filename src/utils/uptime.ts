import { toLocal } from './date.js'
import attractionsService from '../services/attractions.js'
import { getParkTimezone } from './attractions.js'
import type { RawAttractionStatistics, Uptime } from '../types.js'
import queries from '../queries/attractions.js'

export const getAttractionUptimeByDate = async (
  attractionId?: string,
  date?: string,
): Promise<Uptime> => {
  if (!attractionId) {
    throw new Error('Attraction ID is required')
  }

  const attraction = await attractionsService.getAttractionById(attractionId)

  if (!attraction) {
    throw new Error('Attraction not found')
  }

  const timezone = getParkTimezone(attraction.parkId)

  if (date) {
    const parsedDate = toLocal(date, timezone)
    if (isNaN(new Date(parsedDate).getTime())) {
      throw new Error('Invalid date format')
    }
  }

  const statistics = await queries.getAttractionStatisticsByDate(attractionId, timezone, date)

  if (statistics.length === 0) {
    const message = date
      ? 'No statistics found for the specified date'
      : 'No statistics found for today'
    throw new Error(message)
  }

  return getAttractionDayUptime(statistics, timezone)
}

const getAttractionDayUptime = (
  dayStatistics: RawAttractionStatistics[],
  timezone: string,
): Uptime => {
  if (dayStatistics.length === 0) {
    return {
      totalTime: 0,
      operatingTime: 0,
      downTime: 0,
      uptimePercentage: 0,
    }
  }

  const lastStat = dayStatistics[dayStatistics.length - 1]
  const filteredStatistics =
    lastStat?.status === 'CLOSED' ? dayStatistics.slice(0, -1) : dayStatistics

  if (filteredStatistics.length === 0) {
    return {
      totalTime: 0,
      operatingTime: 0,
      downTime: 0,
      uptimePercentage: 0,
    }
  }

  const openingTime = toLocal(filteredStatistics[0]?.recorded_at, timezone)
  const closingTime = toLocal(
    filteredStatistics[filteredStatistics.length - 1]?.recorded_at,
    timezone,
  )

  const totalOperatingTimeMs = new Date(closingTime).getTime() - new Date(openingTime).getTime()
  const totalOperatingTime = Math.floor(totalOperatingTimeMs / (1000 * 60))

  const totalDownTimeMs = filteredStatistics.reduce((acc, curr, index) => {
    if (curr.status === 'DOWN' || curr.status === 'CLOSED') {
      const currentDate = new Date(toLocal(curr.recorded_at, timezone)).getTime()
      const nextDate = new Date(
        toLocal(filteredStatistics[index + 1]?.recorded_at, timezone),
      ).getTime()
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
