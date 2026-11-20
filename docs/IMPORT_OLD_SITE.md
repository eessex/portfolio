# Moving content from the old site

This is only for a site that ran on the old MongoDB version of this
project. The import copies that site's projects, releases, events,
venues, links, embeds, images and site settings into your new site.
It never deletes or changes what's already there, and you can safely
run it again.

There are two parts:

- **Exporting** is done by whoever has access to the old MongoDB
  database (usually the maintainer). They send you a folder.
- **Importing** is done on your computer once your new site is set
  up. It takes about 15 minutes, most of it waiting for images.

If you can't run terminal commands, the maintainer can do both parts
for you with two values from your Vercel project: see
[If the maintainer runs it for you](#if-the-maintainer-runs-it-for-you).

## Part 1: export the old site (maintainer)

You need the [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/)
(`brew install mongodb/brew/mongodb-database-tools` on a Mac) and
the old database's connection string, including its database name.
In a checkout of this repo, with `pnpm install` done:

```
MONGODB_URI='mongodb+srv://user:password@host/dbname' pnpm run export-old-site
```

Add `--db <name>` if the connection string has no database name, and
`--out <dir>` to write somewhere other than `mongo-export/`. The
script exports each collection, checks that every file can be read,
and tries a few image URLs, since the import downloads every image
from the old storage. It only reads from MongoDB.

The folder holds all of the site's content, so send it privately
(e.g. a shared Drive folder, not a public link) and never commit it.
`mongo-export/` is git-ignored.

## Part 2: import into your new site (site owner)

### Before you start

- Your new site is set up and you've claimed it at `/setup`
  ([SETUP.md](SETUP.md), steps 1–6). Don't add content by hand yet:
  the import skips any old item whose address (slug) is already taken.
- You have the export folder from Part 1.
- Your computer has [Node.js 22](https://nodejs.org) installed.

### Steps

1. **Download your fork and install its tools.** In a terminal
   (replace `YOUR-NAME` with your GitHub username):

   ```
   git clone https://github.com/YOUR-NAME/portfolio-cms.git
   cd portfolio-cms
   npm install -g pnpm
   pnpm install
   ```

2. **Put the export folder inside it,** named `mongo-export`, so the
   path is `portfolio-cms/mongo-export/events.json` and so on.
3. **Give the import your site's keys.** In Vercel, open your project
   → **Settings → Environment Variables** and copy the values of
   `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`. In the `portfolio-cms`
   folder, create a file named `.env` containing:

   ```
   DATABASE_URL='paste-it-here'
   BLOB_READ_WRITE_TOKEN='paste-it-here'
   ```

   Treat both like passwords. `.env` is git-ignored, and you'll
   delete it at the end.

4. **Run the import:**

   ```
   pnpm run import-old-site --input mongo-export
   ```

   It checks your setup, then does a dry run that writes nothing and
   prints a report of what it would import. Read the report: items
   under **Failed** or **Skipped** will be left out. If anything looks
   wrong, answer `n` and send the report (saved in
   `mongo-export/reports/`) to the maintainer. Otherwise answer `y`.

5. **Redeploy.** In Vercel, open **Deployments**, then click **⋯ →
   Redeploy** on the latest one, so the site shows the new content.
   Then open your site and check a few pages.
6. **Clean up.** Delete the `.env` file. Keep the export folder
   somewhere private as a backup, or delete it.

### If something goes wrong

| Message                                    | What to do                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL isn't set`                   | The `.env` file is missing or not in the `portfolio-cms` folder (step 3).                                          |
| `Image storage isn't set up`               | `BLOB_READ_WRITE_TOKEN` is missing from `.env`, or no Blob store is connected in Vercel.                           |
| `The database has no tables yet`           | Connect Neon in Vercel and redeploy once (SETUP.md, step 5).                                                       |
| `Nobody has claimed this site yet`         | Finish `/setup` first (SETUP.md, step 6).                                                                          |
| `has none of the export files`             | `--input` points at the wrong folder; it should hold `events.json`, `projects.json` and so on.                     |
| Some items failed, or images didn't import | Run the same command again: it retries only what's missing. If they still fail, send the report to the maintainer. |

## If the maintainer runs it for you

For a site owner who can't run terminal commands, the maintainer
runs both parts. Only two values leave the owner's Vercel project.
Images need no separate export: the import downloads each one from
its old URL and uploads it to the new site's Blob store.

1. **Export from MongoDB (maintainer).** Write the export outside the
   repo, so it can never be committed:

   ```
   MONGODB_URI='mongodb+srv://user:pass@host/dbname' pnpm run export-old-site --out ~/their-site-export
   ```

   If it warns that images couldn't be downloaded, the old bucket
   isn't public. Fix that before importing, or those images are
   skipped.

2. **Claim the site and share two values (site owner).** Finish
   `/setup` ([SETUP.md](SETUP.md), step 6). Then, in Vercel, open the
   project → **Settings → Environment Variables** and send the
   maintainer `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` through an
   expiring password-manager share (such as a 1Password share link or
   Bitwarden Send), never email or chat.

3. **Import from a separate checkout (maintainer).** Use a worktree
   with its own `.env`, so your own site's `.env` is never involved.
   Create it from a branch that has these scripts (`main` once they
   are merged):

   ```
   git worktree add ~/their-site-import main
   cd ~/their-site-import && pnpm install
   ```

   Put the owner's two values in `~/their-site-import/.env`, then run:

   ```
   pnpm run import-old-site --input ~/their-site-export
   ```

   Before answering `y`, check that the database host it prints is
   the owner's, not yours, and read the dry-run report.

4. **Clean up.** Remove the worktree, which also deletes the owner's
   `.env`:

   ```
   cd ~ && git -C <path to your portfolio-cms checkout> worktree remove --force ~/their-site-import
   ```

   The owner then clicks **Redeploy** in Vercel (step 5 above) and
   checks their site. Delete `~/their-site-export` once they have.

5. **Change the secrets (optional for a test site).** If the site
   becomes the owner's real one, reset the database password in Neon.
