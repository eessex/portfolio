import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { editSiteSettings } from '@/lib/site-settings/actions'
import { formDataFromObject } from '@/test/helpers'

jest.mock('next/cache')

jest.mock('@/lib/images/s3', () => ({
  uploadFile: jest.fn(),
  deleteFromS3: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const validFields = {
  id: 'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  description: 'Some description',
  title: 'Site Title'
}

describe('editSiteSettings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('can create site settings when no id is given', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await editSiteSettings(
      formDataFromObject(validFields)
    )

    expect(res).toEqual({ ok: true })
    expect(updateTag).toHaveBeenCalledWith('settings')
  })

  it('can edit existing site settings when an id is given', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await editSiteSettings(
      formDataFromObject(validFields),
      validFields.id
    )

    expect(res).toEqual({ ok: true })
    expect(updateTag).toHaveBeenCalledWith('settings')
  })

  it('can handle validation errors without throwing', async () => {
    const invalid = { ...validFields, coverImageId: 'not-a-uuid' }

    const res = await editSiteSettings(
      formDataFromObject(invalid),
      validFields.id
    )

    expect(res).toEqual({
      ok: false,
      errors: { coverImageId: ['Invalid uuid'] },
      message: 'Failed to validate site settings.'
    })
  })

  it('can handle DB errors without throwing, surfacing the cause', async () => {
    mockSql.mockRejectedValueOnce(new Error('connection refused'))

    const res = await editSiteSettings(
      formDataFromObject(validFields),
      validFields.id
    )

    expect(res).toEqual({
      ok: false,
      message: 'Failed to save site settings: connection refused.'
    })
  })
})
