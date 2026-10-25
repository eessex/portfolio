import { linkName } from '@/lib/links/util'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { EmailSubscribe } from '@/ui/email-subscribe/email-subscribe'
import styles from '@/ui/footer/footer.module.scss'

export async function Footer() {
  const settings = await fetchCachedSiteSettings()
  const socialLinks = settings?.socialLinks ?? []
  const isEmailSubscribeEnabled = !!settings?.isEmailSubscribeEnabled

  if (socialLinks.length === 0 && !isEmailSubscribeEnabled)
    return null

  return (
    <footer className={styles.footer}>
      {socialLinks.length > 0 && (
        <nav>
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
      {isEmailSubscribeEnabled && <EmailSubscribe />}
    </footer>
  )
}
