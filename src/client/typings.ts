//  system
export interface Error {
  message?: string
  status?: string
}

// Item properties
export type Model = 'events' | 'publications' | 'projects' | 'pages' | 'releases'

export interface Format {
  _id?: string
  compilation?: boolean
  format?: string
  featuring?: boolean
  publisher?: string
  release_year?: number
}

export interface Image {
  _id?: string
  aspect?: number
  caption?: string
  url?: string
}

export interface Link {
  _id?: string
  url: string
  title?: string
}

export interface Venue {
  address?: string
  city?: string
  country?: string
  name?: string
  state?: string
}

export type SocialProfile =
  'facebook' |
  'twitter' |
  'soundcloud' |
  'bandcamp' |
  'instagram' |
  'discogs'

  export interface Social {
  profile: SocialProfile
  service: string
}

// Item
export interface Item {
  _id?: string
  all_day?: boolean
  artist?: string
  created_at?: string
  description?: string
  embed_codes?: string[]
  end_date?: string 
  formats?: Format[]
  images?: Image[]
  lead_text?: string
  links?: Link[]
  list_index?: number
  slug?: string
  start_date?: string
  title?: string
  venue?: Venue
  project_ids?: string[]
  published?: boolean
  updated_at?: string
}

export interface ItemShort {
  date: string
  description: string
  image: Image
  title: string
  venue: string
}

// Settings
export interface Meta {
  description?: string
  image?: string
}

export interface Settings {
  _id: string
  nav: string[]
  social: Social[]
  title?: string
  meta: Meta
}

export interface LayoutProps {
  children?: any
  item: Item
  label: string
  labelLink: string
  model: Model
  onChange: (key: string, val: any) => void
  setEditing: (isEditing: string | null) => void
  social: Social[]
}
