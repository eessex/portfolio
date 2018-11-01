import { filter, sortBy } from 'lodash'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ItemsList } from 'client/components/items_list'

export class Publications extends Component {
  static propTypes = {
    items: PropTypes.array,
    title: PropTypes.string
  }

  getReleases = (compilation = false) => {
    const { items } = this.props
    let releases = []

    items.map((item) => {
      let isDraft = !item.formats.length && !compilation
      const sorted = filter(item.formats, { compilation: compilation })

      if (isDraft || sorted.length) {
        releases.push(item)
      }
    })

    const sortedReleases = sortBy(releases, [
      (item) => {
        if (item.formats.length) {
          return item.formats[0].release_year
        }
      },
      'name'
    ]).reverse()

    return sortedReleases
  }

  render () {
    const { title } = this.props
    const releases = this.getReleases()
    const compilations = this.getReleases(true)

    return (
      <div>
        {releases.length > 0 &&
          <ItemsList
            model={title.toLowerCase()}
            list={releases}
            label={title}
            layout='table'
            canToggle
          />
        }
        {compilations.length > 0 &&
          <Compilations>
            <ItemsList
              model={title.toLowerCase()}
              list={compilations}
              label='Compilations'
              layout='table'
              canToggle
            />
          </Compilations>
        }
      </div>
    )
  }
}

const Compilations = styled.div`
  margin-top: 5em;
`
