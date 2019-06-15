import moment from 'moment'
import { pluck, uniq } from 'underscore'
import { Item, Model, Venue } from 'client/typings'

export const sortByDate = (items: Item[], dateField: string) => {
  let upcoming = []
  let past = []

  if (items.length) {
    for (var item of items) {
      if (item) {
        const date = new Date(item[dateField])

        if (new Date() < date) {
          upcoming.push(item)
        } else {
          past.push(item)
        }
      }
    }
  }

  return {
    upcoming,
    past
  }
}

export const imageIsVertical = image => {
  return image && image.aspect && image.aspect < 1.1
}

export const formatEventDates = (item: Item, format) => {
  const { end_date, start_date, all_day } = item
  let formattedStart
  let formattedEnd

  if (end_date) {
    const isUpcoming = dateIsUpcoming(end_date)
    const datesDoMatch = datesMatch(start_date, end_date)

    if (datesDoMatch) {
      // Start and end date is on same day
      if (!all_day) {
        // Nov 1, 2017 - 8:00-10:00pm
        formattedEnd = formatEventDate(end_date, false, !isUpcoming, format)
        const startTime = moment(start_date).format(` - h:mma`)
        return formattedEnd + startTime
      } else {
        // Nov 1, 2017
        return formatEventDate(end_date, true, !isUpcoming, format)
      }

    } else {
      // Start and end date on different days
      const yearsDoMatch = yearsMatch(start_date, end_date)
      formattedStart = formatEventDate(start_date, true, !yearsDoMatch, format)
      formattedEnd = formatEventDate(end_date, all_day, !yearsDoMatch, format)

      return formattedStart + ' - ' + formattedEnd
    }
  } else {
    // Start date only
    const isUpcoming = dateIsUpcoming(start_date)
    return formatEventDate(start_date, all_day, !isUpcoming, format)
  }
}

export const formatEventDate = (date, allDay, hasYear, _format) => {
  const getYear = hasYear ? ', YYYY' : ''

  if (allDay) {
    return moment(date).format(`ddd, MMM DD${getYear}`)
  } else {
    return moment(date).format(`ddd, MMM DD${getYear} - h:mma`)
  }
}

export const dateIsUpcoming = date => {
  const now = moment().toISOString()
  return date > now
}

export const datesMatch = (date1, date2) => {
  return moment(date1).format('MMM DD, YYYY') === moment(date2).format('MMM DD, YYYY')
}

export const yearsMatch = (date1, date2) => {
  return moment(date1).format('YYYY') === moment(date2).format('YYYY')
}

export const getDate = (model: Model, item: Item, format?: string) => {
  switch (model) {
    case 'events':
      return formatEventDates(item, format)
    case 'publications':
    case 'releases':
      return getReleaseDate(item)
    default:
      return null
  }
}

export const getReleaseDate = (item: Item) => {
  const { formats } = item
  let dates = uniq(pluck(formats, 'release_year'))

  if (dates.length) {
    const startDate = dates[0]

    if (dates.length > 1) {
      const endDate = dates[dates.length - 1]

      return endDate !== null
        ? startDate.toString() + '-' + endDate.toString().slice(-2)
        : startDate.toString()
    } else {
      if (startDate) {
        return startDate.toString()
      }
    }
  }
}

export const getVenue = (venue: Venue = {}) => {
  const { address, city, country, name, state } = venue
  const State = state ? `, ${state}` : ''
  const City = city && city.length ? `, ${city}` : ''
  const Country = country ? `, ${country}` : ''

  if (venue && name && name.length) {
    return name + City + State + Country
  } else if (venue && address && address.length) {
    return address + City + State + Country
  }
}
