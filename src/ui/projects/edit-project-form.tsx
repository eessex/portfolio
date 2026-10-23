'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  deleteProject,
  editDefaultProject,
  editProject
} from '@/lib/projects/actions'
import { projectTypes } from '@/lib/projects/schemas'
import type { ProjectClient } from '@/lib/projects/types'
import {
  ABOUT_PATH,
  PagePaths,
  pagePathSingulars
} from '@/lib/schemas'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { Checkbox } from '@/ui/form/checkbox'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { ImagesPicker } from '@/ui/images/images-picker'
import { DeleteItemButton } from '@/ui/items/delete-item-button'
import {
  LinksPicker,
  PressLinksPicker
} from '@/ui/links/links-picker'
import { ContactInfoFields } from '@/ui/projects/contact-info-fields'
import { toDateInputValue } from '@/ui/util'

function ProjectFormFields({ project }: { project?: ProjectClient }) {
  const errors = useFormErrors()
  const [isPublished, setIsPublished] = useState(
    !!project?.isPublished
  )

  return (
    <>
      <Input
        attributes={{
          maxLength: 255,
          name: 'title',
          required: true
        }}
        defaultValue={project?.title}
        errors={errors?.title}
        label='Title'
      />
      <Select
        options={[...projectTypes]}
        errors={errors?.type}
        label='Type'
        placeholder='Select a type'
        value={project?.type}
        attributes={{ name: 'type', required: true }}
      />
      <div className={styles['input-group']}>
        <Input
          attributes={{
            name: 'startDate',
            type: 'date',
            required: true
          }}
          defaultValue={toDateInputValue(project?.startDate)}
          errors={errors?.startDate}
          label='Start date'
        />
        <Input
          attributes={{ name: 'endDate', type: 'date' }}
          defaultValue={toDateInputValue(project?.endDate)}
          errors={errors?.endDate}
          label='End date'
        />
      </div>
      <ImagesPicker
        coverImage={project?.coverImage}
        images={project?.images}
      />
      <Input
        as='textarea'
        attributes={{
          maxLength: 5000,
          name: 'description',
          required: true
        }}
        defaultValue={project?.description}
        errors={errors?.description}
        label='Description'
      />
      <EmbedCodesPicker embedCodes={project?.embedCodes} />
      <ContactInfoFields contactInfo={project?.contactInfo} />
      <PressLinksPicker links={project?.links} />
      <LinksPicker links={project?.links} />
      <Checkbox
        attributes={{ name: 'isPublished' }}
        isChecked={isPublished}
        label='Published'
        onChange={() => setIsPublished(!isPublished)}
      />
    </>
  )
}

export function EditProjectForm({
  project,
  isDefaultProject = false
}: {
  project?: ProjectClient
  /**
   * The default project, edited from `/about/edit`: saves through
   * `editDefaultProject` (which creates it when `project` is absent),
   * returns to `/about`, and can't be deleted.
   */
  isDefaultProject?: boolean
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const save = isDefaultProject ? editDefaultProject : editProject
    const res = await save(formData, project?.id)
    if (res?.ok && res.res) {
      router.push(
        isDefaultProject
          ? `/${ABOUT_PATH}`
          : `/${PagePaths.projects}/${res.res.slug}`
      )
    }
    return res
  }

  return (
    <>
      <Form
        action={handleSubmit}
        submitButtonClassName='button-lg button-primary'
      >
        <ProjectFormFields project={project} />
      </Form>

      {project && !isDefaultProject && !project.isDefaultProject && (
        <div className={styles['delete-button-container']}>
          <DeleteItemButton
            deleteItem={() => deleteProject(project)}
            itemLabel={pagePathSingulars[PagePaths.projects]}
            redirectTo={`/${PagePaths.projects}`}
          />
        </div>
      )}
    </>
  )
}
