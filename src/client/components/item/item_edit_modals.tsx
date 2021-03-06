import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchUpload } from 'client/actions/upload'
import { DatesModal } from 'client/components/dates/dates_modal'
import { EmbedModal } from 'client/components/embeds/embed_modal'
import { FormatsModal } from 'client/components/formats/formats_modal'
import { ImagesEdit } from 'client/components/images/images_edit'
import { LinksModal } from 'client/components/links/links_modal'
import { VenueModal } from 'client/components/venue/venue_modal'
import { Item, isEditing } from 'client/typings'

interface ItemEditModalsProps {
  fetchUploadAction: () => void
  isEditing: isEditing
  item: Item
  isSaved: boolean
  isSaving: boolean
  onChange: (key: isEditing, val?: any) => void
  setEditing: () => void
}

export class ItemEditModals extends Component<ItemEditModalsProps> {
  getDateProps = () => {
    const {
      all_day,
      end_date,
      start_date
    } = this.props.item

    return {
      all_day,
      end_date,
      start_date
    }
  }

  render () {
    const { item, fetchUploadAction, isEditing, onChange, setEditing } = this.props

    return (
      <div>
        {isEditing === 'dates' &&
          <DatesModal
            {...this.getDateProps()}
            onChange={onChange}
            setEditing={setEditing}
          />
        }

        {isEditing === 'embed_codes' &&
          <EmbedModal
            embed_codes={item.embed_codes || []}
            onChange={(value) => onChange('embed_codes', value)}
            setEditing={setEditing}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={item}
            fetchUpload={fetchUploadAction}
            onChange={(value) => onChange('images', value)}
            setEditing={setEditing}
          />
        }

        {isEditing === 'formats' &&
          <FormatsModal
            formats={item.formats || []}
            onChange={onChange}
            setEditing={setEditing}
          />
        }

        {isEditing === 'links' &&
          <LinksModal
            links={item.links || []}
            onChange={(value) => onChange('links', value)}
            setEditing={setEditing}
          />
        }

        {isEditing === 'venue' &&
          <VenueModal
            venue={item.venue || {}}
            onChange={(value) => onChange('venue', value)}
            setEditing={setEditing}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = ({ itemReducer }) => ({
  item: itemReducer.item,
  isSaved: itemReducer.isSaved,
  isSaving: itemReducer.isSaving
})

const mapDispatchToProps = {
  fetchUploadAction: fetchUpload
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEditModals)
