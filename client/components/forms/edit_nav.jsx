import PropTypes from 'prop-types'
import React from 'react'
import { Button } from './buttons/button.jsx'
import { SaveButton } from './buttons/save.jsx'

export const EditNav = (props) => {
  const {
    deleteItem,
    isSaved,
    isSaving,
    item,
    model,
    onPublish,
    saveItem,
    setEditing
  } = props

  return (
    <nav className='AdminNav AdminNav--Edit'>
      {setEditing &&
        <Button
          icon='camera'
          onClick={() => setEditing('images')}
          className='AdminNav__icon'
        />
      }
      {setEditing &&
        <Button
          icon='code'
          onClick={() => setEditing('embeds')}
          className='AdminNav__icon'
        />
      }
      {setEditing &&
        <Button
          icon='link'
          onClick={() => setEditing('links')}
          className='AdminNav__icon'
        />
      }
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
      {deleteItem &&
        <Button
          onClick={deleteItem}
          text='Delete'
        />
      }
    </nav>
  )
}

EditNav.propTypes = {
  deleteItem: PropTypes.func,
  isSaved: PropTypes.bool,
  isSaving: PropTypes.bool,
  item: PropTypes.object,
  model: PropTypes.string,
  onPublish: PropTypes.func,
  saveItem: PropTypes.func,
  setEditing: PropTypes.func
}
