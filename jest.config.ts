// /**
//  * For a detailed explanation regarding each configuration property, visit:
//  * https://jestjs.io/docs/configuration
//  */
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

// Match CI/Vercel (UTC) so timezone-dependent date bugs fail locally
// too. Set here, before workers spawn, so every worker inherits it.
process.env.TZ = 'UTC'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts']
}

export default createJestConfig(config)
