import type {
  ThemeParksAPIAttractionLiveData,
  ThemeParksAPIDestination,
  ThemeParksAPILiveData,
  ThemeParksAPIShowLiveData,
} from './themeParksAPI.types.js'
import type { AttractionLiveData, Destination, LiveData, ShowLiveData } from './liveData.types.js'
import { toLocal } from './utils/date.js'

export const serializeDestination = ({
  id,
  name,
  entityType,
  timezone,
  liveData,
}: ThemeParksAPIDestination): Destination => ({
  id,
  name,
  entityType,
  timezone,
  liveData: liveData.map((liveData) => serializeLiveData(liveData, timezone)),
})

const serializeLiveData = (liveData: ThemeParksAPILiveData, timezone: string): LiveData => {
  if (liveData.entityType === 'ATTRACTION') {
    return serializeAttractionLiveData(liveData as ThemeParksAPIAttractionLiveData, timezone)
  }
  return serializeShowLiveData(liveData as ThemeParksAPIShowLiveData, timezone)
}

const serializeAttractionLiveData = (
  { id, name, entityType, parkId, queue, status, lastUpdated }: ThemeParksAPIAttractionLiveData,
  timezone: string,
): AttractionLiveData => ({
  id,
  name,
  entityType,
  parkId,
  standbyWait: queue?.STANDBY?.waitTime ?? null,
  singleRiderWait: queue?.SINGLE_RIDER?.waitTime ?? null,
  status,
  lastUpdated: toLocal(lastUpdated, timezone),
})

const serializeShowLiveData = (
  { id, name, entityType, parkId, showtimes, status, lastUpdated }: ThemeParksAPIShowLiveData,
  timezone: string,
): ShowLiveData => ({
  id,
  name,
  entityType,
  parkId,
  showtimes,
  status,
  lastUpdated: toLocal(lastUpdated, timezone),
})
