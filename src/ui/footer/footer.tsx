import { fetchSocialLinks } from '@/lib/links/cached'
import { EmailSubscribe } from '@/ui/email-subscribe/email-subscribe'
import styles from '@/ui/footer/footer.module.scss'

export async function Footer() {
  const socialLinks = await fetchSocialLinks()

  return (
    <footer className={styles.footer}>
      {socialLinks.length > 0 && (
        <nav>
          <ul>
            {socialLinks.map((link, index) => (
              <li key={index}>
                <a href={link.url} target='_blank' rel='noreferrer'>
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <EmailSubscribe />
    </footer>
  )
}
