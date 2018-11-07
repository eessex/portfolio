import { filter, sortBy } from 'lodash'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ItemsList } from 'client/components/items_list'

export class Publications extends Component {
  static propTypes = {
    items: PropTypes.array
  }

  getReleases = type => {
    const { items } = this.props
    let releases = []

    items.map((item) => {
      let sorted
      switch (type) {
        case 'compilation': {
          sorted = filter(item.formats, { compilation: true })
          break
        }
        case 'featuring': {
          sorted = filter(item.formats, { featuring: true })
          break
        }
        default: {
          sorted = filter(item.formats, { compilation: false, featuring: false })
        }
      }
      // let isRelease = !item.formats.length && !compilation && !featured
      // const isCompilation = filter(item.formats, { compilation: compilation })

      if (sorted.length) {
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
    const releases = this.getReleases()
    const compilations = this.getReleases('compilation')
    const featuring = this.getReleases('featuring')

    return (
      <div>
        {releases.length > 0 &&
          <ItemsList
            model='releases'
            list={releases}
            label='Releases'
            layout='table'
            canToggle
          />
        }
        {compilations.length > 0 &&
          <Compilations>
            <ItemsList
              model='releases'
              list={compilations}
              label='Compilations'
              layout='table'
              canToggle
            />
          </Compilations>
        }
        {featuring.length > 0 &&
          <Compilations>
            <ItemsList
              model='releases'
              list={featuring}
              label='Featured Artist'
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
