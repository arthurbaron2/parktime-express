import { pool } from "./database.js";
import type { EnrichedAttractionLiveData, WaitTimeRow } from "./types.js";

const insert = async (
  attractionId: string,
  standbyWait: number,
  singleRiderWait: number
): Promise<void> => {
  await pool.query(
    `INSERT INTO wait_times (attraction_id, standby_wait, single_rider_wait)
         VALUES ($1, $2, $3)
         ON CONFLICT (attraction_id, recorded_at) DO NOTHING`,
    [attractionId, standbyWait, singleRiderWait]
  );
};

const insertManyAttractions = async (
  attractions: EnrichedAttractionLiveData[]
): Promise<void> => {
  try {
    if (attractions.length === 0) return;

    const values: any[] = [];
    const placeholders: string[] = [];

    attractions.forEach((a, i) => {
      const base = i * 3;
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
      values.push(a.id, a.name, a.park_id);
    });

    const query = `
        INSERT INTO attractions (id, name, park_id)
        VALUES ${placeholders.join(",")}
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
      `;

    await pool.query(query, values);
    console.log(`✅ Synced ${attractions.length} attractions`);
  } catch (err) {
    console.error(`❌ Error syncing attractions:`, err);
  }
};

const insertManyWaitTimes = async (data: WaitTimeRow[]): Promise<void> => {
  if (data.length === 0) return;

  const values: (string | number | null)[] = [];
  const params: string[] = [];

  data.forEach((item, i) => {
    const baseIndex = i * 3;
    params.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
    values.push(item.attractionId, item.standbyWait, item.singleRiderWait);
  });

  const query = `
      INSERT INTO wait_times (attraction_id, standby_wait, single_rider_wait)
      VALUES ${params.join(",")}
      ON CONFLICT (attraction_id, recorded_at) DO NOTHING
    `;

  await pool.query(query, values);
  console.log(`✅ Inserted ${data.length} wait time records`);
};

export default {
  insert,
  insertManyWaitTimes,
  insertManyAttractions,
};
