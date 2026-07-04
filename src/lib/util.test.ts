import { normalizeFormData } from '@/lib/util'

describe('#normalizeFormData', () => {
  it('converts checked checkbox values to true', () => {
    const result = normalizeFormData({ isPublished: 'on' })

    expect(result.isPublished).toBe(true)
  })

  it('converts empty *Date fields to undefined', () => {
    const result = normalizeFormData({ startDate: '' })

    expect(result.startDate).toBeUndefined()
  })

  it('leaves non-empty *Date fields untouched', () => {
    const result = normalizeFormData({ startDate: '2024-01-01' })

    expect(result.startDate).toBe('2024-01-01')
  })

  it('converts other empty string fields to undefined', () => {
    const result = normalizeFormData({ url: '', name: '' })

    expect(result.url).toBeUndefined()
    expect(result.name).toBeUndefined()
  })

  it('leaves non-empty, non-checkbox fields untouched', () => {
    const result = normalizeFormData({
      city: 'Austin',
      count: 3
    })

    expect(result.city).toBe('Austin')
    expect(result.count).toBe(3)
  })

  it('mutates and returns the same object reference', () => {
    const data = { isPublished: 'on' }
    const result = normalizeFormData(data)

    expect(result).toBe(data)
  })
})
