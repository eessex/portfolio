import Markdown from 'react-markdown'

import { fetchVersionStatus } from '@/lib/app-version/latest-release'

export async function VersionNotice() {
  const { current, latest, url, actionNeeded, isUpdateAvailable } =
    await fetchVersionStatus()

  return (
    <section aria-labelledby='version-heading'>
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
      {actionNeeded && (
        <>
          <h3>Action needed</h3>
          {/* Release notes are Markdown; raw HTML in them is escaped,
              not rendered, and unsafe URLs are dropped */}
          <Markdown
            components={{
              a: ({ node: _node, ...props }) => (
                <a {...props} rel='noopener noreferrer' />
              )
            }}
          >
            {actionNeeded}
          </Markdown>
        </>
      )}
    </section>
  )
}
