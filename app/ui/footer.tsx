import { fetchFooterLinks } from '@/lib/data'

export default async function asyncFooter () {
  const socialLinks = await fetchFooterLinks()

  return (
    <footer className='md:flex md:justify-between py-4 px-6 text-sm'>
      {socialLinks.length > 0 && (
        <nav>
          <ul className='flex space-x-4'>
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

      <p>© {new Date().getFullYear()}</p>
    </footer>
  )
}
