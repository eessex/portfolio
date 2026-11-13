# Deploying your own copy

A step-by-step guide to running your own portfolio site, hosted free on
Vercel. No coding, and nothing to type into a terminal.

**Estimated time:** 30 minutes.

## 1. Make a GitHub account

At [github.com](https://github.com), if you don't have one already. Use an
email you'll keep for years — it's how you'll get updates to your site.
Save your password in a password manager.

## 2. Fork the project

Open the project's GitHub page,
[eessex/portfolio](https://github.com/eessex/portfolio), and click
**Fork**. You can rename your copy (e.g. `jane-doe-site`) — this is your own
copy of the code, separate from the original.

## 3. Make a Vercel account

At [vercel.com](https://vercel.com), choosing "Continue with GitHub" so it's
linked to the same account from step 1.

## 4. Import your fork

In Vercel: **Add New → Project**, then pick your fork. There's nothing to
fill in — leave every field as it is.

Click **Deploy**. The first build will stop with "Database not connected."
That's expected — there's no database yet.

## 5. Add storage

In your Vercel project, open **Storage**, then:

- Add **Neon** and choose the **Free** plan
- Add a **Blob** store

Connect both to your project, then go to **Deployments** and click
**Redeploy**. This build creates your database tables.

## 6. Claim your site

In Vercel, open **Deployments → the latest deployment → Build Logs**, and
scroll to find a setup code near the end — it looks like this:

```
==================================================
  Setup code: K7QM-3XRD-PW9T-H2FC
  Open your site and enter it to create your account.
  Expires in 72 hours. Redeploy after that for a new one.
==================================================
```

Copy the code, then open your site (its URL is at the top of the Vercel
project page). It'll send you straight to a setup page. Enter the code,
then your name, email and a password, and submit.

Next you'll see 8 **recovery codes**. Save them, along with your password,
somewhere safe — a password manager, ideally. If you ever forget your
password, the login page's "Forgot password?" link trades one code for a new
password. Each code works once, and they're only shown this one time; you can
generate a fresh set any time from your Account page (`/account`).

**Don't see a code?** If you redeployed before claiming your site, the
latest build log shows this line instead:

```
  A setup code from an earlier build is still valid until 2026-11-02T12:00:00.000Z; find it in that build's log.
```

The code is only printed once, by the build that created it, so a redeploy
doesn't replace one you've already copied. Go back to **Deployments**, open
each older deployment in turn (newest first), and check its **Build Logs**
for the banner above. It's the oldest deployment created within 72 hours
before that "valid until" time.

If the code has expired (after 72 hours), click **Redeploy** on your latest
deployment to get a new one.

## 7. Fill in your site

You'll land on your dashboard, which asks for your site title and
description, plus optional social links. Fill those in and save.

Then create your About page, which visitors reach by clicking your site's
description. Go to `/about/edit` on your site (for example
`https://your-site.vercel.app/about/edit`), fill in the project that
represents you, tick **Published**, and save. Until you do, `/about` shows
a "not found" page.

For how projects, releases, events and the rest fit together, see
[Using your site](USING.md).

**See your visitors (optional):** Vercel → your project → **Analytics** →
**Enable**. Free up to 50,000 page views a month; it just stops counting
past that, it won't charge you.

## 8. Add your domain (optional)

Vercel → your project → **Settings → Domains**, then follow the instructions
it gives you at your domain registrar.

## 9. Get updates

The project keeps improving after you've deployed it. To pull in updates:
on your fork's GitHub page, click **Watch → Custom → Releases** to hear
about new ones. When one comes out, click **Sync fork** on your fork's
GitHub page — Vercel deploys it automatically.

---

## If something goes wrong

- **A build failed.** Open the failed deployment in Vercel and copy its
  Build Logs link into a new
  [GitHub issue](https://github.com/eessex/portfolio/issues) — that log
  has what's needed to figure out what happened.
- **You forgot your password.** On the login page, click "Forgot
  password?" and enter your email, one of your recovery codes and a new
  password. If you've lost your codes too, ask another admin to open
  Dashboard → Users and send you a reset link. With no other admin,
  you can make that link yourself from a computer (see "Resetting a
  password from your computer" below), or open a
  [GitHub issue](https://github.com/eessex/portfolio/issues) and
  we'll help you get back in. Adding a second admin (Dashboard → Users
  → Create invite link) is the simplest safety net.
- **Images aren't uploading.** Double check Storage → your Blob store is
  still connected (Settings → Environment Variables should show
  `BLOB_READ_WRITE_TOKEN`), then redeploy.

### Resetting a password from your computer

The last resort, for when you've lost your password and your recovery
codes and there's no other admin. It needs [Node.js 22](https://nodejs.org)
and a copy of your fork on your computer.

1. In Vercel, open your project → **Settings → Environment Variables**
   and copy the value of `DATABASE_URL`. Treat it like a password.
2. In a terminal, download your fork and install its tools (replace
   `YOUR-NAME` with your GitHub username):

   ```
   git clone https://github.com/YOUR-NAME/portfolio.git
   cd portfolio
   npm install -g pnpm
   pnpm install
   ```

3. Run this, with your database URL, your account's email and your
   site's address:

   ```
   DATABASE_URL='paste-it-here' pnpm run reset-password you@example.com --url https://your-site.com
   ```

4. It prints a one-time link. Open it, choose a new password, and
   you're signed in. The link works once, within 72 hours.
5. Your old recovery codes still work, but if you lost them, generate
   a new set from your dashboard and save them.
