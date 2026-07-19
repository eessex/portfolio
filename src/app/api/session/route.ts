import { isAuthed } from '@/lib/auth/guard'
import { formatAuthedApiResponseJSON } from '@/lib/util'

/**
 * Lightweight session check for client-side draft augmentation:
 * tells the browser whether the visitor has an admin session so
 * anonymous visitors can skip the augment refetch entirely. UX
 * only — draft visibility is gated server-side by the data routes.
 */
export async function GET() {
  return formatAuthedApiResponseJSON({ isAuthed: await isAuthed() })
}
