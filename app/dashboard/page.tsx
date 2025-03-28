import { Metadata } from 'next'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage () {
  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>
    </div>
  )
}
