export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface Venue {
  address?: string
  city: string
  country?: string
  name?: string
  state?: string
}

interface Image {
  url: string
  aspect: number
  caption?: string
}

export interface Link {
  id: string
  isPress?: boolean
  isSocialProfile?: boolean
  title?: string
  url: string
}

export interface Event {
  _id: string
  createdAt: string
  endDate?: string
  embedCodes: string[]
  description?: string
  images: Image[]
  imageIds: string[]
  isAllDay?: boolean
  isPublished: boolean
  links: Link[]
  linkIds: Link[]
  projectIds: string[]
  slug: string
  startDate: string
  title: string
  updatedAt: string
  venue: Venue
  venueId: string
}
