'use server'

import { signIn } from '@/auth'
import type { FormResponse } from '@/lib/types'

export async function authenticate (
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  await signIn('credentials', formData)
  return { ok: true }
}
