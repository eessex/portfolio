'use client'

import {
  deleteProject,
  editDefaultProject,
  editProject
} from '@/lib/projects/actions'
import { projectTypes } from '@/lib/projects/schemas'
import type { ProjectClient } from '@/lib/projects/types'
import { ABOUT_PATH, PagePaths } from '@/lib/schemas'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { Checkbox } from '@/ui/form/checkbox'
import { useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { ItemEditForm } from '@/ui/form/item-edit-form'
import { Select } from '@/ui/form/select'
import { ImagesPicker } from '@/ui/images/images-picker'
import {
  LinksPicker,
  PressLinksPicker
} from '@/ui/links/links-picker'
import { ContactInfoFields } from '@/ui/projects/contact-info-fields'
import { toDateInputValue } from '@/ui/util'

function ProjectFormFields({ project }: { project?: ProjectClient }) {
  const errors = useFormErrors()

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
        isDefaultChecked={!!project?.isPublished}
        label='Published'
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
  const save = isDefaultProject ? editDefaultProject : editProject
  const isDeletable =
    project && !isDefaultProject && !project.isDefaultProject

  return (
    <ItemEditForm
      path={PagePaths.projects}
      action={(formData) => save(formData, project?.id)}
      savedHref={
        isDefaultProject ? () => `/${ABOUT_PATH}` : undefined
      }
      deleteItem={
        isDeletable ? () => deleteProject(project) : undefined
      }
    >
      <ProjectFormFields project={project} />
    </ItemEditForm>
  )
}
