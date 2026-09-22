'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  createEmbedCodeSchema,
  type EmbedCode
} from '@/lib/embed-codes/schemas/db'
import {
  type Image,
  imageClientFieldsSchema
} from '@/lib/images/schemas/db'
import { createLinkSchema, type Link } from '@/lib/links/schemas/db'
import { deleteProject, editProject } from '@/lib/projects/actions'
import { projectTypes } from '@/lib/projects/schemas'
import type { ProjectClient } from '@/lib/projects/types'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import {
  formatEmbedCodeResult,
  formatNewEmbedCodeSummary
} from '@/ui/embed-codes/format-embed-code-result'
import { Checkbox } from '@/ui/form/checkbox'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { EditImage } from '@/ui/images/edit-image-form'
import {
  formatImageResult,
  formatNewImageSummary
} from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { DeleteItemButton } from '@/ui/items/delete-item-button'
import { EditLink } from '@/ui/links/edit-link-form'
import { formatLinkResult } from '@/ui/links/format-link-result'
import { toDateInputValue } from '@/ui/util'

function ProjectFormFields({ project }: { project?: ProjectClient }) {
  const errors = useFormErrors()
  const images = [
    project?.coverImage,
    ...(project?.images ?? [])
  ].filter((image): image is Image => !!image)
  const embedCodes = [
    project?.featuredEmbedCode,
    ...(project?.embedCodes ?? [])
  ].filter((embedCode): embedCode is EmbedCode => !!embedCode)
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
        onChange={() => {}}
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
      <ItemPicker<Image>
        isMulti
        name='images'
        label='Images'
        itemType='images'
        existingItems={images}
        renderExistingResult={formatImageResult}
        renderNewItemSummary={formatNewImageSummary}
        schema={imageClientFieldsSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem
        }) => (
          <EditImage
            image={existingItem}
            errors={errors}
            isPressFieldsetHidden
            isRequired={isRequired}
          />
        )}
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
      <ItemPicker<EmbedCode>
        isMulti
        name='embedCodes'
        label='Embed codes'
        // description='A featured embed code is displayed below the page heading, above the cover image.'
        itemType='embedCodes'
        existingItems={embedCodes}
        renderExistingResult={formatEmbedCodeResult}
        renderNewItemSummary={formatNewEmbedCodeSummary}
        schema={createEmbedCodeSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem,
          onBusyChange
        }) => (
          <EditEmbedCode
            embedCode={existingItem}
            errors={errors}
            isRequired={isRequired}
            onBusyChange={onBusyChange}
          />
        )}
        featured={{
          isInitiallyFeatured: !!project?.featuredEmbedCode,
          label: 'Featured'
        }}
      />
      <ItemPicker<Link>
        isMulti
        name='links'
        label='Links'
        itemType='links'
        existingItems={project?.links ?? []}
        renderExistingResult={formatLinkResult}
        schema={createLinkSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem
        }) => (
          <EditLink
            link={existingItem}
            errors={errors}
            isRequired={isRequired}
          />
        )}
      />
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
  project
}: {
  project?: ProjectClient
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const res = await editProject(formData, project?.id)
    if (res?.ok && res.res) {
      router.push(`/projects/${res.res.slug}`)
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

      {project && (
        <div className={styles['delete-button-container']}>
          <DeleteItemButton
            deleteItem={() => deleteProject(project)}
            itemLabel='project'
            redirectTo='/projects'
          />
        </div>
      )}
    </>
  )
}
