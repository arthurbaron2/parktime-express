import type { Destination } from "./themeParksAPI.types.js";
import {
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
} from "./constants.js";
import queries from "./queries.js";
import type { AttractionLiveData, LiveData } from "./themeParksAPI.types.js";
import type { EnrichedAttractionLiveData, WaitTimeRow } from "./types.js";

const parksToFetch = [
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
];

export const fetchAllParksData = async (): Promise<
  Record<string, Destination>
> => {
  let fetchedData: Record<string, Destination> = {};

  await Promise.all(
    parksToFetch.map(async (parkId) => {
      const data = await fetchParkData(parkId);
      fetchedData = { ...fetchedData, [parkId]: data };
    })
  );

  console.log("✅ Park data fetched successfully");

  return fetchedData;
};

const fetchParkData = async (parkId: string): Promise<Destination> => {
  if (!parkId) {
    throw new Error("Park ID is required");
  }

  const response = await fetch(
    `https://api.themeparks.wiki/v1/entity/${parkId}/live`
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

const getFattenAttractionsData = (
  destinations: Record<string, Destination>
): EnrichedAttractionLiveData[] =>
  Object.entries(destinations).reduce<EnrichedAttractionLiveData[]>(
    (acc, [parkId, destination]) => {
      const attractions = destination.liveData
        .filter((attraction) => attraction.entityType === "ATTRACTION")
        .map((attraction) => getEnrichedAttractionLiveData(attraction, parkId));

      return [...acc, ...attractions];
    },
    []
  );

const getEnrichedAttractionLiveData = (
  attraction: AttractionLiveData,
  parkId: string
): EnrichedAttractionLiveData => ({
  ...attraction,
  park_id: parkId,
});

const filterAttractionsData = (
  attractionsData: EnrichedAttractionLiveData[]
): EnrichedAttractionLiveData[] =>
  attractionsData.filter((attraction) => attraction.status === "OPERATING");

export const putAllDestimationsWaitTimes = async (
  destinations: Record<string, Destination>
): Promise<void> => {
  const filteredAttractionsData = filterAttractionsData(
    getFattenAttractionsData(destinations)
  );

  const data: WaitTimeRow[] = filteredAttractionsData.map((attraction) => {
    return {
      attractionId: attraction.id,
      standbyWait: attraction.queue?.STANDBY?.waitTime ?? null,
      singleRiderWait: attraction.queue?.SINGLE_RIDER?.waitTime ?? null,
    };
  });

  if (data.length > 0) {
    await queries.insertManyWaitTimes(data);
  }
};

export const putAllDestimationsAttractions = async (
  destinations: Record<string, Destination>
): Promise<void> => {
  const attractionsData = getFattenAttractionsData(destinations);
  await queries.insertManyAttractions(attractionsData);
};
