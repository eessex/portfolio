import moment from 'moment'
import { Item, ItemShort } from 'client/typings'

const tomorrow = moment().add(1, 'day').toISOString()
const yesterday = moment().subtract(1, 'day').toISOString()

export const ListItemEvent: ItemShort = {
  date: 'Dec 6, 2017',
  description: '<p>Here is a description.</p>',
  image: {url: 'http://image.jpg'},
  title: 'Cool show',
  venue: 'The Sump, Ridgewood'
}

export const UpcomingEvent: Item = {
  _id: "5a0a60d48dcb886c6a1ab1df",
  published: true,
  start_date: tomorrow,
  links: [
    {
      title: "Facebook Event",
      url: "https://www.facebook.com/events/1505422539549739/"
    }
  ],
  images: [
    {
      caption: "<p>A caption for an upcoming event</p>",
      url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/20170117-cixous72-eve-essex-honeys.jpg`
    }
  ],
  end_date: null,
  all_day: false,
  title: "Eve Essex, Kate Monhanty, Ben Jaffe",
  slug: "eve-essex-kate-monhanty-ben-jaffe",
  venue: {
    country: "",
    state: "NY",
    city: "Ridgewood",
    address: "1290 Wyckoff Ave",
    name: "Holo"
  },
  description: "<p>Three solo saxophone sets.</p>"
}

export const PastEvent = {
  _id: "5a028e8e41c58900120bc57c",
  published: false,
  start_date: yesterday,
  links: [ 
    {
      title: "Facebook Event",
      url: "https://www.facebook.com/events/235101790162104/"
    }
  ],
  images: [
    {
      title: "<p>A caption for a past event</p>",
      url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/eve-poster.jpg`
    }
  ],
  end_date: null,
  all_day: false,
  title: "Eve Essex",
  slug: "eve-essex",
  venue: {
    country: "",
    state: "NY",
    city: "Brooklyn",
    address: "1004 Metropolitan Ave.",
    name: "Safe Gallery"
  },
  description: "<p>Closing party for Gretta Johnson and Andy Cahill&#x27;s exhibition.</p>"
}
