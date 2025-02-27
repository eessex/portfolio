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
