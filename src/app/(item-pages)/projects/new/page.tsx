import type { Metadata } from 'next'

import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'New Project'
export const metadata: Metadata = { title }

export default function NewProjectPage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditProjectForm />
    </article>
  )
}
