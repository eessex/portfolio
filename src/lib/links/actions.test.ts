import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { deleteLink, editLink } from '@/lib/links/actions'
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
})
