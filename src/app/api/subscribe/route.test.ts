/** @jest-environment node */

import { checkBotId } from 'botid/server'

import { POST } from '@/app/api/subscribe/route'
import { createEmailSubscription } from '@/lib/email-subscriptions/subscribe'

jest.mock('botid/server', () => ({ checkBotId: jest.fn() }))
jest.mock('@/lib/email-subscriptions/subscribe', () => ({
  createEmailSubscription: jest.fn(async () => ({ ok: true }))
}))
const mockCheckBotId = jest.mocked(checkBotId)
const mockCreate = jest.mocked(createEmailSubscription)

function post(body: BodyInit) {
  return new Request('http://localhost/api/subscribe', {
    method: 'POST',
    body
  })
}

describe('POST /api/subscribe', () => {
  beforeEach(() => jest.clearAllMocks())

  it('passes the BotID verdict to the subscribe logic', async () => {
    mockCheckBotId.mockResolvedValueOnce({
      isBot: true
    } as Awaited<ReturnType<typeof checkBotId>>)
    const form = new FormData()
    form.set('email', 'a@example.com')

    const res = await POST(post(form))

    expect(await res.json()).toEqual({ ok: true })
    expect(mockCreate).toHaveBeenCalledWith(expect.any(FormData), {
      isBot: true
    })
  })

  it('rejects a body that is not form data', async () => {
    mockCheckBotId.mockResolvedValueOnce({
      isBot: false
    } as Awaited<ReturnType<typeof checkBotId>>)

    const res = await POST(post('nope'))

    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
