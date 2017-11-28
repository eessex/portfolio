import PropTypes from 'prop-types'
import React from 'react'
import { Button } from './buttons/button.jsx' 
import { SaveButton } from './buttons/save.jsx'

export const EditNav = (props) => {
  const {
    deleteitem,
    isSaved,
    isSaving,
    item,
    model,
    onPublish,
    saveItem
  } = props

  return (
    <nav className='AdminNav AdminNav--Edit'>
      {onPublish &&
        <Button
          text={item.published ? 'Unpublish' : 'Publish'}
          onClick={() => onPublish('published', !item.published)}
        />
      }
      {saveItem &&
        <SaveButton
          isSaved={isSaved}
          isSaving={isSaving}
          onClick={() => saveItem(item, true)}
        />
      }
      {deleteitem &&
        <Button
          onClick={() => deleteitem(item)}
          text='Delete'
        />
      }
    </nav>
  )
}

EditNav.propTypes = {
  deleteitem: PropTypes.func,
  isSaved: PropTypes.bool,
  isSaving: PropTypes.bool,
  item: PropTypes.object,
  model: PropTypes.string,
  onPublish: PropTypes.func,
  saveItem: PropTypes.func
}
