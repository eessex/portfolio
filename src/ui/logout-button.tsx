import { signOut } from '@/api/auth'

export function LogoutButton ({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/' }) // redirect to home page after sign out
      }}
    >
      <button
        type='submit'
        className={className}
      >
        Sign Out
      </button>
    </form>
  )
}
