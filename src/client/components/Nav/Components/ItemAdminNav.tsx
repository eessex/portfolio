import styled from 'styled-components'
import React from 'react'
import { Button, ButtonContainer } from 'client/components/Button'
import { Item, isEditing } from 'client/typings'

interface ItemAdminNavProps {
  deleteItem: () => void
  isSaved: boolean
  isSaving: boolean
  item: Item
  noLinks: boolean
  onPublish: (key: 'published', val: boolean) => void
  saveItem: (item: Item, isPublishing: boolean) => void
  setEditing: (isEditing: isEditing | null) => void
}

export const ItemAdminNav: React.SFC<ItemAdminNavProps> = props => {
  const {
    deleteItem,
    isSaved,
    isSaving,
    item,
    onPublish,
    saveItem,
    setEditing,
    noLinks
  } = props

  return (
    <Nav>
      {setEditing &&
        <ModalNav>
          <Button
            icon='camera'
            onClick={() => setEditing('images')}
          />
          <Button
            icon='code'
            onClick={() => setEditing('embed_codes')}
          />
          {!noLinks &&
            <Button
              icon='link'
              onClick={() => setEditing('links')}
            />
          }
        </ModalNav>
      }
      {onPublish &&
        <Button
          text={item.published ? 'Unpublish' : 'Publish'}
          onClick={() => onPublish('published', !item.published)}
        />
      }
      {saveItem &&
        <Button
          onClick={() => saveItem(item, true)}
          color={saveButtonColor(!isSaved, isSaving)}
          text={isSaving ? 'Saving' : 'Save'}
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

const saveButtonColor = (needsSave, isSaving) => {
  if (isSaving) {
    return 'limegreen'
  } else if (needsSave) {
    return 'red'
  } else {
    return 'black'
  }
}

export const Nav = styled.nav`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  align-items: center;
  display: flex;

  ${ButtonContainer} {
    margin-left: .5em;
    width: 7.5em;
  }

  @media (max-width: 46rem) {
    display: none;
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
