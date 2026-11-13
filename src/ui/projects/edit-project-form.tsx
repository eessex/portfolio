'use client'

import { useId, useState } from 'react'

import {
  deleteProject,
  editDefaultProject,
  editProject
} from '@/lib/projects/actions'
import {
  type ProjectType,
  ProjectTypes,
  projectTypes,
  projectTypeSchema
} from '@/lib/projects/schemas'
import type { ProjectClient } from '@/lib/projects/types'
import { ABOUT_PATH, PagePaths } from '@/lib/schemas'
import {
  MAX_STRING_LENGTH_LONG,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { Checkbox } from '@/ui/form/checkbox'
import { FieldErrorList } from '@/ui/form/field-error-list'
import { useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { InputLabel } from '@/ui/form/input-label'
import { ItemEditForm } from '@/ui/form/item-edit-form'
import { Select } from '@/ui/form/select'
import { toDateInputValue } from '@/ui/format/dates'
import { ImagesPicker } from '@/ui/images/images-picker'
import {
  LinksPicker,
  PressLinksPicker
} from '@/ui/links/links-picker'
import { ContactInfoFields } from '@/ui/projects/contact-info-fields'
import formStyles from '@/ui/projects/edit-project-form.module.scss'
import { PublisherPicker } from '@/ui/publishers/publisher-picker'

const DATES_DESCRIPTION =
  'Project dates are used for sorting and to distinguish active and inactive projects.'

function ProjectFormFields({
  project,
  isDefaultProject
}: {
  project?: ProjectClient
  /** Notes that the default project's dates aren't shown on `/about`. */
  isDefaultProject?: boolean
}) {
  const errors = useFormErrors()
  const [type, setType] = useState<ProjectType | undefined>(
    project?.type
  )
  const datesDescriptionId = useId()
  const datesDescription = isDefaultProject
    ? `${DATES_DESCRIPTION} These dates are not displayed to visitors.`
    : DATES_DESCRIPTION

  return (
    <>
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
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
        label='Project type'
        placeholder='Select a type'
        value={project?.type}
        onChange={(value) => {
          const parsed = projectTypeSchema.safeParse(value)
          setType(parsed.success ? parsed.data : undefined)
        }}
        attributes={{ name: 'type', required: true }}
      />
      {type === ProjectTypes.recordLabel && (
        <div>
          <PublisherPicker
            label='Publisher'
            description='The publisher this label releases as.'
            publisher={project?.publisher}
          />
          <FieldErrorList errors={errors?.publisherId} />
        </div>
      )}
      <fieldset
        aria-describedby={datesDescriptionId}
        className={formStyles['dates']}
      >
        <InputLabel
          as='legend'
          label='Active dates'
          isRequired
          description={datesDescription}
          descriptionId={datesDescriptionId}
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
      </fieldset>
      <Input
        as='textarea'
        attributes={{
          maxLength: MAX_STRING_LENGTH_LONG,
          name: 'description',
          required: true
        }}
        defaultValue={project?.description}
        errors={errors?.description}
        label='Description'
      />
      <ImagesPicker
        coverImage={project?.coverImage}
        images={project?.images}
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
  isDefaultProject = false,
  nextHref
}: {
  project?: ProjectClient
  /**
   * The default project, edited from `/about/edit`: saves through
   * `editDefaultProject` (which creates it when `project` is absent),
   * returns to `/about`, and can't be deleted.
   */
  isDefaultProject?: boolean
  /**
   * Where a save goes instead of the saved item's page (first-run
   * setup's next step).
   */
  nextHref?: string
}) {
  const save = isDefaultProject ? editDefaultProject : editProject
  const isDeletable =
    project && !isDefaultProject && !project.isDefaultProject

  return (
    <ItemEditForm
      path={PagePaths.projects}
      action={(formData) => save(formData, project?.id)}
      savedHref={savedHref(isDefaultProject, nextHref)}
      deleteItem={
        isDeletable ? () => deleteProject(project) : undefined
      }
    >
      <ProjectFormFields
        project={project}
        isDefaultProject={isDefaultProject}
      />
    </ItemEditForm>
  )
}

function savedHref(isDefaultProject: boolean, nextHref?: string) {
  if (nextHref) return () => nextHref
  if (isDefaultProject) return () => `/${ABOUT_PATH}`
}
