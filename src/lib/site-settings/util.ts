import { iconKey, publicUrl } from '@/lib/storage/keys'

/** Bump to regenerate every site's icons on its next save or backfill. */
export const ICON_VERSION = 1

/** Every generated icon, by role → file name (in storage and defaults). */
export const SITE_ICON_FILES = {
  favicon: 'favicon.ico',
  icon32: 'icon-32.png',
  icon192: 'icon-192.png',
  icon512: 'icon-512.png',
  appleTouchIcon: 'apple-touch-icon.png'
} as const
export type SiteIconRole = keyof typeof SITE_ICON_FILES

/** Served wherever no custom icon is set. */
export const DEFAULT_ICON_PATH = '/default-icons'

interface IconSettings {
  iconImageId?: string
  iconVersion?: number
}

/**
 * Both columns are needed: deleting the image clears only
 * icon_image_id.
 */
export function hasCustomIcon(
  settings?: IconSettings
): settings is Required<IconSettings> {
  return !!settings?.iconImageId && !!settings.iconVersion
}

/** Each icon's URL: the stored files, else the defaults. */
export function siteIconUrls(
  settings?: IconSettings
): Record<SiteIconRole, string> {
  const custom = hasCustomIcon(settings) ? settings : undefined
  return Object.fromEntries(
    Object.entries(SITE_ICON_FILES).map(([role, file]) => [
      role,
      custom
        ? publicUrl(
            iconKey(custom.iconImageId, custom.iconVersion, file)
          )
        : `${DEFAULT_ICON_PATH}/${file}`
    ])
  ) as Record<SiteIconRole, string>
}
