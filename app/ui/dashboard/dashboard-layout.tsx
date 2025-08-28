export function DashboardLayout ({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>

      <div className='p-4'>
        {children}
      </div>
    </div>
  )
}
