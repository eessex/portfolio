'use server'

import { assertAuthed } from '@/lib/auth/guard'
import { resolveOEmbed } from '@/lib/embed-codes/oembed'
import type { EmbedCodeHost } from '@/lib/embed-codes/schemas/db'

/**
 * Client-callable preview of a host's oEmbed title/thumbnail — intended
 * for a live cover-image preview as soon as an iframe/src is entered,
 * before the embed code is actually saved. Not currently wired into any
 * UI (the planned consumer is the item-picker combo box's upcoming
 * inline "create a new embed code" flow); title itself is no longer
 * editable anywhere (it's always system-derived from `host`/`src`, see
 * `attachEmbedCodeMetadata` in `actions.ts`), so once wired up this would
 * only use it as the preview image's alt text. Deliberately skips
 * `fetchEmbedCodeMetadata`'s storage upload (that only happens once, at real
 * create time) so pasting-then-abandoning the form never uploads
 * anything. Routed through the server (rather than called directly from
 * the browser) because not every host's oEmbed endpoint sends CORS
 * headers — Mixcloud and Bandcamp were confirmed to omit them, so a
 * client-side fetch would silently fail for those two hosts. Kept in its
 * own module (rather than alongside `fetchEmbedCodeMetadata`) so this
 * client-importable action never pulls in the sharp/storage cover-image
 * pipeline it doesn't use.
 */
export async function previewEmbedCodeMetadata(
  host: EmbedCodeHost,
  src: string
): Promise<{ title?: string; thumbnailUrl?: string }> {
  await assertAuthed()

  try {
    const resolved = await resolveOEmbed(host, src)
    return {
      title: resolved?.title,
      thumbnailUrl: resolved?.thumbnailUrl
    }
  } catch (cause) {
    console.error('Failed to preview embed code metadata:', cause)
    return {}
  }
}
