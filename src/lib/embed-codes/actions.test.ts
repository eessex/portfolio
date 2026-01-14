import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import {
  deleteEmbedCode,
  editEmbedCode
} from '@/lib/embed-codes/actions'
import {
  embedCodeFixture,
  newEmbedCodeFixture
} from '@/lib/embed-codes/fixtures'
import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import { formDataFromObject } from '@/lib/util'

jest.mock('postgres')
jest.mock('next/cache')

const mockSql = (postgres as unknown as { __sql: jest.Mock }).__sql

describe('Embed Code Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deleteEmbedCode', () => {
    it('can delete a embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await deleteEmbedCode(embedCodeFixture)

      expect(res).toEqual({ ok: true })
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/embed_codes')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteEmbedCode(embedCodeFixture)

      expect(res!.message).toBe('Failed to delete embed code: DB error')
    })
  })

  describe('#editEmbedCode', () => {
    it('can edit an existing embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await editEmbedCode(formDataFromObject(embedCodeFixture))

      expect(res?.ok).toBe(true)
      expect((res?.res as EmbedCode)?.caption).toEqual('This is a new embed code for testing purposes.')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/embed_codes')
    })

    it('can create a new embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await editEmbedCode(formDataFromObject(newEmbedCodeFixture))

      expect(res?.ok).toBe(true)
      expect((res?.res as EmbedCode)?.caption).toEqual('This is a new embed code for testing purposes.')
      expect((res?.res as EmbedCode)?.id).toEqual('123e4567-e89b-12d3-a456-426614174000')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/embed_codes')
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editEmbedCode(formDataFromObject(embedCodeFixture))

      expect(res!.message).toBe('Failed to edit embed code: DB error')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateEmbedCode> = { ...newEmbedCodeFixture }
      delete invalid.iframe
      const res = await editEmbedCode(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate embed code.')
      expect(res!.errors).toEqual({ iframe: ['Required'] })
    })
  })
})
