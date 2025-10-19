import type { AttractionLiveData } from "./themeParksAPI.types.js";

export interface WaitTimeRow {
  attractionId: string;
  standbyWait: number | null;
  singleRiderWait: number | null;
}

export interface EnrichedAttractionLiveData extends AttractionLiveData {
  park_id: string;
}
