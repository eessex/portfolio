import { initBotId } from 'botid/client/core'

import { SUBSCRIBE_API_PATH } from '@/lib/email-subscriptions/paths'

// Skipped in development; checked by checkBotId() in the route
initBotId({
  protect: [{ path: SUBSCRIBE_API_PATH, method: 'POST' }]
})
