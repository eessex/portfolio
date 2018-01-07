import React, { Component } from 'react'
import { Social } from '../../../components/social/social_list.jsx'
import AdminSocial from './admin_social.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { ImageShow } from '../../../components/image/image_show.jsx'

import { EmbedList } from '../../../components/embeds/embed_list.jsx'

export class AboutShow extends Component {
  render() {
    const { settings } = this.props
    const cover_image = settings.about.images[0]
    const { embed_codes } = settings.about

    return (
      <LayoutColumn
        label='Info'
        className='AboutShow'
      >
        {cover_image &&
          <ImageShow {...cover_image} />
        }

        <div
          className='about__description'
          dangerouslySetInnerHTML={{__html: settings.about.description}}
        />

        <div className='about__social'>
          <Social social={settings.about.social} />
        </div>

        {embed_codes &&
          <EmbedList embed_codes={embed_codes} />
        }

      </LayoutColumn>
    )
  }
}
