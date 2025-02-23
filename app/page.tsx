const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Site Description'

export default function Home () {
  return (
    <div className='p-4 md:2'>
      <h1 className='visually-hidden'>
        Homepage
      </h1>

      {siteDescription && (
        <h2>{siteDescription}</h2>
      )}
    </div>
  )
}
