import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../../actions/item'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { Item } from '../../../components/item/index.jsx'
import { LinksModal } from '../../../components/links/links_modal.jsx'
import { TextModal } from '../../../components/text/text_modal.jsx'


export class ProjectEdit extends Component {
  state = {
    isEditing: null
  }

  onChange = (key, value) => {
    const { changeItem, maybeSaveItem } = this.props

    changeItem(key, value)
    maybeSaveItem('projects')
  }

  render () {
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

    return (
      <div className='ProjectEdit Edit'>
        <EditNav 
          deleteItem={() => deleteItem(model, item)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={item}
          model={model}
          setEditing={(isEditing) => this.setState({ isEditing })}
          onPublish={() => this.onChange('published', !item.published)}
          saveItem={() => maybeSaveItem('projects', true)}
        />

        <Item
          item={item}
          isSaved={isSaved}
          label='Project'
          labelLink
          model={model}
          onChange={this.onChange}
          setEditing={(isEditing) => this.setState({ isEditing })}
        />

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
)(ProjectEdit)