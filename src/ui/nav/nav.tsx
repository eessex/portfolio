import { Suspense } from 'react'

import { fetchCachedSvgDataUrl } from '@/lib/images/cached'
import { isSvg } from '@/lib/images/util'
import { siteIdentity } from '@/lib/projects/site-identity'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { siteNavPaths } from '@/lib/site-settings/nav-paths'
import { FooterContent } from '@/ui/footer/footer'
import { AdminMenu } from '@/ui/nav/admin-menu'
import adminMenuStyles from '@/ui/nav/admin-menu.module.scss'
import style from '@/ui/nav/nav.module.scss'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItemsFromSettings
} from '@/ui/nav/nav-items'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'

export async function Nav() {
  const [{ siteSettings, isFetchFailed }, { kind }] =
    await Promise.all([
      fetchCachedSiteSettings().then(
        (siteSettings) => ({ siteSettings, isFetchFailed: false }),
        (error) => {
          console.error(
            'Failed to fetch site settings for nav:',
            error
          )
          return { siteSettings: undefined, isFetchFailed: true }
        }
      ),
      siteIdentity()
    ])
  // Until the first settings save, admins are mid-setup: leave out
  // the admin-only (draft/empty) items and admin menu sections so the
  // menu doesn't lead them out of the onboarding flow. A failed fetch
  // keeps them, failing open for a configured site.
  const isOnboarding = !siteSettings && !isFetchFailed
  const logo = siteSettings?.logoImage
  // without it, SiteLogo shows the SVG as an <img>
  const logoMaskUrl =
    logo && isSvg(logo)
      ? await fetchCachedSvgDataUrl(logo.url).catch((error) => {
          console.error('Failed to inline the SVG logo:', error)
          return undefined
        })
      : undefined
  const shownItems = navItemsFromSettings(
    kind,
    siteSettings?.navItems
  )
  const statuses = await Promise.all(
    shownItems.map(({ navPath }) => fetchNavItemStatus(navPath))
  )

  const items: NavItem[] = shownItems.flatMap((item, i) => {
    const status = statuses[i]
    if (!status) return []
    if (isOnboarding && status !== 'published') return []
    return [{ ...item, status }]
  })

  const hiddenNavPaths = siteNavPaths(kind).filter(
    (navPath) => !shownItems.some((item) => item.navPath === navPath)
  )

  const socialLinks = siteSettings?.socialLinks ?? []
  const isEmailSubscribeEnabled =
    !!siteSettings?.isEmailSubscribeEnabled

  return (
    <NavClient
      title={siteSettings?.title}
      logo={logo}
      logoMaskUrl={logoMaskUrl}
      isLogoOnly={siteSettings?.isLogoOnly}
      items={items}
      trayFooter={
        (socialLinks.length > 0 || isEmailSubscribeEnabled) && (
          <FooterContent
            as='div'
            className={style['tray-footer']}
            socialLinks={socialLinks}
            isEmailSubscribeEnabled={isEmailSubscribeEnabled}
            // the mobile admin menu's group labels
            subscribeLabelClassName={adminMenuStyles['label']}
          />
        )
      }
      isTrayFooterSubscribeOnly={socialLinks.length === 0}
      adminMenu={
        <Suspense fallback={null}>
          <AdminMenu
            hiddenNavPaths={hiddenNavPaths}
            isOnboarding={isOnboarding}
          />
        </Suspense>
      }
    />
  )
}
