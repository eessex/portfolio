import { fetchSocialLinks } from '@/lib/links/data'
import { EmailSubscribe } from '@/ui/email-subscribe/email-subscribe'
import styles from '@/ui/footer/footer.module.scss'

export async function Footer () {
  const socialLinks = await fetchSocialLinks()

  return (
    <footer className={`text-sm ${styles.footer}`}>
      {socialLinks.length > 0 && (
        <nav>
          <ul className='flex'>
            {socialLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target='_blank'
                  rel='noreferrer'
                >
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
