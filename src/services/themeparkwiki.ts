import type { Destination } from '../themeParksAPI.types.js'
import {
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
} from '../constants.js'

const parksToFetch = [
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
]

const fetchAllParksData = async (): Promise<Record<string, Destination>> => {
  let fetchedData: Record<string, Destination> = {}

  await Promise.all(
    parksToFetch.map(async (parkId) => {
      const data = await fetchParkData(parkId)
      fetchedData = { ...fetchedData, [parkId]: data }
    }),
  )

  console.log('✅ themepark.wiki data fetched successfully')

  return fetchedData
}

const fetchParkData = async (parkId: string): Promise<Destination> => {
  if (!parkId) {
    throw new Error('Park ID is required')
  }

  const response = await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/live`)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const data = await response.json()
  return data
}

export default { fetchAllParksData }
