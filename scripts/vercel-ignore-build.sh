#!/bin/sh
# Vercel's Ignored Build Step: exit 0 skips the build, 1 builds.
# - On the source repo, production builds only release commits, so the
#   running app always reports its own version. This is checked first:
#   none of the build-anyway cases below may let another commit into
#   production. Forks build every push.
# - Otherwise anything uncertain builds, and a push skips when every
#   change since the last successful deploy of this branch is Markdown.

prev="$VERCEL_GIT_PREVIOUS_SHA"
head="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

if [ "$VERCEL_ENV" = "production" ] &&
  [ "$VERCEL_GIT_REPO_OWNER" = "eessex" ]; then
  # A release commit is the release workflow's own: authored and
  # committed by its bot (GitHub commits merged PRs itself, so a PR
  # titled `chore(release): …` doesn't match). Keep in step with
  # `isReleaseCommit` in src/lib/app-version/version.ts.
  bot='41898282+github-actions[bot]@users.noreply.github.com'
  if git log -1 --format='%ae%x09%ce%x09%s' "$head" 2>/dev/null |
    awk -F '\t' -v bot="$bot" '
      $1 == bot && $2 == bot &&
        $3 ~ /^chore\(release\): v[0-9]+\.[0-9]+\.[0-9]+$/ { found = 1 }
      END { exit !found }'; then
    exit 1
  fi
  echo "Not a release commit, skipping production build"
  exit 0
fi

# First deploy of a branch: HEAD^ would miss its earlier commits, and
# setup needs its migrations
[ -z "$prev" ] && exit 1

# Redeploys (e.g. after an env var change) must run migrations
[ "$prev" = "$head" ] && exit 1

# Shallow clone or force-push can leave the previous commit missing
git cat-file -e "$prev^{commit}" 2>/dev/null || exit 1

if git diff --quiet "$prev" "$head" -- . ':(exclude,glob)**/*.md'; then
  echo "Only Markdown changed since $prev, skipping build"
  exit 0
fi

exit 1
