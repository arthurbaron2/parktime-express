import { pool } from '../database.js'
import type {
  Attraction,
  EnrichedAttractionLiveData,
  AttractionStatisticsGrouped,
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
      a.height_restriction,
      COALESCE(json_agg(ai.interest_id) FILTER (WHERE ai.interest_id IS NOT NULL), '[]') AS interests
    FROM attractions a
    LEFT JOIN attraction_interests ai ON ai.attraction_id = a.id
    WHERE a.id = $1
    GROUP BY a.id, a.name, a.park_id, a.park_name, a.height_restriction
  `,
    [attractionId],
  )
  const { id, name, park_id, park_name, height_restriction, interests }: RawAttraction =
    result.rows[0]

  return {
    id,
    name,
    parkId: park_id,
    parkName: park_name,
    heightRestriction: height_restriction,
    interests,
  }
}

const getAttractionStatisticsById = async (
  id: string,
  timezone: string,
): Promise<AttractionStatisticsGrouped> => {
  try {
    const query = `
          SELECT
            CASE
              WHEN DATE(recorded_at) = CURRENT_DATE THEN 'today'
              WHEN DATE(recorded_at) = CURRENT_DATE - INTERVAL '1 day' THEN 'yesterday'
              WHEN DATE(recorded_at) = CURRENT_DATE - INTERVAL '7 days' THEN 'last_week'
              WHEN DATE(recorded_at) = CURRENT_DATE - INTERVAL '1 year' THEN 'last_year'
            END AS period,
            recorded_at,
            standby_wait,
            single_rider_wait
          FROM wait_times
          WHERE attraction_id = $1
            AND (
              DATE(recorded_at) = CURRENT_DATE
              OR DATE(recorded_at) = CURRENT_DATE - INTERVAL '1 day'
              OR DATE(recorded_at) = CURRENT_DATE - INTERVAL '7 days'
              OR DATE(recorded_at) = CURRENT_DATE - INTERVAL '1 year'
            )
          ORDER BY recorded_at ASC;
        `

    const { rows } = await pool.query(query, [id])

    const grouped: AttractionStatisticsGrouped = rows.reduce(
      (acc: AttractionStatisticsGrouped, row: RawAttractionStatistics) => {
        if (!acc[row.period]) acc[row.period] = []
        acc[row.period]?.push({
          recordedAt: toLocal(row.recorded_at, timezone),
          standbyWait: row.standby_wait,
          singleRiderWait: row.single_rider_wait,
        })
        return acc
      },
      {},
    )

    return grouped
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
  getAttractionStatisticsById,
}
