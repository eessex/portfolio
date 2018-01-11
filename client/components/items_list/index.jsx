import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { Col, Row } from 'react-styled-flexboxgrid'
import { capitalize } from 'lodash'
import { getDate, getVenue } from '../../utils/index.js'
import { ListItem } from './components/list_item.jsx'

export class ItemsList extends Component {
  state = {
    layout: this.props.layout || 'list'
  }

  renderLabel = () => {
    const { layout } = this.state
    const { canToggle, label, model } = this.props
    const renderedLabel = label && label.length ? label : capitalize(model)

    if (layout !== 'grid' || canToggle) {
      return (
        <Row className='ItemsList__header h4'>
          <Col xs={12}>
            {label}
            {canToggle && this.renderLayoutToggle()}
          </Col>
        </Row>
      )
    } else {
      return (
        <div className='ItemsList__header h4'>
          {label}
        </div>
      )
    }
  }

  renderLayoutToggle = () => {
    const { layout } = this.state
    const { model } = this.props

    if (layout === 'table') {
      return (
        <h6
          className='layout-toggle'
          onClick={() => this.setState({layout: 'grid'})}
        >
          {model === 'releases' ? 'Covers' : 'Posters'}
          <FontAwesome name='expand' />
        </h6>
      )
    } else {
      return (
        <h6
          className='layout-toggle'
          onClick={() => this.setState({layout: 'table'})}
        >
          List
          <FontAwesome name='bars' />
        </h6>
      )
    }
  }

  renderList = (items) => {
    const { layout } = this.state
    const { canToggle, label, model } = this.props

    switch (layout) {
      case 'table':
        return (
          <div className='ItemsList__list'>
            {items}
          </div>
        )
      case 'grid':
        return (
          <Row className='ItemsList__list'>
            {label && !canToggle &&
              <Col xs={12} lg={2}>
                {this.renderLabel()}
              </Col>
            }
            {items}
          </Row>
        )
      default:
        return (
          <div className='ItemsList__list'>
            {items}
          </div>
        )
    }
  }

  renderListItems = () => {
    const { layout } = this.state
    const { canToggle, list, model } = this.props

    return list.map((item, i) => {
      const date = getDate(model, item)
      const venue = getVenue(item.venue)

      return (
        <ListItem
          key={i}
          artist={item.artist}
          date={date}
          formats={item.formats}
          image={item.images[0]}
          layout={layout}
          slug={`/${model}/${item.slug || item._id}`}
          title={item.title}
          venue={venue}
          published={item.published}
          publisher={item.publisher}
          condensed={canToggle}
        />
      )
    })
  }

  render () {
    const {
      canToggle,
      children,
      className,
      comingSoon,
      label,
      list,
      model
    } = this.props

    const { layout } = this.state
    const listItems = children ? children : this.renderListItems()
    const layoutClass = layout ? ' ' + layout : ''
    const classModelName = 'ItemsList--' + model + layoutClass
    const hasLabel = label && layout !== 'grid' || layout === 'grid' && canToggle

    return(
      <div
        className={`ItemsList ${classModelName} ${className || ''}`}
        data-toggle={canToggle}
      >
        {hasLabel && this.renderLabel()}

        {list.length
          ? this.renderList(listItems)
          : comingSoon && 'Coming Soon'
        }
      </div>
    )
  }
}

ItemsList.propTypes = {
  canToggle: PropTypes.bool,
  comingSoon: PropTypes.bool,
  label: PropTypes.string,
  layout: PropTypes.string,
  list: PropTypes.array.isRequired,
  model: PropTypes.string.isRequired
}
