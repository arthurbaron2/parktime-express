import type { ThemeParksAPIDestination } from '../themeParksAPI.types.js'
import {
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
} from '../constants.js'
import type { Destination } from '../liveData.types.js'
import { serializeDestination } from '../serializer.js'

const parksToFetch = [
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
]

const fetchAllParksData = async (): Promise<Record<string, Destination>> => {
  const fetchedData: Record<string, Destination> = {}

  await Promise.all(
    parksToFetch.map(async (parkId: string) => {
      const data = await fetchParkData(parkId)
      if (data) {
        fetchedData[parkId] = data
      }
    }),
  )

  console.log('✅ themepark.wiki data fetched successfully')

  return fetchedData
}

const fetchParkData = async (parkId: string): Promise<Destination | null> => {
  if (!parkId) {
    throw new Error('Park ID is required')
  }

  try {
    const response = await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/live`, {
      // timeout après 15 secondes si le serveur ne répond pas
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} when fetching park ${parkId}`)
      return null
    }

    const data: ThemeParksAPIDestination = await response.json()
    return serializeDestination(data)
  } catch (error) {
    // Gestion des erreurs réseau ou timeout
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error(`⏱️ Timeout fetching data for park ${parkId}`)
    } else {
      console.error(`❌ Fetch failed for park ${parkId}:`, (error as Error).message)
    }
    return null
  }
}

export default { fetchAllParksData }
