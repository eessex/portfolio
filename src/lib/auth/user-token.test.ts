import {
  generateUserToken,
  hashUserToken
} from '@/lib/auth/user-token'
import { USER_TOKEN_PATTERN } from '@/lib/users/schemas'

describe('#generateUserToken', () => {
  it('returns a URL-safe 256-bit token and its hash', () => {
    const { token, hash } = generateUserToken()

    expect(token).toMatch(USER_TOKEN_PATTERN)
    expect(hash).toBe(hashUserToken(token))
  })

  it('never repeats', () => {
    expect(generateUserToken().token).not.toBe(
      generateUserToken().token
    )
  })
})

describe('#hashUserToken', () => {
  it('is a sha256 hex digest that ignores surrounding whitespace', () => {
    expect(hashUserToken('abc')).toMatch(/^[0-9a-f]{64}$/)
    expect(hashUserToken(' abc\n')).toBe(hashUserToken('abc'))
  })
})
