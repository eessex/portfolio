import clsx from 'clsx'

import type { Link } from '@/lib/links/schemas/db'
import { linkName } from '@/lib/links/util'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { EmailSubscribe } from '@/ui/email-subscribe/email-subscribe'
import styles from '@/ui/footer/footer.module.scss'

/** Social links + subscribe; also the visitors' mobile Menu tray */
export function FooterContent({
  socialLinks,
  isEmailSubscribeEnabled,
  as: Container = 'footer',
  className,
  subscribeLabelClassName = 'visually-hidden'
}: {
  socialLinks: Link[]
  isEmailSubscribeEnabled: boolean
  as?: 'footer' | 'div'
  className?: string
  /** The subscribe form's label; visually hidden by default */
  subscribeLabelClassName?: string
}) {
  return (
    <Container className={clsx(styles.footer, className)}>
      {socialLinks.length > 0 && (
        <nav aria-label='Social links'>
          <ul>
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a href={link.url} target='_blank' rel='noreferrer'>
                  {linkName(link)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {isEmailSubscribeEnabled && (
        <EmailSubscribe
          label='Mailing list'
          labelClassName={subscribeLabelClassName}
        />
      )}
    </Container>
  )
}

export async function Footer() {
  const settings = await fetchCachedSiteSettings()
  const socialLinks = settings?.socialLinks ?? []
  const isEmailSubscribeEnabled = !!settings?.isEmailSubscribeEnabled

  if (socialLinks.length === 0 && !isEmailSubscribeEnabled)
    return null

  return (
    <FooterContent
      socialLinks={socialLinks}
      isEmailSubscribeEnabled={isEmailSubscribeEnabled}
    />
  )
}
