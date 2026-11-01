import bcrypt from 'bcrypt'

import { GROUPED_CODE_ALPHABET } from '@/lib/auth/grouped-code'
import {
  findMatchingRecoveryCode,
  generateRecoveryCodeSet
} from '@/lib/auth/recovery-codes'
import { RECOVERY_CODE_COUNT } from '@/lib/users/schemas'

const codePattern = new RegExp(
  `^[${GROUPED_CODE_ALPHABET}]{5}-[${GROUPED_CODE_ALPHABET}]{5}$`
)

describe('#generateRecoveryCodeSet', () => {
  it('returns a full set of distinct, grouped codes with matching bcrypt hashes', async () => {
    const { codes, hashes } = await generateRecoveryCodeSet()

    expect(codes).toHaveLength(RECOVERY_CODE_COUNT)
    expect(new Set(codes).size).toBe(RECOVERY_CODE_COUNT)
    codes.forEach((code) => expect(code).toMatch(codePattern))
    // hashed without the dash, so entry formatting doesn't matter
    expect(
      await bcrypt.compare(codes[0].replace('-', ''), hashes[0])
    ).toBe(true)
  })
})

describe('#findMatchingRecoveryCode', () => {
  const stored = [
    { id: 'a', code_hash: bcrypt.hashSync('AAAAABBBBB', 4) },
    { id: 'b', code_hash: bcrypt.hashSync('CCCCCDDDDD', 4) }
  ]

  it('returns the id of the matching code, ignoring case and dashes', async () => {
    expect(
      await findMatchingRecoveryCode('ccccc-ddddd', stored)
    ).toBe('b')
    expect(
      await findMatchingRecoveryCode(' AAAAA BBBBB ', stored)
    ).toBe('a')
  })

  it('returns null for a code that matches nothing', async () => {
    expect(
      await findMatchingRecoveryCode('EEEEE-FFFFF', stored)
    ).toBeNull()
  })

  it('pads to a full set, so an account with no codes costs the same', async () => {
    const compare = jest.spyOn(bcrypt, 'compare')

    expect(
      await findMatchingRecoveryCode('AAAAA-BBBBB', [])
    ).toBeNull()
    expect(compare).toHaveBeenCalledTimes(RECOVERY_CODE_COUNT)

    compare.mockRestore()
  })
})
