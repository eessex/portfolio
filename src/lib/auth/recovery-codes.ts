// Deliberately NOT a server action: plain codes exist only inside the
// actions that generate or check them.
import bcrypt from 'bcrypt'

import { DUMMY_PASSWORD_HASH } from '@/lib/auth/dummy-hash'
import {
  generateGroupedCode,
  normalizeGroupedCode
} from '@/lib/auth/grouped-code'
import { hashSecret } from '@/lib/auth/hash-secret'
import { RECOVERY_CODE_COUNT } from '@/lib/users/schemas'

// 50 bits each; guesses are also throttled per email
const RECOVERY_CODE_LENGTH = 10
const RECOVERY_CODE_GROUP_SIZE = 5
export interface RecoveryCodeSet {
  /** Shown once, never stored */
  codes: string[]
  hashes: string[]
}

/** A fresh set of codes (`K7QM3-XRDPW`) and their bcrypt hashes. */
export async function generateRecoveryCodeSet(): Promise<RecoveryCodeSet> {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    generateGroupedCode(
      RECOVERY_CODE_LENGTH,
      RECOVERY_CODE_GROUP_SIZE
    )
  )
  const hashes = await Promise.all(
    codes.map((code) => hashSecret(normalizeGroupedCode(code)))
  )
  return { codes, hashes }
}

// Padded to a full set so timing hides the account and its count
export async function findMatchingRecoveryCode(
  submitted: string,
  stored: { id: string; code_hash: string }[]
): Promise<string | null> {
  const normalized = normalizeGroupedCode(submitted)
  const padded = [
    ...stored,
    ...Array.from(
      { length: Math.max(0, RECOVERY_CODE_COUNT - stored.length) },
      () => ({ id: null, code_hash: DUMMY_PASSWORD_HASH })
    )
  ]
  const matches = await Promise.all(
    padded.map((row) => bcrypt.compare(normalized, row.code_hash))
  )
  return padded.find((_, i) => matches[i])?.id ?? null
}
