#!/bin/sh
# Vercel's Ignored Build Step: exit 0 skips the build, 1 builds.
# Anything uncertain builds, then two skip rules:
# - On the source repo, production builds only release commits, so the
#   running app always reports its own version. Forks build every push.
# - Otherwise skips when every change since the last successful deploy
#   of this branch is Markdown.

prev="$VERCEL_GIT_PREVIOUS_SHA"
head="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# First deploy of a branch: HEAD^ would miss its earlier commits, and
# setup needs its migrations
[ -z "$prev" ] && exit 1

# Redeploys (e.g. after an env var change) must run migrations
[ "$prev" = "$head" ] && exit 1

# Shallow clone or force-push can leave the previous commit missing
git cat-file -e "$prev^{commit}" 2>/dev/null || exit 1

if [ "$VERCEL_ENV" = "production" ] &&
  [ "$VERCEL_GIT_REPO_OWNER" = "eessex" ]; then
  case "$VERCEL_GIT_COMMIT_MESSAGE" in
    "chore(release):"*) exit 1 ;;
    *)
      echo "Not a release commit, skipping production build"
      exit 0
      ;;
  esac
fi

if git diff --quiet "$prev" "$head" -- . ':(exclude,glob)**/*.md'; then
  echo "Only Markdown changed since $prev, skipping build"
  exit 0
fi

exit 1
