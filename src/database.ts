import pg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pg

dotenv.config()

export const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT) || 5432,
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error', err)
})
