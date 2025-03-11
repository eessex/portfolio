export function formattedDateTime (date: string) {
  const startDate = new Date(date)
  // FIXME: offset is a hack to adjust for timezone after posgres migration
  startDate.setHours(startDate.getHours() - 4)
  const formattedDate = new Date(startDate).toLocaleDateString('en-us', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  })

  return formattedDate
}

export function isUpcomingDate (date: string) {
  return new Date(date) > new Date()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function camelizeKeys (obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const camelizedObject: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase())
      camelizedObject[camelKey] = camelizeKeys(obj[key])
    }
  }
  return camelizedObject
}
