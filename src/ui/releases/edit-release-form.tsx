'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import { publishedEditionDraftSchema } from '@/lib/published-editions/schemas/db'
import {
  comparePublishedEditionsByDate,
  PUBLISHED_EDITIONS_FIELD
} from '@/lib/published-editions/util'
import { deleteRelease, editRelease } from '@/lib/releases/actions'
import { releaseTypes } from '@/lib/releases/schemas'
import type { ReleaseClient } from '@/lib/releases/types'
import {
  MAX_STRING_LENGTH_LONG,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { Checkbox } from '@/ui/form/checkbox'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { ImagesPicker } from '@/ui/images/images-picker'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { DeleteItemButton } from '@/ui/items/delete-item-button'
import {
  LinksPicker,
  PressLinksPicker
} from '@/ui/links/links-picker'
import { formatProjectResult } from '@/ui/projects/format-project-result'
import { EditPublishedEdition } from '@/ui/published-editions/edit-published-edition-form'
import {
  formatNewPublishedEditionSummary,
  formatPublishedEditionResult
} from '@/ui/published-editions/format-published-edition-result'

type EditReleaseFormProps = {
  release?: ReleaseClient
}

function ReleaseFormFields({ release }: EditReleaseFormProps) {
  const errors = useFormErrors()
  const [isPublished, setIsPublished] = useState(
    !!release?.isPublished
  )
  const initialProject = release?.project as ProjectClient | undefined
  const [projectTitle, setProjectTitle] = useState(
    initialProject?.title
  )
  const [artist, setArtist] = useState(
    release?.artist || initialProject?.title || ''
  )

  function handleProjectChange(project?: ProjectClient) {
    // only replace a blank or auto-filled name, never a typed one
    if (!artist.trim() || artist === projectTitle) {
      setArtist(project?.title ?? '')
    }
    setProjectTitle(project?.title)
  }

  return (
    <>
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: 'title',
          required: true,
          placeholder: 'Greatest Hits'
        }}
        defaultValue={release?.title}
        errors={errors?.title}
        label='Title'
      />
      <ItemPicker<never, ProjectClient, FetchProjectsResult>
        itemType='projects'
        label='Project'
        existingItem={initialProject}
        renderExistingResult={formatProjectResult}
        onSelectionChange={handleProjectChange}
        isRequired
      />
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: 'artist',
          required: true,
          placeholder: 'Tina Turner'
        }}
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        errors={errors?.artist}
        label='Artist name'
        description='The artist(s) this release is attributed to.'
      />
      <Select
        options={[...releaseTypes]}
        onChange={() => {}}
        label='Type'
        placeholder='Select a type'
        value={release?.type}
        attributes={{ name: 'type', required: true }}
      />
      <div>
        <ItemPicker<PublishedEditionClient>
          isMulti
          isSearchHidden
          isRequired
          itemType='publishedEditions'
          name={PUBLISHED_EDITIONS_FIELD}
          label='Published editions'
          existingItems={release?.publishedEditions}
          sortBy={comparePublishedEditionsByDate}
          schema={publishedEditionDraftSchema}
          renderExistingResult={formatPublishedEditionResult}
          renderNewItemSummary={formatNewPublishedEditionSummary}
          renderEditItemForm={({ errors, existingItem }) => (
            <EditPublishedEdition
              errors={errors}
              publishedEdition={existingItem}
            />
          )}
        />
        {errors?.[PUBLISHED_EDITIONS_FIELD] && (
          <p role='alert' className={styles['error-message']}>
            {errors[PUBLISHED_EDITIONS_FIELD].join(' ')}
          </p>
        )}
      </div>
      <Input
        as='textarea'
        attributes={{
          maxLength: MAX_STRING_LENGTH_LONG,
          name: 'description'
        }}
        defaultValue={release?.description}
        errors={errors?.description}
        label='Description'
      />
      <ImagesPicker
        coverImage={release?.coverImage}
        images={release?.images}
      />
      <EmbedCodesPicker embedCodes={release?.embedCodes} />
      <PressLinksPicker links={release?.links} />
      <LinksPicker links={release?.links} />
      <Checkbox
        attributes={{ name: 'isPublished' }}
        isChecked={isPublished}
        label='Published'
        onChange={() => setIsPublished(!isPublished)}
      />
    </>
  )
}

export function EditReleaseForm({ release }: EditReleaseFormProps) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const res = await editRelease(formData, release?.id)
    if (res?.ok && res.res) {
      router.push(`/releases/${res.res.slug}`)
    }
    return res
  }

  return (
    <>
      <Form
        action={handleSubmit}
        submitButtonClassName='button-lg button-primary'
      >
        <ReleaseFormFields release={release} />
      </Form>

      {release && (
        <div className={styles['delete-button-container']}>
          <DeleteItemButton
            deleteItem={() => deleteRelease(release)}
            itemLabel='release'
            redirectTo='/releases'
          />
        </div>
      )}
    </>
  )
}
