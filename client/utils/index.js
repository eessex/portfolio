import moment from 'moment'

export function sortByDate(items, dateField) {
  let upcoming = []
  let past = []

  for (var item of items) {
    if (new Date() < new Date(item[dateField])) {
      upcoming.push(item)
    } else {
      past.push(item)
    }
  }

  return {
    upcoming,
    past
  }
}

export function formatEventDates (item, format) {
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
        const startTime =  moment(start_date).format(`-h:mma`)
        return formattedEnd + startTime
      } else {
        // Nov 1, 2017
        return formatEventDate(end_date, true, !isUpcoming, format)
      }

    } else {
      // Start and end date on different days
      const yearsDoMatch = yearsMatch(start_date, end_date)
      formattedStart = formatEventDate(start_date, true, !yearsDoMatch, format)
      formattedEnd = formatEventDate(start_date, all_day, !yearsDoMatch, format)

      return formattedStart + formattedEnd
    }
  } else {
    // Start date only
    const isUpcoming = dateIsUpcoming(start_date)
    return formatEventDate(start_date, all_day, !isUpcoming, format)
  }
}

export function formatEventDate (date, allDay, hasYear, format) {
  let formattedDate
  const getYear = hasYear ? ', YYYY' : ''

  if (allDay) {
    return moment(date).format(`MMM DD${getYear}`)
  } else {
    return moment(date).format(`ddd, MMM DD${getYear} - h:mma`)
  }
}

export function dateIsUpcoming (date) {
  const now = moment().toISOString()
  return date > now
}

export function datesMatch (date1, date2) {
  return moment(date1).format('MMM DD YYYY') === moment(date2).format('MMM DD YYYY')
}

export function yearsMatch (date1, date2) {
  return moment(date1).format('YYYY') === moment(date2).format('YYYY')
}

export function getDate (model, item, format) {
  switch (model) {
    case 'events':
      return formatEventDates(item, format)

    default:
      return
  }
}

export function getVenue (venue) {
  if (venue) {
    const city = venue.city.length ? `, ${venue.city}` : ''
    const country = venue.country ? `, ${venue.country}` : ''

    if (venue && venue.name.length) {
      return venue.name + city + country

    } else if (venue && venue.address.length) {
      return venue.address + city + country
    }
  }
}