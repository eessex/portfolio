import {
  createLinkSchema,
  createPressLinkSchema,
  createSocialLinkSchema,
  type Link,
  LinkTypes
} from '@/lib/links/schemas/db'
import {
  compareLinksByDefaultOrder,
  compareLinksByName,
  isPressLink,
  linkOrderGroup
} from '@/lib/links/util'
import { MAX_SOCIAL_LINKS } from '@/lib/site-settings/schemas'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { EditLink } from '@/ui/links/edit-link-form'
import {
  formatLinkResult,
  formatLinkResultWithoutBadge,
  formatNewLinkSummary,
  formatNewPressLinkSummary
} from '@/ui/links/format-link-result'

/**
 * Non-press links (social, buy, stream, untyped). Takes the item's full
 * `links` list and shows only those; press links go to
 * `PressLinksPicker`.
 */
export function LinksPicker({ links }: { links?: Link[] }) {
  return (
    <ItemPicker<Link>
      isMulti
      itemType='links'
      label='Links'
      searchParams={{ isPress: false }}
      existingItems={(links ?? []).filter(
        (link) => !isPressLink(link)
      )}
      renderExistingResult={formatLinkResult}
      renderNewItemSummary={formatNewLinkSummary}
      schema={createLinkSchema}
      renderEditItemForm={({ errors, isRequired, existingItem }) => (
        <EditLink
          link={existingItem}
          errors={errors}
          isRequired={isRequired}
          isPress={false}
        />
      )}
    />
  )
}

/**
 * A Press picker draft submits no `type` (see `PressLinksPicker`), so
 * its values are typed here wherever they're summarized or ordered —
 * otherwise a new review sorts and drags as a plain link.
 */
function asPress<T extends Record<string, unknown>>(values: T) {
  return { ...values, type: LinkTypes.press }
}

/**
 * Press links, sorted by date by default. Takes the item's full
 * `links` list and shows only the press ones. Entries submit no
 * `type` field (so a blank slot stays blank); the server saves every
 * new or edited entry as press, requiring a title, attribution
 * and publish date. Submits under `pressLinks`, which
 * `resolveOrderedLinkIds` merges with `LinksPicker`'s `links`.
 */
export function PressLinksPicker({ links }: { links?: Link[] }) {
  return (
    <ItemPicker<Link>
      isMulti
      itemType='links'
      name='pressLinks'
      label='Press'
      searchLabel='Search press links'
      itemName='press link'
      searchParams={{ isPress: true }}
      existingItems={(links ?? []).filter(isPressLink)}
      defaultOrder={{
        compare: (a, b) =>
          compareLinksByDefaultOrder(asPress(a), asPress(b)),
        group: (item) => linkOrderGroup(asPress(item)),
        resetLabel: 'Sort press links by date'
      }}
      renderExistingResult={formatLinkResultWithoutBadge}
      renderNewItemSummary={(data, previewUrl, actions) =>
        formatNewPressLinkSummary(asPress(data), previewUrl, actions)
      }
      schema={createPressLinkSchema}
      renderEditItemForm={({ errors, isRequired, existingItem }) => (
        <EditLink
          link={existingItem}
          errors={errors}
          isRequired={isRequired}
          isPress
        />
      )}
    />
  )
}

/**
 * The footer's social links, in footer order: by name until dragged,
 * with a button to restore that. Create-only, with a
 * blank url input open until the cap: a pasted url that's already
 * saved swaps the draft for that link's chip. The
 * server saves every picked link as social (`resolveSocialLinkIds`).
 */
export function SocialLinksPicker({ links }: { links?: Link[] }) {
  return (
    <ItemPicker<Link>
      isMulti
      isSearchHidden
      isCreateFormAlwaysOpen
      maxItems={MAX_SOCIAL_LINKS}
      itemType='links'
      name='socialLinks'
      defaultOrder={{
        compare: compareLinksByName,
        resetLabel: 'Sort social links by name'
      }}
      label='Social links'
      itemName='social link'
      description={`Up to ${MAX_SOCIAL_LINKS} links to social media profiles, shown in the footer on every page.`}
      existingItems={links}
      renderExistingResult={formatLinkResultWithoutBadge}
      renderNewItemSummary={formatNewLinkSummary}
      schema={createSocialLinkSchema}
      renderEditItemForm={({
        errors,
        isRequired,
        existingItem,
        onBusyChange,
        onExistingMatch
      }) => (
        <EditLink
          link={existingItem}
          errors={errors}
          isRequired={isRequired}
          isSocial
          onBusyChange={onBusyChange}
          onExistingMatch={onExistingMatch}
        />
      )}
    />
  )
}
