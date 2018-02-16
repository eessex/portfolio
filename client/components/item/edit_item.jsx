import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { imageIsVertical } from '../../utils/index.js'

import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'
import { EditNav } from '../forms/edit_nav.jsx'
import { EmbedModal } from '../embeds/embed_modal.jsx'
import { ImagesEdit } from '../images/images_edit.jsx'
import { LinksModal } from '../links/links_modal.jsx'

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

    return (
      <div className='EditItem'>
        <EditNav 
          deleteItem={() => deleteItem(model, item)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={item}
          model={model}
          setEditing={(isEditing) => this.setState({ isEditing })}
          onPublish={() => this.onChange('published', !item.published)}
          saveItem={() => maybeSaveItem(model, true)}
        />
        {isGrid
          ? <LayoutGrid {...this.props} item={item} onChange={this.onChange} />
          : <LayoutColumn {...this.props} item={item} onChange={this.onChange} />
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
