import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { DatesModal } from '../dates/dates_modal.jsx'
import { EmbedModal } from '../embeds/embed_modal.jsx'
import { FormatsModal } from '../formats/formats_modal.jsx'
import { ImagesEdit } from '../images/images_edit.jsx'
import { LinksModal } from '../links/links_modal.jsx'
import { VenueModal } from '../venue/venue_modal.jsx'

export class ItemEditModals extends Component {
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

  render() {
    const { fetchUpload, isEditing, onChange, setEditing } = this.props
    const { item } = this.props.item

    return (
      <div className='ItemEditModals'>
        {isEditing === 'dates' &&
          <DatesModal
            {...this.getDateProps()}
            onChange={onChange}
            hasEndDate={!this.state.hasEndDate}
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

const mapStateToProps = (state) => ({
  item: state.item
})

const mapDispatchToProps = {
  fetchUpload: itemActions.fetchUpload
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEditModals)
