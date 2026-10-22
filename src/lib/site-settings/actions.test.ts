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

  describe('social links', () => {
    const linkIds = [
      'a1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
      'a2b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'
    ]

    /** the site_settings write, as text + params */
    function settingsWrite() {
      const call = mockSql.mock.calls.find(([strings]) =>
        (strings as TemplateStringsArray)
          .join('?')
          .includes('site_settings')
      )
      const [strings, ...params] = call!
      return {
        text: (strings as TemplateStringsArray).join('?'),
        params
      }
    }

    it('saves social_link_ids in submitted order', async () => {
      mockSql.mockResolvedValue([])

      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          'socialLinks[]': '',
          'socialLinks[0].id': linkIds[1],
          'socialLinks[1].id': linkIds[0]
        }),
        validFields.id
      )

      expect(res).toEqual({ ok: true })
      const { text, params } = settingsWrite()
      expect(text).toContain('social_link_ids = COALESCE(')
      expect(params).toContainEqual([linkIds[1], linkIds[0]])
    })

    it('leaves the stored list alone when the picker was not submitted', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject(validFields),
        validFields.id
      )

      const { params } = settingsWrite()
      expect(params[3]).toBeNull()
    })

    it('creates settings with an empty list when none are picked', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(formDataFromObject(validFields))

      const { text, params } = settingsWrite()
      expect(text).toContain('INSERT INTO site_settings')
      expect(params[3]).toEqual([])
    })

    it('rejects more than 6 before writing anything', async () => {
      const entries = Object.fromEntries(
        Array.from({ length: 7 }, (_, i) => [
          `socialLinks[${i}].url`,
          `https://example.com/${i}`
        ])
      )

      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          'socialLinks[]': '',
          ...entries
        }),
        validFields.id
      )

      expect(res).toEqual({
        ok: false,
        message: 'Failed to validate site settings.',
        errors: { socialLinks: ['Add up to 6 social links.'] }
      })
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('rejects an invalid inline link before saving the cover image', async () => {
      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          'coverImage.url': 'https://example.com/cover.jpg',
          'coverImage.altText': 'Cover',
          'socialLinks[]': '',
          'socialLinks[0].url': 'not a url',
          'socialLinks[0].title': 'Instagram'
        }),
        validFields.id
      )

      expect(res).toMatchObject({
        ok: false,
        errors: {
          socialLinks: ['Social link 1 has an invalid url.']
        }
      })
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('invalidates links and the pages embedding them', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject(validFields),
        validFields.id
      )

      for (const tag of [
        'settings',
        'links',
        'releases',
        'events',
        'projects'
      ]) {
        expect(updateTag).toHaveBeenCalledWith(tag)
      }
    })
  })
})
