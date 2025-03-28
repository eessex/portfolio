import { fetchSocialLinks } from '@/lib/data'
import EmailSubscribe from '@/ui/email-subscribe/email-subscribe'
import styles from '@/ui/footer/footer.module.scss'
import { auth } from '../../../auth'
import LogoutButton from '../logout-button'

export default async function asyncFooter () {
  const socialLinks = await fetchSocialLinks()
  const session = await auth()

  return (
    <footer className={`text-sm ${styles.footer}`}>
      {socialLinks.length > 0 && (
        <nav>
          <ul className='flex'>
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
      {session?.user
        ? (
          <LogoutButton />
          )
        : (
          <EmailSubscribe />
          )}
    </footer>
  )
}
