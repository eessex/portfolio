# Portfolio CMS

This project is a public portfolio website and CMS designed to archive and showcase creative projects by musicians, event organizers, and record labels. It is designed to be configurable with no code, and to operate for free or at very low cost.

My own creative projects were the testing ground for the site, which takes some inspiration from the old-school CMS [Indexhibit](https://github.com/Indexhibit/indexhibit) that first got me into making websites. The framework is intended to be flexible enough to work for a wide variety of artists, presenters and publishers. In the future I hope to extend it to work for visual artists, writers and filmmakers too.

**Looking to set up your own instance?** See [docs/SETUP.md](docs/SETUP.md) for a step-by-step guide.

## Examples

- [eveessex.com](https://eveessex.com)

Want to share your own site? [Open an issue](https://github.com/eessex/portfolio-cms/issues) and I'll add it here.

## What you can do with it

- **Show your projects, releases and events**. Each has its own page, and searchable indexes to list them all.
- **Add images, press links and an About page** that introduces you.
- **Embed your music and video** from Bandcamp, SoundCloud, YouTube etc. from pasted embed codes.
- **Keep a record over time**: past events, publications and editions, the venues you've played and the labels you've worked with.
- **Collect email sign-ups** from a form in the footer (optional).
- **Invite collaborators** as fellow editors with a link.
- **Use your own domain name**, or a free `your-site.vercel.app` address.

## Make your own site

You don't need to write code or use a terminal. Everything happens in your web browser, and it takes about 30 minutes:

1. Make free accounts on GitHub (where the code lives) and Vercel (which hosts your site).
2. Copy this project to your GitHub account with one click.
3. Connect it to Vercel and add a free database and image storage.
4. Open your new site, create your account and start adding your work.

[docs/SETUP.md](docs/SETUP.md) walks through each step. Once you're set up, [docs/USING.md](docs/USING.md) explains how to fill in and organize your site.

## What it costs

A typical portfolio fits inside the free plans of everything it uses:

- **Hosting** on [Vercel](https://vercel.com)'s free Hobby plan. Vercel limits Hobby to personal, non-commercial sites. If your site is for a business (a label selling records, say), check [Vercel's plans](https://vercel.com/docs/plans/hobby) to see whether you need a paid one or reach out to me about managed hosting.
- **Database** on [Neon](https://neon.tech)'s free plan.
- **Image storage** on Vercel Blob's free allowance. If your file storage exceeds the 1GB limit you will need to switch to a Vercel paid plan (~ $20 monthly) or reach out to me about managed hosting.
- **A custom domain** is optional, and is the one thing you'd likely pay for: usually around $10–20 a year from a domain registrar.

## Getting help

Stuck, found a bug, or have an idea? [Open an issue on GitHub](https://github.com/eessex/portfolio-cms/issues). You don't need to be technical. Describe what you were trying to do and what happened. If a deploy failed, include a public link to its build log, a screenshot, or the text of the error output.

## For developers

The site is built with Next.js (App Router), Postgres on Neon (hand-written SQL, no ORM), next-auth and Vercel Blob. The same app serves the public site and the editing interface.

- [CONTRIBUTING.md](CONTRIBUTING.md): running it locally, scripts, checks, code style and writing migrations
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code is organized and how the pieces fit together
- [docs/CONFIGURATION.md](docs/CONFIGURATION.md): every environment variable

Contributions are welcome. If you're planning something big, open an issue first so we can talk it through.

## License

This project uses the [Functional Source License](LICENSE) (FSL-1.1-ALv2). In plain terms:

- **You can** run your own site with it, change the code, and use it to learn or teach. All free.
- **Freelancers can** charge clients to set up, design or customize a site that the client runs on their own account.
- **You can't** offer it to others as a commercial product or service that competes, such as paid managed hosting. My own hosting service helps sustain this project.
- **Two years after each release**, that version also becomes available under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), a standard open-source license, so anyone can use it for anything, including hosting.

Not sure whether what you have in mind is allowed? [Open an issue](https://github.com/eessex/portfolio-cms/issues) and ask.
