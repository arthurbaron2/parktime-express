import express from 'express'
import { getAttractionWaitTimes, getParkTimezone } from '../utils/attractions.js'
import attractionsService from '../services/attractions.js'
import { toLocal } from '../utils/date.js'
import { getAttractionUptimeByDate } from '../utils/uptime.js'
import type { DayAttractionWaitTimes } from '../types.js'

const router = express.Router()

router.get('/:attractionId', async (request, response) => {
  const { attractionId } = request.params

  if (!attractionId) {
    response.status(400).send('Attraction ID is required')
    return
  }

  const attraction = await attractionsService.getAttractionById(attractionId)

  if (!attraction) {
    response.status(404).send('Attraction not found')
    return
  }

  const waitTimes = getAttractionWaitTimes(attraction.id, attraction.parkId)
  response.status(200).send({
    ...attraction,
    liveData: {
      standbyWait: waitTimes.standbyWait,
      singleRiderWait: waitTimes.singleRiderWait,
      recordedAt: waitTimes.recordedAt,
      status: waitTimes.status,
    },
  })
})

const handleWaitTimesRequest = async (
  request: express.Request,
  response: express.Response,
  date?: string,
) => {
  const { attractionId } = request.params

  if (!attractionId) {
    response.status(400).send('Attraction ID is required')
    return
  }

  const attraction = await attractionsService.getAttractionById(attractionId)

  if (!attraction) {
    response.status(404).send('Attraction not found')
    return
  }

  const timezone = getParkTimezone(attraction.parkId)

  // Validation de la date si fournie
  if (date) {
    const parsedDate = toLocal(date, timezone)
    if (isNaN(new Date(parsedDate).getTime())) {
      response.status(400).send('Invalid date format')
      return
    }
  }

  const statistics: DayAttractionWaitTimes = await attractionsService.getAttractionWaitTimesByDate(
    attractionId,
    timezone,
    date,
  )

  response.status(200).send(statistics)
}

router.get('/:attractionId/wait-times', async (request, response) => {
  await handleWaitTimesRequest(request, response)
})

router.get('/:attractionId/wait-times/:date', async (request, response) => {
  const { date } = request.params
  await handleWaitTimesRequest(request, response, date)
})

const handleUptimeRequest = async (request: express.Request, response: express.Response) => {
  const { attractionId, date } = request.params

  try {
    const uptime = await getAttractionUptimeByDate(attractionId, date)
    response.status(200).send(uptime)
  } catch (error) {
    response.status(500).send((error as Error).message)
  }
}

router.get('/:attractionId/uptime', async (request, response) => {
  await handleUptimeRequest(request, response)
})

router.get('/:attractionId/uptime/:date', async (request, response) => {
  await handleUptimeRequest(request, response)
})

export default router
