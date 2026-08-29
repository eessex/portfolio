import { z } from 'zod'

import { runFormAction } from '@/lib/form-action'
import { formDataFromObject } from '@/test/helpers'

const schema = z.object({ title: z.string() })

function runWith(
  overrides: Partial<Parameters<typeof runFormAction>[0]> = {}
) {
  return runFormAction({
    formData: formDataFromObject({ title: 'A project' }),
    schema,
    itemType: 'projects',
    save: jest.fn(async () => undefined),
    invalidate: jest.fn(),
    ...overrides
  })
}

describe('runFormAction', () => {
  it('returns a { ok: false } error instead of rejecting when prepare throws', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const save = jest.fn(async () => undefined)

    const res = await runWith({
      prepare: async () => {
        throw new Error('Upload failed')
      },
      save
    })

    expect(res).toEqual({
      ok: false,
      message: 'Failed to save project: Upload failed.'
    })
    expect(save).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to prepare projects:',
      expect.any(Error)
    )
    consoleError.mockRestore()
  })

  it('passes prepared data through to save on success', async () => {
    const save = jest.fn(async () => undefined)

    const res = await runWith({
      prepare: async (data) => ({ ...data, title: 'Prepared' }),
      save
    })

    expect(res).toEqual({ ok: true })
    expect(save).toHaveBeenCalledWith({ title: 'Prepared' })
  })
})
