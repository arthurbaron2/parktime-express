import type { WaitTimeRow } from '../types.js'
import { pool } from '../database.js'

const insertManyWaitTimes = async (data: WaitTimeRow[]): Promise<void> => {
  if (data.length === 0) return

  const values: (string | number | null)[] = []
  const params: string[] = []

  data.forEach((item, i) => {
    const baseIndex = i * 3
    params.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`)
    values.push(item.attractionId, item.standbyWait, item.singleRiderWait)
  })

  const query = `
      INSERT INTO wait_times (attraction_id, standby_wait, single_rider_wait)
      VALUES ${params.join(',')}
      ON CONFLICT (attraction_id, recorded_at) DO NOTHING
    `

  await pool.query(query, values)
  console.log(`✅ Inserted ${data.length} wait time records`)
}

export default {
  insertManyWaitTimes,
}
