import { Suspense } from 'react'

import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { FooterContent } from '@/ui/footer/footer'
import { AdminMenu } from '@/ui/nav/admin-menu'
import adminMenuStyles from '@/ui/nav/admin-menu.module.scss'
import style from '@/ui/nav/nav.module.scss'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItemsFromSettings,
  navPaths
} from '@/ui/nav/nav-items'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'

export async function Nav() {
  const siteSettings = await fetchCachedSiteSettings().catch(
    (error) => {
      console.error('Failed to fetch site settings for nav:', error)
      return undefined
    }
  )
  const shownItems = navItemsFromSettings(siteSettings?.navItems)
  const statuses = await Promise.all(
    shownItems.map(({ navPath }) => fetchNavItemStatus(navPath))
  )

  const items: NavItem[] = shownItems.flatMap((item, i) => {
    const status = statuses[i]
    return status ? [{ ...item, status }] : []
  })

  const hiddenNavPaths = navPaths.filter(
    (navPath) => !shownItems.some((item) => item.navPath === navPath)
  )

  const socialLinks = siteSettings?.socialLinks ?? []
  const isEmailSubscribeEnabled =
    !!siteSettings?.isEmailSubscribeEnabled

  return (
    <NavClient
      title={siteSettings?.title}
      logo={siteSettings?.logoImage}
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
          <AdminMenu hiddenNavPaths={hiddenNavPaths} />
        </Suspense>
      }
    />
  )
}
