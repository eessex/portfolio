import { headers } from 'next/headers'

import { sql } from '@/lib/db'

/**
 * Postgres-backed rate limiting — the serverless runtime has no
 * shared memory, so counters must live in the database.
 */

/** `code` carried by the CredentialsSignin thrown when throttled. */
export const LOGIN_THROTTLED_CODE = 'login-throttled'

const MAX_BACKOFF_SECONDS = 15 * 60
/** Failures allowed before backoff kicks in — typos are free. */
const FREE_FAILED_LOGINS = 3

/**
 * Registers a login attempt for `email` and returns how many seconds
 * the caller must still wait (0 = attempt permitted).
 *
 * One row per email. The first FREE_FAILED_LOGINS failures carry no
 * wait; each further failure doubles the backoff (2s, 4s, …) up to
 * MAX_BACKOFF_SECONDS, so a user who fat-fingers a password is never
 * throttled while a brute-force run gets ~1 guess per window. The
 * attempt is provisionally recorded as a failure in the same
 * statement that checks the backoff — so concurrent requests cannot
 * slip through between check and record — and the caller clears the
 * row via clearFailedLogins() once the credentials prove valid.
 * Attempts made while throttled are rejected without being recorded,
 * so a stranger spamming a known email cannot extend the owner's
 * lockout past MAX_BACKOFF_SECONDS (which is also why this is
 * exponential backoff rather than a hard lockout).
 */
export async function registerLoginAttempt(
  email: string
): Promise<number> {
  const normalizedEmail = email.toLowerCase()
  try {
    // The stale CTE opportunistically drops long-idle rows so the
    // table stays bounded even when failures come from many fake
    // emails; it skips the current email so the upsert never touches
    // a row deleted in the same statement. The POWER exponent is
    // clamped because float8 overflow would otherwise error after
    // ~1000 sustained failures.
    const rows = await sql`
      WITH stale AS (
        DELETE FROM login_attempts
        WHERE last_failed_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
          AND email <> ${normalizedEmail}
      ), throttled AS (
        SELECT CEIL(GREATEST(0, EXTRACT(EPOCH FROM (
          last_failed_at
          + make_interval(secs => LEAST(
              POWER(2, LEAST(failed_count - ${FREE_FAILED_LOGINS - 1}, 16)),
              ${MAX_BACKOFF_SECONDS}
            ))
          - CURRENT_TIMESTAMP
        ))))::int AS wait
        FROM login_attempts
        WHERE email = ${normalizedEmail}
          AND failed_count >= ${FREE_FAILED_LOGINS}
      ), recorded AS (
        INSERT INTO login_attempts (email)
        SELECT ${normalizedEmail}
        WHERE COALESCE((SELECT wait FROM throttled), 0) = 0
        ON CONFLICT (email) DO UPDATE SET
          failed_count = login_attempts.failed_count + 1,
          last_failed_at = CURRENT_TIMESTAMP
      )
      SELECT COALESCE((SELECT wait FROM throttled), 0) AS wait
    `
    return rows[0]?.wait ?? 0
  } catch (cause) {
    throw new Error('Failed to register login attempt.', { cause })
  }
}

export async function clearFailedLogins(
  email: string
): Promise<void> {
  try {
    await sql`
      DELETE FROM login_attempts
      WHERE email = ${email.toLowerCase()}
    `
  } catch (cause) {
    throw new Error('Failed to clear login attempts.', { cause })
  }
}

/**
 * Sliding-window limiter for public endpoints where every attempt
 * "succeeds" (so failure-driven backoff doesn't apply). Counts events
 * per bucket in the trailing window; when under the limit the attempt
 * is recorded and allowed, otherwise rejected without recording.
 * Events are retained for 7 days, so windows must be shorter than
 * that.
 */
export async function checkWindowLimit(
  bucket: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const rows = await sql`
      WITH stale AS (
        DELETE FROM rate_limit_events
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
      ), recent AS (
        SELECT COUNT(*)::int AS count FROM rate_limit_events
        WHERE bucket = ${bucket}
          AND created_at > CURRENT_TIMESTAMP - make_interval(secs => ${windowSeconds})
      ), recorded AS (
        INSERT INTO rate_limit_events (bucket)
        SELECT ${bucket} WHERE (SELECT count FROM recent) < ${limit}
      )
      SELECT (SELECT count FROM recent) < ${limit} AS allowed
    `
    return rows[0]?.allowed === true
  } catch (cause) {
    throw new Error('Failed to check rate limit.', { cause })
  }
}

/**
 * Best-effort client IP for rate-limit buckets. Trusting the first
 * x-forwarded-for entry assumes the hosting platform overwrites the
 * header with the real client IP (Vercel does); behind a proxy that
 * merely appends, clients could spoof it and rotate buckets freely.
 * Shared NATs mean one IP can cover many users, so keep window
 * limits generous. Requests with no proxy headers (e.g. local dev)
 * all share the 'unknown' bucket.
 */
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return requestHeaders.get('x-real-ip') ?? 'unknown'
}
