import PropTypes from 'prop-types'
import React from 'react'
import { LinkEdit } from './link_edit.jsx'

export const EditLinks = (props) => {
  const { links, onChange, onDelete } = props
  return (
    <div>
      {links.map((link, index) =>
        <LinkEdit
          link={link}
          index={index}
          key={index}
          onChange={onChange}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}