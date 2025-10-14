import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import type { Destination } from "./themeParksAPI.types.js";

export const DISNEYLAND_PARK_ID = "dae968d5-630d-4719-8b06-3d107e944401";
export const DISNEYLAND_RESORT_ID = "e8d0207f-da8a-4048-bec8-117aa946b2c2";
export const DISNEY_STUDIOS_ID = "ca888437-ebb4-4d50-aed2-d227f7096968";
export const ASTERIX_PARK_ID = "9e938687-fd99-46f3-986a-1878210378f8";
export const EUROPA_PARK_RESORT_ID = "85e3b542-af91-4f8a-8d28-445868a7c8fd";
export const EUROPA_PARK_ID = "639738d3-9574-4f60-ab5b-4c392901320b";
export const RULANTICA_ID = "58392c29-d79d-49e4-9c35-0100d417d24e";
export const WALIBI_RHONE_ALPES_PARK_ID =
  "f9497403-adf3-4409-bd79-bb5b54000e45";
export const FUTUROSCOPE_ID = "46ad6ab4-90db-4c39-b9a4-be833266c210";

const parksToFetch = [
  DISNEYLAND_RESORT_ID,
  ASTERIX_PARK_ID,
  EUROPA_PARK_ID,
  RULANTICA_ID,
  WALIBI_RHONE_ALPES_PARK_ID,
  FUTUROSCOPE_ID,
];

let parkData: Record<string, Destination> = {};

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/live-data/all", (request: Request, response: Response) => {
  response.status(200).send(parkData);
});

app.get("/live-data/:parkId", (request: Request, response: Response) => {
  const { parkId } = request.params;

  if (!parkId) {
    response.status(400).send("Park ID is required");
  }

  const data = parkData[parkId as string];

  if (!data) {
    response.status(404).send("Park not found");
  }

  response.status(200).send(data);
});

app
  .listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT}`);
  })
  .on("error", (error) => {
    throw new Error(error.message);
  });

cron.schedule("* * * * *", async () => {
  console.log("Runing fetch data...");

  const data = await fetchAllParksData();

  parkData = data;

  console.log(`  
    Data fetched successfully, ${Object.keys(data).length} parks fetched.
  `);
});

const fetchAllParksData = async (): Promise<Record<string, Destination>> => {
  let fetchedData: Record<string, Destination> = {};

  await Promise.all(
    parksToFetch.map(async (parkId) => {
      const data = await fetchParkData(parkId);
      fetchedData = { ...fetchedData, [parkId]: data };
    })
  );

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
