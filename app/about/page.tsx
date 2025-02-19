import { Metadata } from 'next'

const title = 'About'
export const metadata: Metadata = { title }

export default function AboutPage () {
  return (
    <div className='p-4 md:2'>
      <h1>{title}</h1>
    </div>
  )
}
