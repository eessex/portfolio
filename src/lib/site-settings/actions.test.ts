import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { uploadFile } from '@/lib/images/upload'
import { editSiteSettings } from '@/lib/site-settings/actions'
import { generateSiteIcons } from '@/lib/site-settings/icons'
import { ICON_VERSION } from '@/lib/site-settings/util'
import { formDataFromObject, mockFile } from '@/test/helpers'

jest.mock('next/cache')

jest.mock('@/lib/images/upload', () => ({
  uploadFile: jest.fn(),
  deleteImageFile: jest.fn()
}))

jest.mock('@/lib/site-settings/icons', () => ({
  generateSiteIcons: jest.fn()
}))
const mockGenerateSiteIcons = jest.mocked(generateSiteIcons)

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
      errors: { coverImageId: ['Invalid UUID'] },
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

    it('saves the email subscribe checkbox state', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject({
          ...validFields,
          isEmailSubscribeEnabled: 'on'
        }),
        validFields.id
      )
      expect(settingsWrite().params[4]).toBe(true)

      mockSql.mockClear()
      // an unchecked checkbox isn't submitted
      await editSiteSettings(
        formDataFromObject(validFields),
        validFields.id
      )
      expect(settingsWrite().params[4]).toBe(false)
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

  describe('menu', () => {
    /** the stored nav_items param, parsed back from its JSON text */
    function savedNavItems() {
      const call = mockSql.mock.calls.find(([strings]) =>
        /(UPDATE|INSERT INTO) site_settings/.test(
          (strings as TemplateStringsArray).join('?')
        )
      )
      const [strings, ...params] = call!
      expect((strings as TemplateStringsArray).join('?')).toContain(
        'nav_items'
      )
      const value = params[7]
      return typeof value === 'string' ? JSON.parse(value) : value
    }

    it('saves the shown items in order, with names', async () => {
      mockSql.mockResolvedValue([])

      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          'navItems[0].path': 'releases',
          'navItems[0].label': '  Music ',
          'navItems[0].isVisible': 'on',
          'navItems[1].path': 'events',
          'navItems[1].label': '',
          'navItems[1].isVisible': 'on',
          'navItems[2].path': 'about',
          'navItems[2].label': 'Bio'
        }),
        validFields.id
      )

      expect(res).toEqual({ ok: true })
      expect(savedNavItems()).toEqual([
        { path: 'releases', label: 'Music' },
        { path: 'events' }
      ])
    })

    it('saves an empty menu when every item is hidden', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject({
          ...validFields,
          'navItems[0].path': 'events'
        })
      )

      expect(savedNavItems()).toEqual([])
    })

    it('keeps the stored menu when the fieldset was not submitted', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject(validFields),
        validFields.id
      )

      expect(savedNavItems()).toBeNull()
    })

    it.each([
      [
        'an unknown path',
        { 'navItems[0].path': 'blog', 'navItems[0].isVisible': 'on' }
      ],
      [
        'a repeated path',
        {
          'navItems[0].path': 'events',
          'navItems[0].isVisible': 'on',
          'navItems[1].path': 'events',
          'navItems[1].isVisible': 'on'
        }
      ],
      [
        'a name over 30 characters',
        {
          'navItems[0].path': 'events',
          'navItems[0].label': 'x'.repeat(31),
          'navItems[0].isVisible': 'on'
        }
      ]
    ])('rejects %s before writing anything', async (_, fields) => {
      const res = await editSiteSettings(
        formDataFromObject({ ...validFields, ...fields }),
        validFields.id
      )

      expect(res).toMatchObject({
        ok: false,
        errors: { navItems: [expect.any(String)] }
      })
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('site icon', () => {
    const iconImageId = 'c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'

    /** mocks the stored row's icon columns; returns the write */
    function mockStoredIcon(stored?: {
      icon_image_id: string | null
      icon_version: number | null
    }) {
      mockSql.mockImplementation(((strings: TemplateStringsArray) =>
        Promise.resolve(
          strings.join('?').includes('SELECT icon_image_id') && stored
            ? [stored]
            : []
        )) as never)
      return () => {
        const call = mockSql.mock.calls.find(([strings]) =>
          /(UPDATE|INSERT INTO) site_settings/.test(
            (strings as TemplateStringsArray).join('?')
          )
        )
        if (!call) return
        const [strings, ...params] = call
        return {
          text: (strings as TemplateStringsArray).join('?'),
          params
        }
      }
    }

    it('skips generation for an unchanged, current icon', async () => {
      const write = mockStoredIcon({
        icon_image_id: iconImageId,
        icon_version: ICON_VERSION
      })

      const res = await editSiteSettings(
        formDataFromObject({ ...validFields, iconImageId }),
        validFields.id
      )

      expect(res).toEqual({ ok: true })
      expect(mockGenerateSiteIcons).not.toHaveBeenCalled()
      expect(write()?.params.slice(5, 7)).toEqual([
        iconImageId,
        ICON_VERSION
      ])
    })

    it('generates once for a changed icon', async () => {
      const write = mockStoredIcon({
        icon_image_id: 'd1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
        icon_version: ICON_VERSION
      })

      await editSiteSettings(
        formDataFromObject({ ...validFields, iconImageId }),
        validFields.id
      )

      expect(mockGenerateSiteIcons).toHaveBeenCalledTimes(1)
      expect(mockGenerateSiteIcons).toHaveBeenCalledWith(iconImageId)
      expect(write()?.params.slice(5, 7)).toEqual([
        iconImageId,
        ICON_VERSION
      ])
    })

    it('regenerates a stale icon version', async () => {
      mockStoredIcon({
        icon_image_id: iconImageId,
        icon_version: ICON_VERSION - 1
      })

      await editSiteSettings(
        formDataFromObject({ ...validFields, iconImageId }),
        validFields.id
      )

      expect(mockGenerateSiteIcons).toHaveBeenCalledWith(iconImageId)
    })

    it('regenerates when the image was deleted but the version kept', async () => {
      mockStoredIcon({
        icon_image_id: null,
        icon_version: ICON_VERSION
      })

      await editSiteSettings(
        formDataFromObject({ ...validFields, iconImageId }),
        validFields.id
      )

      expect(mockGenerateSiteIcons).toHaveBeenCalledWith(iconImageId)
    })

    it('generates when creating the settings row', async () => {
      const write = mockStoredIcon()

      await editSiteSettings(
        formDataFromObject({ ...validFields, iconImageId })
      )

      expect(mockGenerateSiteIcons).toHaveBeenCalledWith(iconImageId)
      const { text, params } = write()!
      expect(text).toContain('INSERT INTO site_settings')
      expect(params.slice(5, 7)).toEqual([iconImageId, ICON_VERSION])
    })

    it('clears both columns when the field is cleared', async () => {
      const write = mockStoredIcon({
        icon_image_id: iconImageId,
        icon_version: ICON_VERSION
      })

      await editSiteSettings(
        formDataFromObject(validFields),
        validFields.id
      )

      expect(mockGenerateSiteIcons).not.toHaveBeenCalled()
      expect(write()?.params.slice(5, 7)).toEqual([null, null])
    })

    it('writes no icon files when validation fails', async () => {
      mockStoredIcon()

      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          iconImageId,
          coverImageId: 'not-a-uuid'
        }),
        validFields.id
      )

      expect(res).toMatchObject({ ok: false })
      expect(mockGenerateSiteIcons).not.toHaveBeenCalled()
    })

    it('returns a failed generation as a form error, leaving the row', async () => {
      const write = mockStoredIcon()
      mockGenerateSiteIcons.mockRejectedValueOnce(
        new Error('The site icon is too small')
      )

      const res = await editSiteSettings(
        formDataFromObject({ ...validFields, iconImageId }),
        validFields.id
      )

      expect(res).toEqual({
        ok: false,
        message:
          'Failed to save site settings: The site icon is too small.'
      })
      expect(write()).toBeUndefined()
      expect(updateTag).not.toHaveBeenCalled()
    })
  })

  describe('logo', () => {
    const logoImageId = 'e1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'

    /** the site_settings write's params */
    function writeParams() {
      const call = mockSql.mock.calls.find(([strings]) =>
        /(UPDATE|INSERT INTO) site_settings/.test(
          (strings as TemplateStringsArray).join('?')
        )
      )
      const [, ...params] = call!
      return params
    }

    it('writes the logo and logo-only flag as the last columns', async () => {
      mockSql.mockResolvedValue([])

      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          logoImageId,
          isLogoOnly: 'on'
        }),
        validFields.id
      )

      expect(res).toEqual({ ok: true })
      expect(writeParams().slice(-3)).toEqual([
        logoImageId,
        true,
        validFields.id
      ])
    })

    it('writes them last when creating the settings row', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject({ ...validFields, logoImageId })
      )

      // an unchecked checkbox isn't submitted
      expect(writeParams().slice(-2)).toEqual([logoImageId, false])
    })

    it('clears the logo when the field is cleared', async () => {
      mockSql.mockResolvedValue([])

      await editSiteSettings(
        formDataFromObject(validFields),
        validFields.id
      )

      expect(writeParams().slice(-3)).toEqual([
        null,
        false,
        validFields.id
      ])
    })
  })

  // the cover is the OG fallback, which link previews can't show as SVG
  describe.each([
    ['logoImage', { isSvgAllowed: true }],
    ['iconImage', { isSvgAllowed: true }],
    ['coverImage', undefined]
  ])('an inline %s upload', (prefix, options) => {
    it(`passes ${JSON.stringify(options)} to uploadFile`, async () => {
      mockSql.mockResolvedValue([])
      // stops the save right after the call under test
      jest.mocked(uploadFile).mockRejectedValueOnce(new Error('stop'))
      const file = mockFile('logo.svg', 1024, 'image/svg+xml')

      const res = await editSiteSettings(
        formDataFromObject({
          ...validFields,
          [`${prefix}.file`]: file
        }),
        validFields.id
      )

      expect(res?.ok).toBe(false)
      expect(uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'logo.svg' }),
        options
      )
    })
  })
})
