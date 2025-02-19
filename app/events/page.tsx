import { Metadata } from 'next'

const title = 'Events'
export const metadata: Metadata = { title }

export default function EventsPage () {
  return (
    <div className='p-4 md:2'>
      <h1>{title}</h1>
    </div>
  )
}
