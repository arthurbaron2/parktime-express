import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import type { Destination } from "./themeParksAPI.types.js";
import cors from "cors";
import { pool } from "./database.js";
import {
  fetchAllParksData,
  putAllDestimationsAttractions,
  putAllDestimationsWaitTimes,
} from "./utils.js";

let parkData: Record<string, Destination> = {};

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://parktime.fr"],
    credentials: true,
    methods: ["GET"],
  })
);

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

cron.schedule("* 0-1,7-23 * * *", async ({ date }) => {
  console.log("Running fetch data... ", date.toISOString());
  try {
    const data = await fetchAllParksData();
    parkData = data;
    await putAllDestimationsAttractions(parkData);
    if (date.getMinutes() % 5 === 0) {
      await putAllDestimationsWaitTimes(parkData);
    }
  } catch (error) {
    console.error("❌ Error fetching park data:", error);
  }
});

process.on("SIGINT", async () => {
  await pool.end();
  console.log("🛑 PostgreSQL pool closed");
  process.exit(0);
});
