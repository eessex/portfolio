import { signOut } from '../../auth'

export default function LogoutButton () {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/' }) // redirect to home page after sign out
      }}
    >
      <button type='submit'>Sign Out</button>
    </form>
  )
}
