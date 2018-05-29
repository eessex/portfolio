import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { imageIsVertical } from '../../utils/index.js'
import { DatesModal } from '../dates/dates_modal.jsx'
import { EditNav } from '../forms/edit_nav.jsx'
import { EmbedModal } from '../embeds/embed_modal.jsx'
import { FormatsModal } from '../formats/formats_modal.jsx'
import { ImagesEdit } from '../images/images_edit.jsx'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'
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
    const { isEditing, onChange, setEditing } = this.props
    const { item, isSaved, isSaving } = this.props.item
    const {
      deleteItem,
      fetchUpload,
      loading,
      updateItem
    } = this.props

    const images = item.images || []
    const links = item.links || []
    const embed_codes = item.embed_codes || []
    const venue = item.venue || {}
    const formats = item.formats || []

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
            embed_codes={embed_codes}
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
            formats={formats}
            onChange={onChange}
            setEditing={setEditing}
          />
        }

        {isEditing === 'links' &&
          <LinksModal
            links={item.links}
            onChange={(value) => onChange('links', value)}
            setEditing={setEditing}
          />
        }

        {isEditing === 'venue' &&
          <VenueModal
            venue={venue}
            onChange={(value) => onChange('venue', value)}
            setEditing={setEditing}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  item: state.item,
  user: state.user
})

const mapDispatchToProps = {
  changeItem: itemActions.changeItem,
  fetchUpload: itemActions.fetchUpload,
  updateItem: itemActions.updateItem,
  deleteItem: itemActions.deleteItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEditModals)
