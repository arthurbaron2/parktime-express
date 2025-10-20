import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { pool } from './database.js'
import liveDataRouter from './router/liveData.js'
import './cron.js'
import attractionRouter from './router/attraction.js'
import { fetchAndSaveData } from './cron.js'

dotenv.config()
const app = express()

if (process.env.NODE_ENV === 'development') {
  console.log('🟡 Running in DEV mode → CORS handled by Express')

  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
    }),
  )
} else {
  console.log('🟢 Running in PROD mode → CORS handled by Nginx')
}

app.use('/live-data', liveDataRouter)
app.use('/attraction', attractionRouter)

const PORT = process.env.PORT || 3000

app
  .listen(PORT, () => {
    console.log(`🟢 Server running at PORT: ${PORT}`)
    fetchAndSaveData({ date: new Date() })
  })
  .on('error', (error) => {
    throw new Error(error.message)
  })

process.on('SIGINT', async () => {
  await pool.end()
  console.log('🛑 PostgreSQL pool closed')
  process.exit(0)
})
