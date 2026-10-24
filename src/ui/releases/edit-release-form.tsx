'use client'

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
import { PagePaths } from '@/lib/schemas'
import {
  MAX_STRING_LENGTH_LONG,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { Checkbox } from '@/ui/form/checkbox'
import { useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { ItemEditForm } from '@/ui/form/item-edit-form'
import { Select } from '@/ui/form/select'
import { ImagesPicker } from '@/ui/images/images-picker'
import { ItemPicker } from '@/ui/item-picker/item-picker'
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
  const initialProject = release?.project as ProjectClient | undefined
  const [project, setProject] = useState(initialProject)
  const [artist, setArtist] = useState(
    release?.artist || initialProject?.title || ''
  )

  function handleProjectChange(next?: ProjectClient) {
    // only replace a blank or auto-filled name, never a typed one
    if (!artist.trim() || artist === project?.title) {
      setArtist(next?.title ?? '')
    }
    setProject(next)
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
      <div>
        <ItemPicker<never, ProjectClient, FetchProjectsResult>
          itemType={PagePaths.projects}
          label='Project'
          existingItem={initialProject}
          renderExistingResult={formatProjectResult}
          onSelectionChange={handleProjectChange}
          isRequired
        />
        {errors?.projectId && (
          <p role='alert' className={styles['error-message']}>
            {errors.projectId.join(' ')}
          </p>
        )}
      </div>
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
        errors={errors?.type}
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
        isDefaultChecked={!!release?.isPublished}
        label='Published'
      />
    </>
  )
}

export function EditReleaseForm({ release }: EditReleaseFormProps) {
  return (
    <ItemEditForm
      path={PagePaths.releases}
      action={(formData) => editRelease(formData, release?.id)}
      deleteItem={release && (() => deleteRelease(release))}
    >
      <ReleaseFormFields release={release} />
    </ItemEditForm>
  )
}
