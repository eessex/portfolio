import { camelToSentence } from '@/ui/util'

describe('util', () => {
  it('#camelToSentence should convert camelCase to sentence case', () => {
    expect(camelToSentence('helloWorld')).toBe('Hello World')
  })
})
