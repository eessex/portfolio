import { toDateInputValue } from '@/ui/util'

describe('toDateInputValue', () => {
  it('returns an empty string for missing dates', () => {
    expect(toDateInputValue(undefined)).toBe('')
    expect(toDateInputValue('')).toBe('')
  })

  it('returns an empty string for invalid dates', () => {
    expect(toDateInputValue('not-a-date')).toBe('')
  })

  it('formats a Date from local calendar parts', () => {
    const localMidnight = new Date(2024, 0, 15)
    expect(toDateInputValue(localMidnight)).toBe('2024-01-15')
  })

  it('does not shift the day east of UTC', () => {
    const newYear = new Date(2024, 0, 1)
    expect(toDateInputValue(newYear)).toBe('2024-01-01')
  })

  it('formats an ISO date string', () => {
    expect(toDateInputValue('2024-06-30T00:00:00.000Z')).toBe(
      toDateInputValue(new Date('2024-06-30T00:00:00.000Z'))
    )
  })
})
