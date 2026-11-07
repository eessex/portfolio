# Using your site

Once your site is set up (see [SETUP.md](SETUP.md)), everything is edited
in the browser. Sign in at `/login` on your site, for example
`https://your-site.vercel.app/login`.

## Two kinds of content

**Pages: projects, releases and events.** Each gets its own page, and each
type has an index that lists them all:

| Type     | Index       | A single item         |
| -------- | ----------- | --------------------- |
| Projects | `/projects` | `/projects/my-band`   |
| Releases | `/releases` | `/releases/first-ep`  |
| Events   | `/events`   | `/events/spring-show` |

While you're signed in, you can add a new one at `/projects/new` (or
`/releases/new`, `/events/new`), and edit any page from its edit link
(`/releases/first-ep/edit`). Anything you haven't ticked **Published** on
is visible only to signed-in editors, so you can work on drafts.

**Pieces you reuse: images, links, embeds, venues and publishers.** These
don't have pages of their own. You attach them to pages, and the same
venue or image etc. can appear on as many pages as you like. You can create
and edit them right inside the page you're editing, or manage them all
from your dashboard (`/dashboard`).

## How it fits together

- **Your About page** (`/about`) is your default or primary project: your solo
  project (or your band, series or label). The name should be the same as your
  domain name. It's edited at `/about/edit`, shows a carousel of your other projects.
  Your default project can't be deleted.
- **Every release belongs to a project**, and an event can too. If you
  delete a project, its releases and events move to your default/About project
  so nothing is lost.
- **A release can have several editions** (for example a cassette in 2019
  and a vinyl reissue in 2023), each with its own format, publisher and
  date. You edit them inside the release. The release's date is its
  earliest edition.
- **Embeds** (SoundCloud, Mixcloud, YouTube and so on): paste the embed
  code, and the site fetches its title and a cover image for you.

## Site settings

Your dashboard (`/dashboard`) holds the settings for the whole site:

- Site title and description
- Cover image
- Site favicon: the little image in browser tabs and on phone home
  screens. Upload one square image at least 600 × 600 pixels.
- Social links in the footer
- Whether the footer shows an email sign-up form

## Images

Uploads can be JPEG, PNG, WebP or GIF, at least 600 pixels on the short
side and up to 4 MB each. The site makes smaller, faster versions for you.

## Other editors

Dashboard → **Users** → **Create invite link**, and send the link to the
person you're inviting. Having a second editor is also the easiest way
back in if you ever get locked out (see
[If something goes wrong](SETUP.md#if-something-goes-wrong)).
