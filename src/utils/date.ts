import { DateTime } from 'luxon'

export const toUTC = (date: string, timezone: string) =>
  DateTime.fromISO(date, { zone: timezone }).toUTC().toISO()

export const toLocal = (utcInput: string | number | Date, timezone: string) => {
  if (!utcInput) throw new Error(`⛔ Invalid UTC input: ${utcInput}`)

  let dtUtc: DateTime

  if (utcInput instanceof Date) {
    if (isNaN(utcInput.getTime())) throw new Error(`⛔ Invalid date: ${utcInput}`)
    dtUtc = DateTime.fromJSDate(utcInput, { zone: 'utc' })
  } else if (typeof utcInput === 'number') {
    dtUtc = DateTime.fromMillis(utcInput, { zone: 'utc' })
  } else {
    const s = String(utcInput).trim().replace(/['"]/g, '')

    dtUtc = DateTime.fromISO(s, { zone: 'utc' })

    if (!dtUtc.isValid) {
      const d = new Date(s)
      if (isNaN(d.getTime())) {
        throw new Error(`⛔ Invalid date string: ${s}`)
      }
      dtUtc = DateTime.fromJSDate(d, { zone: 'utc' })
    }
  }

  if (!dtUtc.isValid) {
    throw new Error(`⛔ Invalid UTC DateTime: ${dtUtc.invalidReason} ${dtUtc.invalidExplanation}`)
  }

  const local = dtUtc.setZone(timezone)
  if (!local.isValid) {
    throw new Error(`⛔ Invalid timezone: ${timezone} ${local.invalidReason}`)
  }

  return local.toISO()
}
