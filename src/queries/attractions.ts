import { pool } from '../database.js'
import type {
  Attraction,
  EnrichedAttractionLiveData,
  RawAttractionStatistics,
  RawAttraction,
} from '../types.js'
import { toLocal } from '../utils/date.js'

const getAttractionById = async (attractionId: string): Promise<Attraction | null> => {
  const result = await pool.query(
    `
    SELECT 
      a.id,
      a.name,
      a.park_id,
      a.park_name,
      a.park_zone,
      a.height_restriction,
      COALESCE(json_agg(ai.interest_id) FILTER (WHERE ai.interest_id IS NOT NULL), '[]') AS interests
    FROM attractions a
    LEFT JOIN attraction_interests ai ON ai.attraction_id = a.id
    WHERE a.id = $1
    GROUP BY a.id, a.name, a.park_id, a.park_name, a.height_restriction
  `,
    [attractionId],
  )
  const { id, name, park_id, park_name, height_restriction, park_zone, interests }: RawAttraction =
    result.rows[0]

  return {
    id,
    name,
    parkId: park_id,
    parkName: park_name,
    parkZone: park_zone,
    heightRestriction: height_restriction,
    interests,
  }
}

const getAttractionStatisticsByDate = async (
  id: string,
  timezone: string,
  date?: string,
): Promise<RawAttractionStatistics[]> => {
  try {
    const query = `
          SELECT
            recorded_at,
            standby_wait,
            single_rider_wait,
            status
          FROM wait_times
          WHERE attraction_id = $1
          AND (
            DATE(recorded_at) = $2
          )
          ORDER BY recorded_at ASC;
        `

    const targetDate = date || new Date().toISOString().split('T')[0]
    const { rows } = await pool.query(query, [id, targetDate])

    const rawAttractionStatistics: RawAttractionStatistics[] = rows.map(
      ({ recorded_at, standby_wait, single_rider_wait, status }) => {
        return {
          recorded_at: toLocal(recorded_at, timezone),
          standby_wait,
          single_rider_wait,
          status,
        } as RawAttractionStatistics
      },
    )

    return rawAttractionStatistics
  } catch (err) {
    throw new Error(`❌ Error fetching comparison data: ${err}`)
  }
}

const insertManyAttractions = async (
  attractions: EnrichedAttractionLiveData[],
  nbDestinations: number,
): Promise<void> => {
  try {
    if (attractions.length === 0) return

    const values: (string | number)[] = []
    const placeholders: string[] = []

    attractions.forEach((a, i) => {
      const base = i * 4
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`)
      values.push(a.id, a.name, a.parkId, a.parkName)
    })

    const query = `
          INSERT INTO attractions (id, name, park_id, park_name)
          VALUES ${placeholders.join(',')}
          ON CONFLICT (id)
          DO UPDATE SET
            name = EXCLUDED.name,
            park_id = EXCLUDED.park_id,
            park_name = EXCLUDED.park_name;
        `

    await pool.query(query, values)
    console.log(`✅ Synced ${attractions.length} attractions in ${nbDestinations} destinations`)
  } catch (err) {
    console.error(`❌ Error syncing attractions:`, err)
  }
}

export default {
  insertManyAttractions,
  getAttractionById,
  getAttractionStatisticsByDate,
}
