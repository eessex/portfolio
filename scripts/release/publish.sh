#!/bin/sh
# Finishes a release whose `chore(release): vX` commit is on main:
# tags it if no tag exists, then creates the GitHub Release if none
# exists. Safe to run again after any partial failure.
#
#   scripts/release/publish.sh <version> <commit>
#
# Needs a full clone with tags, the gh CLI, GH_TOKEN, GITHUB_REPOSITORY
# and RUNNER_TEMP (the workflow provides them).
set -eu

version="$1"
commit="$2"
tag="v$version"
notes_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"

if ! git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  git tag "$tag" "$commit"
fi
# A no-op when the remote already has the tag
git push origin "refs/tags/$tag"

if gh release view "$tag" >/dev/null 2>&1; then
  echo "$tag is already published"
  exit 0
fi

# The "Action needed" notes and previous tag for exactly this release
out="$notes_dir/notes-for-$tag"
: >"$out"
GITHUB_OUTPUT="$out" ACTION_NEEDED_FILE="$notes_dir/action-needed.md" \
  pnpm release --notes-for "$tag"
previous=$(sed -n 's/^previous_tag=//p' "$out")

gh api "repos/$GITHUB_REPOSITORY/releases/generate-notes" \
  -f tag_name="$tag" \
  -f target_commitish="$commit" \
  -f previous_tag_name="$previous" \
  --jq .body >"$notes_dir/notes.md"
cat "$notes_dir/action-needed.md" >>"$notes_dir/notes.md"
gh release create "$tag" --notes-file "$notes_dir/notes.md" \
  --verify-tag --title "$tag"
