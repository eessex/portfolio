import Markdown, { type Components } from 'react-markdown'

import { fetchVersionStatus } from '@/lib/app-version/latest-release'
import styles from '@/ui/settings/version-notice.module.scss'

type HeadingTag = 'h4' | 'h5' | 'h6'

// The notes sit under the "Action needed" h3, so their own headings
// render below it (h4 and deeper, whatever level they were written at)
const nestedHeading = (level: number): Components['h1'] => {
  const Tag = `h${Math.min(Math.max(level + 1, 4), 6)}` as HeadingTag
  const NestedHeading: Components['h1'] = ({
    node: _node,
    ...props
  }) => <Tag {...props} />
  return NestedHeading
}

const notesComponents: Components = {
  // A new tab, so following a link doesn't drop unsaved settings edits
  a: ({ node: _node, ...props }) => (
    <a {...props} target='_blank' rel='noopener noreferrer' />
  ),
  h1: nestedHeading(1),
  h2: nestedHeading(2),
  h3: nestedHeading(3),
  h4: nestedHeading(4),
  h5: nestedHeading(5),
  h6: nestedHeading(6)
}

export async function VersionNotice() {
  const {
    current,
    latest,
    url,
    actionNeeded,
    isUpdateAvailable,
    isHistoryTruncated
  } = await fetchVersionStatus()

  return (
    <section
      aria-labelledby='version-heading'
      className={styles['version-notice']}
    >
      <h2 id='version-heading'>Version</h2>
      <p>
        Running v{current}.{' '}
        {isUpdateAvailable && latest && url ? (
          <>
            <a href={url}>v{latest} is available.</a> Update by
            syncing your fork on GitHub.
          </>
        ) : latest ? (
          'Up to date.'
        ) : (
          'Couldn’t check for updates.'
        )}
      </p>
      {isHistoryTruncated && (
        <p>
          You’re many releases behind, so notes for the oldest ones
          may be missing. Check the release history on GitHub.
        </p>
      )}
      {actionNeeded && (
        <>
          <h3>Action needed</h3>
          {/* Release notes are Markdown; raw HTML in them is escaped,
              not rendered, and unsafe URLs are dropped */}
          <Markdown components={notesComponents}>
            {actionNeeded}
          </Markdown>
        </>
      )}
    </section>
  )
}
