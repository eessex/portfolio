/**
 * Applies pending database migrations, then the every-deploy steps.
 *
 *   pnpm migrate
 *
 * Runs on production builds and locally against whatever .env points at.
 * Preview builds skip unless MIGRATE_PREVIEWS=1 and their database
 * host differs from PRODUCTION_DATABASE_HOST.
 */
import { migrateDatabase } from './migrate/migrate-database'

async function main(): Promise<number> {
  const decision = await migrateDatabase(process.env)
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
