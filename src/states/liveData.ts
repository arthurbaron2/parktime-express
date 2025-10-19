import type { Destination } from '../themeParksAPI.types.js'

let liveData: Record<string, Destination> = {}

export const setLiveData = (data: Record<string, Destination>) => {
  liveData = data
}

export const getLiveData = () => {
  return liveData
}
