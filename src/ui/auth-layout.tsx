import { clsx } from 'clsx'

import { auth } from '@/auth'
import { AdminSidebar } from '@/ui/admin-sidebar/admin-sidebar'

export async function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className={clsx('body-container', isLoggedIn && 'admin')}>
      {isLoggedIn && <AdminSidebar />}
      {children}
    </div>
  )
}
