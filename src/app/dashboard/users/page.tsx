import type { Metadata } from 'next'
import { Suspense } from 'react'

import { currentUserId } from '@/lib/auth/guard'
import { fetchUsers } from '@/lib/users/data'
import { fetchPendingInvites } from '@/lib/users/tokens'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { UsersManager } from '@/ui/users/users-manager'

const title = 'Dashboard: Users'
export const metadata: Metadata = { title }

export default function UsersPage() {
  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <Users />
      </Suspense>
    </DashboardLayout>
  )
}

// Reads the session, so it streams in under the static heading
async function Users() {
  const id = await currentUserId()
  if (!id) return null
  const [users, invites] = await Promise.all([
    fetchUsers(),
    fetchPendingInvites()
  ])

  return (
    <UsersManager
      users={users}
      invites={invites}
      currentUserId={id}
    />
  )
}
