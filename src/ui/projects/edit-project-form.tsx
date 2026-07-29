'use client'

import { useRouter } from 'next/navigation'

import type { Image } from '@/lib/images/schemas/db'
import { deleteProject, editProject } from '@/lib/projects/actions'
import { projectTypes } from '@/lib/projects/schemas'
import type { ProjectClient } from '@/lib/projects/types'
import { Checkbox } from '@/ui/form/checkbox'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { formatImageResult } from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { DeleteItemButton } from '@/ui/items/delete-item-button'

function formattedDateInputValue(date?: Date) {
  return date ? new Date(date).toISOString().split('T')[0] : ''
}

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
          defaultValue={formattedDateInputValue(project?.startDate)}
          errors={errors?.startDate}
          label='Start date'
        />
        <Input
          attributes={{ name: 'endDate', type: 'date' }}
          defaultValue={formattedDateInputValue(project?.endDate)}
          errors={errors?.endDate}
          label='End date'
        />
      </div>
      <ItemPicker<Image>
        name='coverImageId'
        label='Cover image'
        itemType='images'
        existingItem={project?.coverImage}
        formatResult={formatImageResult}
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
      <Input
        as='textarea'
        attributes={{ maxLength: 255, name: 'shortDescription' }}
        defaultValue={project?.shortDescription}
        description='Used for SEO/social previews. First 255 characters of the description will be used if this is left blank.'
        errors={errors?.shortDescription}
        label='Short description'
      />
      <Checkbox
        attributes={{ name: 'isPublished' }}
        isChecked={!!project?.isPublished}
        label='Published'
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
