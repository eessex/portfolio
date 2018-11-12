import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from 'client/actions/item'
import { imageIsVertical } from 'client/utils'
import { ItemAdminNav } from 'client/components/Nav/Components/ItemAdminNav'
import { LayoutColumn } from 'client/components/layout/column'
import { LayoutGrid } from 'client/components/layout/grid'
import ItemEditModals from './item_edit_modals'

export class ItemEdit extends Component {
  static propTypes = {
    changeItemAction: PropTypes.func,
    deleteItem: PropTypes.func,
    item: PropTypes.object,
    isSaved: PropTypes.bool,
    isSaving: PropTypes.bool,
    maybeSaveItem: PropTypes.func,
    model: PropTypes.string
  }

  state = {
    isEditing: null
  }

  onChange = (key, value) => {
    const { changeItemAction, maybeSaveItem, model } = this.props

    changeItemAction(key, value)
    maybeSaveItem(model)
  }

  setEditing = (isEditing) => {
    this.setState({ isEditing })
  }

  render () {
    const { isEditing } = this.state
    const { deleteItem, model, maybeSaveItem } = this.props
    const { item, isSaved, isSaving } = this.props

    const images = item.images || []
    const isPublication = model === 'publications'
    const isGrid = images.length !== 0 && (imageIsVertical(images[0]) || isPublication)

    return (
      <div>
        <ItemAdminNav
          deleteItem={model !== 'pages' ? () => deleteItem(model, item) : undefined}
          isSaved={isSaved}
          isSaving={isSaving}
          item={item}
          model={model}
          setEditing={this.setEditing}
          onPublish={model !== 'pages' ? () => this.onChange('published', !item.published) : undefined}
          saveItem={() => maybeSaveItem(model, true)}
          noLinks={model === 'pages'}
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

const mapStateToProps = ({ itemReducer }) => ({
  item: itemReducer.item,
  isSaved: itemReducer.isSaved,
  isSaving: itemReducer.isSaving
})

const mapDispatchToProps = {
  changeItemAction: itemActions.changeItem,
  deleteItem: itemActions.deleteItem,
  maybeSaveItem: itemActions.maybeSaveItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemEdit)
