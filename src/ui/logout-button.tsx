import { PowerIcon } from '@heroicons/react/24/outline'

import { signOut } from '@/api/auth'

export function LogoutButton () {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/' })
      }}
    >
      <button type='submit'>
        <PowerIcon /> Sign Out
      </button>
    </form>
  )
}
