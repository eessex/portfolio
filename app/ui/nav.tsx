import Link from 'next/link'

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'Site Title'

export default function Nav () {
  return (
    <nav className='flex flex-row'>
      <h1 className='md:space-x-2 flex-1'>
        <Link href='/'>
          {siteTitle}
        </Link>
      </h1>
      <ul className='flex flex-row space-x-2 md:space-x-0 md:space-x-4 font-bold'>
        <li>
          <Link href='/events'>
            Events
          </Link>
        </li>
        <li>
          <Link href='/about'>
            About
          </Link>
        </li>
      </ul>
    </nav>
  )
}
