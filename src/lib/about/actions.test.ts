import { updateTag } from 'next/cache'

import { editAbout } from '@/lib/about/actions'
import { sql } from '@/lib/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/images/s3', () => ({
  uploadFile: jest.fn(),
  deleteFromS3: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const validFields = {
  id: 'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  slug: 'about',
  description: 'Some description',
  coverImageId: 'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8b'
}

describe('editAbout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('can create the about page when no id is given', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await editAbout(formDataFromObject(validFields))

    expect(res).toEqual({ ok: true })
    expect(updateTag).toHaveBeenCalledWith('about')

    const query = mockSql.mock.calls[0][0].join('')
    expect(query).toContain('INSERT INTO about')
    expect(query).toContain('created_at')
  })

  it('can edit the about page when an id is given', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await editAbout(
      formDataFromObject(validFields),
      validFields.id
    )

    expect(res).toEqual({ ok: true })
    expect(updateTag).toHaveBeenCalledWith('about')
  })

  it('can handle validation errors without throwing', async () => {
    const invalid = { ...validFields, coverImageId: 'not-a-uuid' }

    const res = await editAbout(
      formDataFromObject(invalid),
      validFields.id
    )

    expect(res).toEqual({
      ok: false,
      errors: { coverImageId: ['Invalid uuid'] },
      message: 'Failed to validate about.'
    })
  })

  it('can handle DB errors without throwing, surfacing the cause', async () => {
    mockSql.mockRejectedValueOnce(new Error('connection refused'))

    const res = await editAbout(
      formDataFromObject(validFields),
      validFields.id
    )

    expect(res).toEqual({
      ok: false,
      message: 'Failed to save about: connection refused.'
    })
  })
})
