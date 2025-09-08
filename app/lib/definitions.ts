export type PageType = 'event' | 'release'

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export type FormResponse<T> = Promise<{
  ok: true
  res?: T | T[]
  message?: string
} | {
  ok?: false
  errors?: Record<string, string[] | undefined> | string[]
  message?: string
} | undefined>
