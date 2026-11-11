import { ACCOUNT_URL, isAuthedPath, SETTINGS_URL } from './paths'

describe('isAuthedPath', () => {
  it.each([SETTINGS_URL, ACCOUNT_URL])(
    'requires auth for %s',
    (url) => {
      expect(isAuthedPath(url)).toBe(true)
    }
  )

  it.each([`${SETTINGS_URL}/x`, `${ACCOUNT_URL}x`])(
    'matches %s exactly, not as a prefix',
    (url) => {
      expect(isAuthedPath(url)).toBe(false)
    }
  )
})
