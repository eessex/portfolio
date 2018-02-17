import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { imageIsVertical } from '../../utils/index.js'
import { DatesModal } from '../dates/dates_modal.jsx'
import { EditNav } from '../forms/edit_nav.jsx'
import { EmbedModal } from '../embeds/embed_modal.jsx'
import { ImagesEdit } from '../images/images_edit.jsx'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'
import { LinksModal } from '../links/links_modal.jsx'
import { VenueModal } from '../venue/venue_modal.jsx'

export class ItemEdit extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  state = {
    isEditing: null
  }

  onChange = (key, value) => {
    const { changeItem, maybeSaveItem, model } = this.props

    changeItem(key, value)
    maybeSaveItem(model)
  }

  setEditing = (isEditing) => {
    this.setState({ isEditing })
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

  render() {
    const { isEditing } = this.state
    const { model, maybeSaveItem } = this.props
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
    const isGrid = images.length > 0 && imageIsVertical(images[0]) || images.length && model === 'publications'
    const venue = item.venue || {}

    return (
      <div className='EditItem'>
        <EditNav 
          deleteItem={() => deleteItem(model, item)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={item}
          model={model}
          setEditing={this.setEditing}
          onPublish={() => this.onChange('published', !item.published)}
          saveItem={() => maybeSaveItem(model, true)}
        />
        {isGrid
          ? <LayoutGrid
              {...this.props}
              item={item}
              onChange={this.onChange}
              setEditing={this.setEditing}
            />
          : <LayoutColumn
              {...this.props}
              item={item}
              onChange={this.onChange}
              setEditing={this.setEditing}
            />
        }

        {isEditing === 'dates' &&
          <DatesModal
            {...this.getDateProps()}
            onChange={(key, value) => this.onChange(key, value)}
            hasEndDate={!this.state.hasEndDate}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={item}
            fetchUpload={fetchUpload}
            onChange={(value) => this.onChange('images', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'links' &&
          <LinksModal
            links={item.links}
            onChange={(value) => this.onChange('links', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'venue' &&
          <VenueModal
            venue={venue}
            onChange={(value) => this.onChange('venue', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
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
  deleteItem: itemActions.deleteItem,
  maybeSaveItem: itemActions.maybeSaveItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEdit)
