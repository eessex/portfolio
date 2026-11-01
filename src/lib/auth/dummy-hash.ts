/**
 * A real bcrypt hash (cost 10, same as user hashes) of a random
 * value nothing can match. Compared against when there's no real hash
 * so unknown and known accounts take the same time to reject —
 * otherwise response timing reveals which emails have accounts.
 */
export const DUMMY_PASSWORD_HASH =
  '$2b$10$jbuOzkjIvg398zktHoqbcuNDcVdJhtMq2ZgWpRlLZ0Gldto8CSdQa'
