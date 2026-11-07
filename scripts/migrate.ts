/**
 * Applies pending database migrations, then the every-deploy steps.
 *
 *   pnpm migrate [--new-setup-code]
 *
 * Runs on production builds and locally against whatever .env points at.
 * Preview builds skip unless MIGRATE_PREVIEWS=1 and their database
 * host differs from PRODUCTION_DATABASE_HOST.
 *
 * --new-setup-code replaces a still-live setup code instead of keeping
 * it: only its hash is stored, so a lost code can't be reprinted.
 */
import { migrateDatabase } from './migrate/migrate-database'

async function main(): Promise<number> {
  const decision = await migrateDatabase(process.env, {
    isSetupCodeRotated: process.argv.includes('--new-setup-code')
  })
  if (decision.isRun) return 0
  if (decision.isError) {
    console.error(`❌ ${decision.message}`)
    return 1
  }
  console.warn(`⚠️  ${decision.message}`)
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error(
      `❌ ${error instanceof Error ? error.message : String(error)}`
    )
    process.exit(1)
  })
