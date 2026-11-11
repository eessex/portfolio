import { checkBotId } from 'botid/server'
import { NextResponse } from 'next/server'

import { createEmailSubscription } from '@/lib/email-subscriptions/subscribe'

/** The footer form's endpoint; protected by BotID (instrumentation-client.ts) */
export async function POST(request: Request) {
  const { isBot } = await checkBotId()
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid request.' },
      { status: 400 }
    )
  }
  return NextResponse.json(
    await createEmailSubscription(formData, { isBot })
  )
}
