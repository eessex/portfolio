import { updateTag } from 'next/cache'

import { editAbout } from '@/lib/about/actions'
import { sql } from '@/lib/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const validFields = {
  id: 'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  slug: 'about',
  description: 'Some description'
}

describe('editAbout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('can edit the about page', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await editAbout(
      formDataFromObject(validFields),
      validFields.id
    )

    expect(res).toEqual({ ok: true })
    expect(updateTag).toHaveBeenCalledWith('about')
  })

  it('can handle validation errors without throwing', async () => {
    const invalid = { ...validFields }
    delete (invalid as Partial<typeof validFields>).slug

    const res = await editAbout(
      formDataFromObject(invalid),
      validFields.id
    )

    expect(res).toEqual({
      ok: false,
      errors: { slug: ['Required'] },
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
