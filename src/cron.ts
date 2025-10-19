import waitingTimesServices from './services/waitingTimes.js'
import attractionsServices from './services/attractions.js'
import { setLiveData } from './states/liveData.js'
import cron from 'node-cron'
import themeparkwikiServices from './services/themeparkwiki.js'

export const fetchAndSaveData = async ({ date }: { date: Date }): Promise<void> => {
  try {
    console.log(
      `⏳ Running a fetch data operation at ${date.toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    )
    const data = await themeparkwikiServices.fetchAllParksData()
    setLiveData(data)
    await attractionsServices.putAllDestimationsAttractions(data)
    if (date.getMinutes() % 5 === 0) {
      await waitingTimesServices.putAllDestimationsWaitTimes(data)
    } else {
      console.log(`⏸️​  ${5 - (date.getMinutes() % 5)} minutes until next wait time insertion`)
    }
  } catch (error) {
    console.error('❌ Error fetching park data:', error)
  }
}

cron.schedule('* 0-1,7-23 * * *', fetchAndSaveData)
