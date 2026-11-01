import bcrypt from 'bcrypt'

// Must match DUMMY_PASSWORD_HASH's cost, or timing tells them apart
export const BCRYPT_COST = 10

/** bcrypt hash of a password or recovery code */
export const hashSecret = (secret: string) =>
  bcrypt.hash(secret, BCRYPT_COST)
