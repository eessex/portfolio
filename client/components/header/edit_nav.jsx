import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, ButtonContainer } from '../forms/buttons/button.jsx'
import { SaveButton } from '../forms/buttons/save.jsx'

export const EditNav = (props) => {
  const {
    deleteItem,
    isSaved,
    isSaving,
    item,
    onPublish,
    saveItem,
    setEditing
  } = props

  return (
    <Nav className='AdminNav AdminNav--Edit'>
      {setEditing &&
        <ModalNav>
          <Button
            icon='camera'
            onClick={() => setEditing('images')}
          />
          <Button
            icon='code'
            onClick={() => setEditing('embeds')}
          />
          <Button
            icon='link'
            onClick={() => setEditing('links')}
          />
        </ModalNav>
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
    </Nav>
  )
}

export const Nav = styled.nav`
  position: fixed;
  top: 10px;
  right: 20px;
  z-index: 100;
  align-items: center;
  display: flex;
  ${ButtonContainer} {
    margin-left: .5em;
    width: 7.5em;
  }
`

const ModalNav = styled.div`
  ${ButtonContainer} {
    margin-left: .5em;
    width: inherit;
    padding: 4.5px 10px;
    .fa {
      font-size: 1.3em;
      vertical-align: sub;
    }
  }
`

EditNav.propTypes = {
  deleteItem: PropTypes.func,
  isSaved: PropTypes.bool,
  isSaving: PropTypes.bool,
  item: PropTypes.object,
  onPublish: PropTypes.func,
  saveItem: PropTypes.func,
  setEditing: PropTypes.func
}
