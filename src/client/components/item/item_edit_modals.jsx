import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from 'client/actions/item'
import { DatesModal } from '../dates/dates_modal'
import { EmbedModal } from '../embeds/embed_modal'
import { FormatsModal } from '../formats/formats_modal'
import { ImagesEdit } from '../images/images_edit'
import { LinksModal } from '../links/links_modal'
import { VenueModal } from '../venue/venue_modal'

export class ItemEditModals extends Component {
  static propTypes = {
    fetchUpload: PropTypes.func,
    isEditing: PropTypes.string,
    item: PropTypes.object,
    isSaved: PropTypes.bool,
    isSaving: PropTypes.bool,
    onChange: PropTypes.func,
    setEditing: PropTypes.func
  }

  getDateProps = () => {
    const {
      all_day,
      end_date,
      start_date
    } = this.props.item.item

    return {
      all_day,
      end_date,
      start_date
    }
  }

  render () {
    const { item, fetchUpload, isEditing, onChange, setEditing } = this.props

    return (
      <div>
        {isEditing === 'dates' &&
          <DatesModal
            {...this.getDateProps()}
            onChange={onChange}
            setEditing={setEditing}
          />
        }

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={item.embed_codes || []}
            onChange={(value) => onChange('embed_codes', value)}
            setEditing={setEditing}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={item}
            fetchUpload={fetchUpload}
            onChange={(value) => onChange('images', value)}
            setEditing={setEditing}
          />
        }

        {isEditing === 'formats' &&
          <FormatsModal
            label='Formats'
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
  fetchUpload: itemActions.fetchUpload
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEditModals)
