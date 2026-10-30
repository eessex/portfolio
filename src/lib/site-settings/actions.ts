'use server'

import { updateTag } from 'next/cache'

import { requireAuth } from '@/lib/auth/guard'
import { sql } from '@/lib/db'
import { runFormAction } from '@/lib/form-action'
import { resolveCoverImageId } from '@/lib/images/actions'
import { resolveSocialLinkIds } from '@/lib/links/actions'
import {
  createSocialLinkSchema,
  LinkTypes
} from '@/lib/links/schemas/db'
import { generateSiteIcons } from '@/lib/site-settings/icons'
import type { CreateSiteSettings } from '@/lib/site-settings/schemas'
import {
  createSiteSettingsSchema,
  MAX_SOCIAL_LINKS,
  maxSocialLinksMessage
} from '@/lib/site-settings/schemas'
import { ICON_VERSION } from '@/lib/site-settings/util'
import type { FormResponse } from '@/lib/types'
import {
  extractIndexedGroups,
  isBlankEntry,
  normalizeFormData
} from '@/lib/util'

const SOCIAL_LINKS_FIELD = 'socialLinks'

/**
 * site_settings is a singleton: `id` present updates the existing
 * row, `id` absent creates it (first-run setup — see the gate in
 * src/auth.config.ts, which has no create UI until this runs once).
 */
export async function editSiteSettings(
  formData: FormData,
  id?: string
): Promise<FormResponse<void>> {
  const denied = await requireAuth()
  if (denied) return denied

  // checked before anything is saved, so a failure can't leave the
  // cover image or other links created behind it
  const socialLinksError = validateSocialLinkEntries(formData)
  if (socialLinksError) {
    return {
      ok: false,
      message: 'Failed to validate site settings.',
      errors: { [SOCIAL_LINKS_FIELD]: [socialLinksError] }
    }
  }

  return runFormAction({
    formData,
    schema: createSiteSettingsSchema,
    itemType: 'siteSettings',
    prepare: async (data) => {
      // sequential: links are pre-validated, so the cover image
      // (storage upload) is the likelier failure and runs first
      const coverImageId = await resolveCoverImageId(data)
      const iconImageId = await resolveCoverImageId(
        data,
        'iconImageId'
      )
      const socialLinkIds = await resolveSocialLinkIds(
        data,
        SOCIAL_LINKS_FIELD
      )
      return { ...data, coverImageId, iconImageId, socialLinkIds }
    },
    invalidate: () => {
      updateTag('settings')
      updateTag('images')
      // inline link edits change rows these pages embed too
      updateTag('links')
      updateTag('releases')
      updateTag('events')
      updateTag('projects')
    },
    save: async (settings) => {
      // after validation, so a refused form writes no icon files
      const iconVersion = await ensureSiteIcons(
        settings.iconImageId,
        id
      )
      const row = { ...settings, iconVersion }
      return id
        ? updateSiteSettings(row, id)
        : createSiteSettings(row)
    }
  })
}

/**
 * Generates the icon's files unless the stored ones are this image's
 * at ICON_VERSION; returns the version to record (none without an
 * icon). Throws before the row is written, so it never points at
 * missing files.
 */
async function ensureSiteIcons(
  iconImageId: string | undefined,
  id: string | undefined
): Promise<number | undefined> {
  if (!iconImageId) return
  const [stored] = id
    ? await sql`
        SELECT icon_image_id, icon_version
        FROM site_settings
        WHERE id = ${id}
      `
    : []
  const isCurrent =
    stored?.icon_image_id === iconImageId &&
    (stored?.icon_version ?? 0) >= ICON_VERSION
  // a newer version (written before a rollback) keeps its own files
  if (isCurrent) return stored.icon_version
  await generateSiteIcons(iconImageId)
  return ICON_VERSION
}

type SiteSettingsRow = CreateSiteSettings & { iconVersion?: number }

function validateSocialLinkEntries(
  formData: FormData
): string | undefined {
  const entries = extractIndexedGroups(
    Object.fromEntries(formData),
    SOCIAL_LINKS_FIELD
  ).filter(
    (entry) => entry.kind !== 'new' || !isBlankEntry(entry.fields)
  )
  if (entries.length > MAX_SOCIAL_LINKS) return maxSocialLinksMessage

  for (const [index, entry] of entries.entries()) {
    if (entry.kind === 'existing') continue
    const parsed = createSocialLinkSchema.safeParse(
      normalizeFormData({ ...entry.fields, type: LinkTypes.social })
    )
    if (!parsed.success) {
      // as the form labels them
      const fields = new Set(
        parsed.error.issues.map((issue) =>
          issue.path[0] === 'title' ? 'name' : String(issue.path[0])
        )
      )
      return `Social link ${index + 1} has an invalid ${[...fields].join(', ')}.`
    }
  }
}

async function createSiteSettings({
  coverImageId,
  description,
  iconImageId,
  iconVersion,
  isEmailSubscribeEnabled,
  socialLinkIds,
  title
}: SiteSettingsRow) {
  await sql`
    INSERT INTO site_settings (
      title,
      description,
      cover_image_id,
      social_link_ids,
      is_email_subscribe_enabled,
      icon_image_id,
      icon_version
    )
    VALUES (
      ${title || ''},
      ${description || ''},
      ${coverImageId || null},
      ${socialLinkIds ?? []}::uuid[],
      ${isEmailSubscribeEnabled},
      ${iconImageId || null},
      ${iconVersion ?? null}
    )
  `
}

async function updateSiteSettings(
  {
    coverImageId,
    description,
    iconImageId,
    iconVersion,
    isEmailSubscribeEnabled,
    socialLinkIds,
    title
  }: SiteSettingsRow,
  id: string
) {
  // an unsubmitted picker keeps the stored list
  await sql`
    UPDATE site_settings
    SET title = ${title || ''},
        description = ${description || ''},
        cover_image_id = ${coverImageId || null},
        social_link_ids = COALESCE(
          ${socialLinkIds ?? null}::uuid[],
          social_link_ids
        ),
        is_email_subscribe_enabled = ${isEmailSubscribeEnabled},
        icon_image_id = ${iconImageId || null},
        icon_version = ${iconVersion ?? null},
        updated_at = current_timestamp
    WHERE id = ${id}
  `
}
