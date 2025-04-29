import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth } from '../../../auth'

export async function EditButton ({ path }: { path: string }) {
  const session = await auth()

  if (session?.user) {
    return (
      <Link href={`${path}/edit`} className='button'>
        <PencilIcon /> Edit
      </Link>
    )
  }
}
