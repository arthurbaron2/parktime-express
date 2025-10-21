import express from 'express'
import { getAttractionWaitTimes, getParkTimezone } from '../utils/attractions.js'
import attractionsService from '../services/attractions.js'

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

router.get('/:attractionId/statistics', async (request, response) => {
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

  const statistics = await attractionsService.getAttractionStatisticsById(attractionId, timezone)

  response.status(200).send(statistics)
})

export default router
