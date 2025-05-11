const dateFormatLg: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
}

const dateFormatMd: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}

const dateFormatXs: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short'
}

const dateFormatXxs: Intl.DateTimeFormatOptions = {
  year: 'numeric'
}

type DateFormatSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

const getTimeFormat = (format: DateFormatSize = 'lg') => {
  switch (format) {
    case 'xxs':
      return dateFormatXxs
    case 'xs':
      return dateFormatXs
    case 'md':
      return dateFormatMd
    default:
      return dateFormatLg
  }
}

export function formattedDateTime (date: string, format?: DateFormatSize) {
  const startDate = new Date(date)
  // FIXME: offset is a hack to adjust for timezone after posgres migration
  startDate.setHours(startDate.getHours() - 4)
  const formattedDate = new Date(startDate).toLocaleDateString('en-us', getTimeFormat(format))

  return formattedDate
}

export const escapeHtml = (s: string) => {
  return s.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
    if (Object.prototype.hasOwnProperty.call(obj, key.toString())) {
      const camelKey = key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase())
      // FIXME: recursive failing on date values
      // camelizedObject[camelKey] = camelizeKeys(obj[key])

      camelizedObject[camelKey] = obj[key]
    }
  }
  return camelizedObject
}
