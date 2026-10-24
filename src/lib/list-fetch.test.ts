import { z } from 'zod'

import { escapeLike, runListFetch } from '@/lib/list-fetch'

describe('escapeLike', () => {
  it('escapes LIKE metacharacters', () => {
    expect(escapeLike('_')).toBe('\\_')
    expect(escapeLike('100%')).toBe('100\\%')
    expect(escapeLike('a\\b')).toBe('a\\\\b')
  })

  it('leaves other text alone', () => {
    expect(escapeLike('Café Oto')).toBe('Café Oto')
  })
})

describe('runListFetch', () => {
  async function likeFor(query?: string) {
    const count = jest.fn().mockResolvedValue([{ count: 0 }])
    const list = jest.fn().mockResolvedValue([])
    await runListFetch({
      query,
      itemType: 'venues',
      schema: z.object({ id: z.string(), name: z.string() }),
      cursorKey: 'name',
      count,
      list
    })
    expect(list.mock.calls[0]?.[0].like).toBe(
      count.mock.calls[0]?.[0]
    )
    return count.mock.calls[0]?.[0]
  }

  it('matches `_` literally', async () => {
    expect(await likeFor('_')).toBe('%\\_%')
  })

  it('matches `%` literally', async () => {
    expect(await likeFor('100%')).toBe('%100\\%%')
  })

  it('matches a backslash literally', async () => {
    expect(await likeFor('a\\b')).toBe('%a\\\\b%')
  })

  it('passes null when unfiltered', async () => {
    expect(await likeFor()).toBeNull()
  })
})
