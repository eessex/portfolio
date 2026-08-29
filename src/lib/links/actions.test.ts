import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  createLinkFromFields,
  deleteLink,
  editLink,
  resolveOrderedLinkIds
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

      const [, attribution, , publishDate, quotation] = mockSql.mock
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

  describe('#createLinkFromFields', () => {
    it('creates a link from raw fields', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])

      const res = await createLinkFromFields({ ...newLinkFixture })

      expect(res.title).toEqual('Test Link')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('normalizes raw checkbox/empty-string fields before validating', async () => {
      mockSql.mockResolvedValueOnce([linkFixture])

      await createLinkFromFields({ ...newLinkFixture, title: '' })

      const [, , , , , title] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(title).toBeNull()
    })

    it('throws a descriptive error on invalid fields', async () => {
      const invalid: Partial<CreateLink> = { ...newLinkFixture }
      delete invalid.url

      await expect(createLinkFromFields(invalid)).rejects.toThrow(
        'Invalid link data: Required'
      )
      expect(mockSql).not.toHaveBeenCalled()
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

    it('supports a custom field prefix', async () => {
      const result = await resolveOrderedLinkIds(
        { 'related[0].id': 'link-1' },
        'related'
      )

      expect(result).toEqual({ linkIds: ['link-1'] })
    })
  })
})
