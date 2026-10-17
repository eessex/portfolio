import {
  type Image,
  imageClientFieldsSchema
} from '@/lib/images/schemas/db'
import { EditImage } from '@/ui/images/edit-image-form'
import {
  formatImageResult,
  formatNewImageSummary
} from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'

/**
 * Reorderable images picker; the cover image leads the list, matching
 * `resolveOrderedImageIds` treating the first entry as the cover.
 */
export function ImagesPicker({
  coverImage,
  images
}: {
  coverImage?: Image
  images?: Image[]
}) {
  const existingItems = [coverImage, ...(images ?? [])].filter(
    (image): image is Image => !!image
  )

  return (
    <ItemPicker<Image>
      isMulti
      itemType='images'
      existingItems={existingItems}
      renderExistingResult={formatImageResult}
      renderNewItemSummary={formatNewImageSummary}
      schema={imageClientFieldsSchema}
      renderEditItemForm={({ errors, isRequired, existingItem }) => (
        <EditImage
          image={existingItem}
          errors={errors}
          isRequired={isRequired}
        />
      )}
    />
  )
}
