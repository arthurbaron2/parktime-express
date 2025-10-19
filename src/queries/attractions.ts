import { pool } from '../database.js'
import type {
  Attraction,
  EnrichedAttractionLiveData,
  AttractionStatisticsGrouped,
  RawAttractionStatistics,
} from '../types.js'

const getAttractionById = async (id: string): Promise<Attraction | null> => {
  const result = await pool.query('SELECT * FROM attractions WHERE id = $1', [id])
  return result.rows[0]
}

const getAttractionStatisticsById = async (id: string): Promise<AttractionStatisticsGrouped> => {
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
          recorded_at: row.recorded_at,
          standby_wait: row.standby_wait,
          single_rider_wait: row.single_rider_wait,
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
      const base = i * 3
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`)
      values.push(a.id, a.name, a.park_id)
    })

    const query = `
          INSERT INTO attractions (id, name, park_id)
          VALUES ${placeholders.join(',')}
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
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
