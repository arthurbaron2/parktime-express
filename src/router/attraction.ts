import express from 'express'
import { getAttractionWaitTimes } from '../utils/attractions.js'
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

  const waitTimes = getAttractionWaitTimes(attraction.id, attraction.park_id)
  response.status(200).send({ ...attraction, ...waitTimes })
})

router.get('/:attractionId/statistics', async (request, response) => {
  const { attractionId } = request.params

  if (!attractionId) {
    response.status(400).send('Attraction ID is required')
    return
  }

  const statistics = await attractionsService.getAttractionStatisticsById(attractionId)

  response.status(200).send(statistics)
})

export default router
