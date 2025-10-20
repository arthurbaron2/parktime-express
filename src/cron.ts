import waitingTimesServices from './services/waitingTimes.js'
import attractionsServices from './services/attractions.js'
import { setLiveData } from './states/liveData.js'
import cron from 'node-cron'
import themeparkwikiServices from './services/themeparkwiki.js'

export const fetchAndSaveData = async ({ date }: { date: Date }): Promise<void> => {
  try {
    console.log(
      `⏳ Running a fetch data operation - ${date.toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`,
    )
    const data = await themeparkwikiServices.fetchAllParksData()
    setLiveData(data)
    await attractionsServices.putAllDestimationsAttractions(data)
    await waitingTimesServices.putAllDestimationsWaitTimes(data)
  } catch (error) {
    console.error('❌ Error fetching park data:', error)
  }
}

cron.schedule('* * * * *', fetchAndSaveData)
