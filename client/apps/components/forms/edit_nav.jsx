import PropTypes from 'prop-types'
import React from 'react'
import { DeleteButton } from './buttons/delete.jsx' 
import { PublishButton } from './buttons/publish.jsx' 
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
        <PublishButton
          published={item.published}
          onClick={() => onPublish('published', !item.published)}
        />
      }
      {saveItem &&
        <SaveButton
          isSaved={isSaved}
          isSaving={isSaving}
          onClick={() => saveItem(project, true)}
        />
      }
      {deleteitem &&
        <DeleteButton
          className='DeleteButton'
          onClick={() => deleteitem(item)}
          redirectUrl={`/${model}`}
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
