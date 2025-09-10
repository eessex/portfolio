export type PageType = 'event' | 'release'

export type FormState<T> = {
  ok?: boolean
  res?: T | T[]
  message?: string
  errors?: Record<string, string[] | undefined> | string[]
}

export type FormResponse<T> = Promise<FormState<T> | undefined>

export interface Badge { text: string, color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' }
