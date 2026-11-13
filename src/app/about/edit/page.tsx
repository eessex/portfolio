import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

import styles from '@/app/about/edit/edit-about.module.scss'
import { fetchDefaultProject } from '@/lib/projects/data'
import { FormPageLayout } from '@/ui/form/form-page-layout'
import { Loading } from '@/ui/loading'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'Edit: About'
export const metadata: Metadata = { title }

export default function EditAboutPage() {
  return (
    <FormPageLayout title={title}>
      <Suspense fallback={<Loading />}>
        <EditDefaultProject />
      </Suspense>
    </FormPageLayout>
  )
}

/**
 * Edits the default project, or creates it when none exists yet (a
 * fresh instance, which `/settings` sends here after its first save),
 * then with an introduction. The route is admin-only (`auth.config.ts`), so the
 * authed fetch includes an unpublished default. Uncached: a stale form
 * would save stale child ids and detach anything added since.
 */
async function EditDefaultProject() {
  await connection()
  const project = await fetchDefaultProject(true)

  if (project) {
    return <EditProjectForm project={project} isDefaultProject />
  }

  return (
    <div>
      <section className={styles.intro} aria-labelledby='about-intro'>
        <h2 id='about-intro'>Next, set up your About page</h2>
        <p>
          Introduce yourself and your work to visitors. Add a type and
          whatever details you have now. You can come back and edit
          this page anytime.
        </p>
        <p>
          Content stays hidden from visitors until you publish it.
        </p>
      </section>
      <EditProjectForm isDefaultProject />
    </div>
  )
}
