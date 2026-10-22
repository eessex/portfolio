import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  deleteLink,
  editLink,
  resolveOrderedLinkIds,
  resolveSocialLinkIds,
  saveLinkFromFields,
  saveSocialLinkFromFields
} from '@/lib/links/actions'
import {
  linkFixture,
  newLinkFixture,
  newPressLinkFixture,
  pressLinkFixture
} from '@/lib/links/fixtures'
import type { CreateLink, Link } from '@/lib/links/schemas/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

describe('Link Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deleteLink', () => {
    it('can delete a link', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])
      const res = await deleteLink(linkFixture)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('links')
      // links are embedded into cached release/event/project/edition pages
      expect(updateTag).toHaveBeenCalledWith('releases')
      // and the footer, through site settings
      expect(updateTag).toHaveBeenCalledWith('settings')
    })

    it('deletes by id only, not other links sharing its url', async () => {
      mockSql.mockResolvedValueOnce([])
      await deleteLink(linkFixture)

      const [strings, ...params] = mockSql.mock.calls[0]!
      expect(params).toEqual([linkFixture.id])
      expect((strings as TemplateStringsArray).join('')).not.toMatch(
        /url/
      )
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteLink(linkFixture)

      expect(res!.message).toBe('Failed to delete link: DB error.')
    })
  })

  describe('#editLink', () => {
    it('can edit an existing link', async () => {
      mockSql
        .mockResolvedValueOnce([linkFixture]) // fetchLinksByIds
        .mockResolvedValueOnce([linkFixture]) // UPDATE ... RETURNING *
      const res = await editLink(
        formDataFromObject(linkFixture),
        linkFixture.id
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Link)?.title).toEqual('Test Link')
      expect(updateTag).toHaveBeenCalledWith('links')
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('can edit an existing press link', async () => {
      mockSql
        .mockResolvedValueOnce([pressLinkFixture])
        .mockResolvedValueOnce([pressLinkFixture])
      const res = await editLink(
        formDataFromObject(pressLinkFixture),
        pressLinkFixture.id
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Link)?.title).toEqual('Test Press Link')
      expect((res?.res as Link)?.quotation).toEqual('Test Quotation')
      expect((res?.res as Link)?.type).toEqual('press')
      expect(updateTag).toHaveBeenCalledWith('links')
    })

    it('merges submitted fields with the existing press link on update', async () => {
      mockSql
        .mockResolvedValueOnce([pressLinkFixture])
        .mockResolvedValueOnce([pressLinkFixture])

      // only url is submitted; type/attribution/quotation should fall
      // back to the existing link's values rather than being nulled out
      await editLink(
        formDataFromObject({ url: 'https://updated-press.com' }),
        pressLinkFixture.id
      )

      const [, attribution, publishDate, quotation] = mockSql.mock
        .calls[1] as unknown as string[]
      expect(attribution).toBe(pressLinkFixture.attribution)
      expect(publishDate).toEqual(pressLinkFixture.publishDate)
      expect(quotation).toBe(pressLinkFixture.quotation)
    })

    it('can create a new link', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])
      const res = await editLink(formDataFromObject(newLinkFixture))

      expect(res?.ok).toBe(true)
      expect((res?.res as Link)?.title).toEqual('Test Link')
      expect((res?.res as Link)?.id).toEqual(
        'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'
      )
      expect(updateTag).toHaveBeenCalledWith('links')
      // links are embedded into cached release/event/project/edition pages
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('can create a new press link', async () => {
      mockSql.mockResolvedValueOnce([pressLinkFixture])
      const res = await editLink(
        formDataFromObject(newPressLinkFixture)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Link)?.title).toEqual('Test Press Link')
      expect((res?.res as Link)?.quotation).toEqual('Test Quotation')
      expect((res?.res as Link)?.type).toEqual('press')
      expect(updateTag).toHaveBeenCalledWith('links')
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editLink(formDataFromObject(linkFixture))

      expect(res!.message).toBe('Failed to save link: DB error.')
    })

    it('can handle errors fetching the existing link on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editLink(
        formDataFromObject(linkFixture),
        linkFixture.id
      )

      expect(res!.message).toBe('Failed to save link: DB error.')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateLink> = { ...newLinkFixture }
      delete invalid.url
      const res = await editLink(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate link.')
      expect(res!.errors).toEqual({ url: ['Required'] })
    })
  })

  describe('#saveLinkFromFields', () => {
    it('creates a link from raw fields', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])

      const res = await saveLinkFromFields({ ...newLinkFixture })

      expect(res.title).toEqual('Test Link')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('normalizes raw checkbox/empty-string fields before validating', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])

      await saveLinkFromFields({ ...newLinkFixture, title: '' })

      const [, , , , , title] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(title).toBeNull()
    })

    it('throws a descriptive error on invalid fields', async () => {
      const invalid: Partial<CreateLink> = { ...newLinkFixture }
      delete invalid.url

      await expect(saveLinkFromFields(invalid)).rejects.toThrow(
        'Invalid link data: Required'
      )
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('#saveSocialLinkFromFields', () => {
    it('saves the link as social', async () => {
      mockSql
        .mockResolvedValueOnce([]) // no saved match
        .mockResolvedValueOnce([linkFixture]) // INSERT

      await saveSocialLinkFromFields({
        url: newLinkFixture.url,
        title: 'Instagram',
        type: 'press'
      })

      const params = mockSql.mock.calls[1]!.slice(1)
      expect(params).toContain('social')
      expect(params).not.toContain('press')
    })

    it('reuses a saved link with the same url and name', async () => {
      const saved = { ...linkFixture, type: 'social' as const }
      mockSql.mockResolvedValueOnce([saved])

      const link = await saveSocialLinkFromFields({
        url: saved.url,
        title: 'Instagram'
      })

      expect(link.id).toBe(saved.id)
      expect(mockSql).toHaveBeenCalledTimes(1)
      expect(mockSql.mock.calls[0]!.slice(1)).toEqual(
        expect.arrayContaining([saved.url, 'social', 'Instagram'])
      )
    })

    it('requires a name', async () => {
      await expect(
        saveSocialLinkFromFields({
          url: newLinkFixture.url,
          title: ''
        })
      ).rejects.toThrow('Invalid link data')
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('rejects an http url', async () => {
      await expect(
        saveSocialLinkFromFields({
          url: 'http://example.com',
          title: 'Example'
        })
      ).rejects.toThrow('Invalid link data')
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('rejects a whitespace-only name', async () => {
      await expect(
        saveSocialLinkFromFields({
          url: 'https://example.com',
          title: '   '
        })
      ).rejects.toThrow('Enter a name.')
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('#resolveSocialLinkIds', () => {
    it('returns undefined when the picker was not submitted', async () => {
      const result = await resolveSocialLinkIds({ title: 'Site' })

      expect(result).toBeUndefined()
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('returns an empty list for an emptied picker', async () => {
      const result = await resolveSocialLinkIds({
        'socialLinks[]': ''
      })

      expect(result).toEqual([])
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('dedupes ids in submitted order, leaving existing links as they are', async () => {
      const result = await resolveSocialLinkIds({
        'socialLinks[]': '',
        'socialLinks[0].id': 'link-2',
        'socialLinks[1].id': 'link-1',
        'socialLinks[2].id': 'link-2'
      })

      expect(result).toEqual(['link-2', 'link-1'])
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('saves identical new drafts once', async () => {
      mockSql
        .mockResolvedValueOnce([]) // no saved match
        .mockResolvedValueOnce([linkFixture]) // INSERT

      const result = await resolveSocialLinkIds({
        'socialLinks[]': '',
        'socialLinks[0].url': newLinkFixture.url,
        'socialLinks[0].title': 'Instagram',
        'socialLinks[1].url': ` ${newLinkFixture.url}`,
        'socialLinks[1].title': 'instagram'
      })

      expect(result).toEqual([linkFixture.id])
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('creates new entries as social links in place', async () => {
      mockSql
        .mockResolvedValueOnce([]) // no saved match
        .mockResolvedValueOnce([linkFixture]) // INSERT

      const result = await resolveSocialLinkIds({
        'socialLinks[]': '',
        'socialLinks[0].id': 'link-1',
        'socialLinks[1].url': newLinkFixture.url,
        'socialLinks[1].title': 'Instagram'
      })

      expect(result).toEqual(['link-1', linkFixture.id])
      expect(mockSql.mock.calls[1]!.slice(1)).toContain('social')
    })
  })

  describe('#resolveOrderedLinkIds', () => {
    it('returns existing entries as linkIds, preserving submitted order', async () => {
      const result = await resolveOrderedLinkIds({
        'links[0].id': 'link-1',
        'links[1].id': 'link-2',
        'links[2].id': 'link-3'
      })

      expect(result).toEqual({
        linkIds: ['link-1', 'link-2', 'link-3']
      })
    })

    it('creates pending new links in place, preserving position', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])

      const result = await resolveOrderedLinkIds({
        'links[0].id': 'link-1',
        'links[1].url': newLinkFixture.url,
        'links[1].title': newLinkFixture.title
      })

      expect(result).toEqual({
        linkIds: ['link-1', linkFixture.id]
      })
    })

    it('updates an edited existing entry (id + fields) in place', async () => {
      mockSql
        .mockResolvedValueOnce([linkFixture]) // fetchLinksByIds
        .mockResolvedValueOnce([linkFixture]) // UPDATE ... RETURNING *

      const result = await resolveOrderedLinkIds({
        'links[0].id': 'link-1',
        'links[0].url': newLinkFixture.url,
        'links[0].title': 'Edited title'
      })

      expect(result).toEqual({ linkIds: [linkFixture.id] })
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('removes consumed indexed keys from the input data object', async () => {
      const data: Record<string, unknown> = {
        'links[0].id': 'link-1',
        other: 'untouched'
      }

      await resolveOrderedLinkIds(data)

      expect(data).toEqual({ other: 'untouched' })
    })

    it('propagates validation errors from an inline-created entry', async () => {
      await expect(
        resolveOrderedLinkIds({
          'links[0].title': 'Missing URL'
        })
      ).rejects.toThrow('Invalid link data: Required')
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('returns empty linkIds when nothing is selected', async () => {
      const result = await resolveOrderedLinkIds({ 'links[]': '' })

      expect(result).toEqual({ linkIds: [] })
    })

    it('ignores an untouched empty new slot', async () => {
      const result = await resolveOrderedLinkIds({
        'links[0].url': '',
        'links[0].title': '',
        'links[0].type': ''
      })

      expect(result).toEqual({ linkIds: [] })
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('drops empty new slots but keeps a filled one, preserving order', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])

      const result = await resolveOrderedLinkIds({
        'links[0].id': 'link-1',
        'links[1].url': '',
        'links[1].title': '',
        'links[2].url': newLinkFixture.url,
        'links[2].title': newLinkFixture.title
      })

      expect(result).toEqual({
        linkIds: ['link-1', linkFixture.id]
      })
    })

    it('merges press links first, then other links', async () => {
      const result = await resolveOrderedLinkIds({
        'links[0].id': 'link-1',
        'pressLinks[0].id': 'press-1',
        'pressLinks[1].id': 'press-2'
      })

      expect(result).toEqual({
        linkIds: ['press-1', 'press-2', 'link-1']
      })
    })

    it('keeps one id for a link picked in both lists', async () => {
      const result = await resolveOrderedLinkIds({
        'links[0].id': 'link-1',
        'pressLinks[0].id': 'link-1'
      })

      expect(result).toEqual({ linkIds: ['link-1'] })
    })

    it('saves new press-picker entries as press', async () => {
      mockSql.mockResolvedValueOnce([pressLinkFixture])

      await resolveOrderedLinkIds({
        'pressLinks[0].url': newPressLinkFixture.url,
        'pressLinks[0].title': 'Review',
        'pressLinks[0].attribution': 'NYT',
        'pressLinks[0].publishDate': '2024-01-01'
      })

      expect(mockSql.mock.calls[0]).toContain('press')
    })

    it.each(['title', 'attribution', 'publishDate'])(
      'rejects a press-picker entry missing %s',
      async (field) => {
        const fields: Record<string, unknown> = {
          'pressLinks[0].url': newPressLinkFixture.url,
          'pressLinks[0].title': 'Review',
          'pressLinks[0].attribution': 'NYT',
          'pressLinks[0].publishDate': '2024-01-01'
        }
        delete fields[`pressLinks[0].${field}`]

        await expect(resolveOrderedLinkIds(fields)).rejects.toThrow(
          'Invalid link data'
        )
        expect(mockSql).not.toHaveBeenCalled()
      }
    )

    it('ignores an untouched empty press slot', async () => {
      const result = await resolveOrderedLinkIds({
        'pressLinks[0].url': '',
        'pressLinks[0].attribution': ''
      })

      expect(result).toEqual({ linkIds: [] })
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('supports a custom field prefix', async () => {
      const result = await resolveOrderedLinkIds(
        { 'related[0].id': 'link-1' },
        'related'
      )

      expect(result).toEqual({ linkIds: ['link-1'] })
    })
  })
})
