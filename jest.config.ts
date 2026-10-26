// /**
//  * For a detailed explanation regarding each configuration property, visit:
//  * https://jestjs.io/docs/configuration
//  */
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

// Match CI/Vercel (UTC) so timezone-dependent date bugs fail locally
// too. Set here, before workers spawn, so every worker inherits it.
process.env.TZ = 'UTC'

// Fixed storage env, so image URLs don't depend on a local .env (CI
// has none). Set before next/jest loads .env, which won't override
// a set variable, so blank rather than delete the rest.
process.env.STORAGE_PROVIDER = 's3'
process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
process.env.AWS_S3_REGION = 'us-east-1'
process.env.REMOTE_IMAGE_HOSTNAME = ''
process.env.BLOB_STORE_ID = ''
process.env.BLOB_READ_WRITE_TOKEN = ''

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
  // Claude Code worktrees: other checkouts with their own tests and mocks
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/']
}

export default createJestConfig(config)
