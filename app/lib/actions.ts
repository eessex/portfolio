'use server'

import { signIn } from '../../auth'
import { AuthError } from 'next-auth'
import { escapeHtml } from '@/ui/util'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function authenticate (
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

/** save email subscriptions */
export async function createEmailSubscription (email: string) {
  const cleanedEmail = escapeHtml(email)

  try {
    await sql`
      INSERT INTO email_subscriptions (created_at, email)
      VALUES (current_timestamp, ${cleanedEmail})
    `
    return { ok: true }
  } catch (err) {
    console.error(err)
    return {
      message: 'Database Error: Failed to Create subscription.',
    }
  }
}
