import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { imageIsVertical } from '../../utils/index.js'
import { EditNav } from '../forms/edit_nav.jsx'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'

export class Item extends Component {
  static propTypes = {
    className: PropTypes.string,
    item: PropTypes.object,
    label: PropTypes.string,
    labelLink: PropTypes.bool,
    layout: PropTypes.string,
    model: PropTypes.string,
    onChange: PropTypes.func,
    setEditing: PropTypes.func
  }

  render () {
    const {
      item,
      model
    } = this.props

    const images = item.images || []
    const isGrid = images.length > 0 && imageIsVertical(images[0]) || images.length && model === 'publications'
    const gridCoverImage = images.length > 0 ? images[0] : undefined


    return (
      <div className={`Item Item--${model}`}>
        {/* TODO: EditNav */}
        {isGrid
          ? <LayoutGrid {...this.props} />
          : <LayoutColumn {...this.props} />
        }
      </div>
    )
  }
}
