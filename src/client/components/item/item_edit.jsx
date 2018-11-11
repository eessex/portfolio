import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from 'client/actions/item'
import { imageIsVertical } from 'client/utils'
import { ItemAdminNav } from 'client/components/Nav/ItemAdminNav'
import { LayoutColumn } from 'client/components/layout/column'
import { LayoutGrid } from 'client/components/layout/grid'
import ItemEditModals from './item_edit_modals'

export class ItemEdit extends Component {
  static propTypes = {
    changeItem: PropTypes.func,
    deleteItem: PropTypes.func,
    item: PropTypes.shape({
      item: PropTypes.object,
      isSaved: PropTypes.bool,
      isSaving: PropTypes.bool
    }),
    maybeSaveItem: PropTypes.func,
    model: PropTypes.string
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

  render () {
    const { isEditing } = this.state
    const { deleteItem, model, maybeSaveItem } = this.props
    const { item, isSaved, isSaving } = this.props.item

    const images = item.images || []
    const isPublication = model === 'publications'
    const isGrid = images.length !== 0 && (imageIsVertical(images[0]) || isPublication)

    return (
      <div>
        <ItemAdminNav
          deleteItem={() => deleteItem(model, item)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={item}
          model={model}
          setEditing={this.setEditing}
          onPublish={() => this.onChange('published', !item.published)}
          saveItem={() => maybeSaveItem(model, true)}
        />

        {isGrid || (model === 'publications' && images.length)
          ? (
            <LayoutGrid
              {...this.props}
              item={item}
              onChange={this.onChange}
              setEditing={this.setEditing}
            />
          ) : (
            <LayoutColumn
              {...this.props}
              item={item}
              onChange={this.onChange}
              setEditing={this.setEditing}
            />
          )
        }

        <ItemEditModals
          isEditing={isEditing}
          setEditing={this.setEditing}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  item: state.item
})

const mapDispatchToProps = {
  changeItem: itemActions.changeItem,
  deleteItem: itemActions.deleteItem,
  maybeSaveItem: itemActions.maybeSaveItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEdit)
