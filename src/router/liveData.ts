import express from 'express'
import { getLiveData } from '../states/liveData.js'

const router = express.Router()

router.get('/all', (_, response) => {
  response.status(200).send(getLiveData())
})

router.get('/:parkId', (request, response) => {
  const { parkId } = request.params

  if (!parkId) {
    response.status(400).send('Park ID is required')
  }

  const data = getLiveData()[parkId as string]

  if (!data) {
    response.status(404).send('Park not found')
  }

  response.status(200).send(data)
})

export default router
