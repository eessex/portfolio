import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { imageIsVertical } from '../../utils/index.js'
import { EditNav } from '../forms/edit_nav.jsx'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'
import EditItem from './edit_item.jsx'

export class Item extends Component {
  static propTypes = {
    className: PropTypes.string,
    item: PropTypes.object,
    label: PropTypes.string,
    labelLink: PropTypes.bool,
    layout: PropTypes.string,
    model: PropTypes.string,
  }

  renderItem = () => {
    const { item } = this.props

    const images = item.images || []
    const isGrid = images.length > 0 && imageIsVertical(images[0]) || images.length && model === 'publications'

    if (isGrid) {
      return <LayoutGrid {...this.props} />
    } else {
      return <LayoutColumn {...this.props} />
    }
  }

  render () {
    const {
      editing,
      model
    } = this.props

    return (
      <div className={`Item Item--${model}`}>
        {editing
          ? <EditItem {...this.props} />
          : this.renderItem()
        }
      </div>
    )
  }
}
