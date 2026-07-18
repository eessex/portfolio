import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  deleteEmbedCode,
  editEmbedCode
} from '@/lib/embed-codes/actions'
import {
  createEmbedCodeFixture,
  embedCodeFixture
} from '@/lib/embed-codes/fixtures'
import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/schemas/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

describe('Embed Code Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deleteEmbedCode', () => {
    it('can delete a embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await deleteEmbedCode(embedCodeFixture)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('embed-codes')
      // embed codes are embedded into cached release/event/project pages
      expect(updateTag).toHaveBeenCalledWith('releases')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteEmbedCode(embedCodeFixture)

      expect(res!.message).toBe(
        'Failed to delete embed code: DB error.'
      )
    })
  })

  describe('#editEmbedCode', () => {
    it('can edit an existing embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await editEmbedCode(
        formDataFromObject(embedCodeFixture)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as EmbedCode)?.caption).toEqual(
        'This is an embed code for testing purposes.'
      )
      expect(updateTag).toHaveBeenCalledWith('embed-codes')
    })

    it('can create a new embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await editEmbedCode(
        formDataFromObject(createEmbedCodeFixture)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as EmbedCode)?.caption).toEqual(
        'This is an embed code for testing purposes.'
      )
      expect((res?.res as EmbedCode)?.id).toEqual(
        '123e4567-e89b-12d3-a456-426614174000'
      )
      expect(updateTag).toHaveBeenCalledWith('embed-codes')
      // embed codes are embedded into cached release/event/project pages
      expect(updateTag).toHaveBeenCalledWith('releases')
    })

    it('normalizes empty optional fields to undefined before saving', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(
        formDataFromObject({ ...createEmbedCodeFixture, caption: '' })
      )

      const [, caption] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(caption).toBeUndefined()
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editEmbedCode(
        formDataFromObject(embedCodeFixture)
      )

      expect(res!.message).toBe(
        'Failed to save embed code: DB error.'
      )
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateEmbedCode> = {
        ...createEmbedCodeFixture
      }
      delete invalid.src
      const res = await editEmbedCode(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate embed code.')
      expect(res!.errors).toEqual({ src: ['Required'] })
    })
  })
})
