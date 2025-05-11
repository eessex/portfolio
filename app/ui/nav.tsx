import { fetchSiteSettings } from '@/lib/data'
import Link from 'next/link'

export default async function Nav () {
  const settings = await fetchSiteSettings()

  return (
    <nav className='flex flex-row'>
      <h1 className='md:space-x-2 flex-1'>
        <Link href='/'>
          {settings?.title || 'Site Title'}
        </Link>
      </h1>

      <ul className='flex flex-row space-x-4 font-bold'>
        <li>
          <Link href='/events'>
            Events
          </Link>
        </li>
        <li>
          <Link href='/releases'>
            Releases
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
