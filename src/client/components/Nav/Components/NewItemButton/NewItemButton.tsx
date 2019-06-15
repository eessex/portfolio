import React from 'react'
import { Button } from 'client/components/Button'
import NewItemMenu from 'client/components/Nav/Components/NewItemButton/NewItemMenu'

interface NewItemButtonState {
  menuIsOpen: boolean
}

export class NewItemButton extends React.Component<{}, NewItemButtonState> {
  state = {
    menuIsOpen: false
  }

  toggleNewItemMenu = menuIsOpen => {
    this.setState({ menuIsOpen })
  }

  render () {
    return (
      <React.Fragment>
        <Button
          text='New'
          icon='file'
          onClick={() => this.toggleNewItemMenu(true)}
        />
        {this.state.menuIsOpen &&
          <NewItemMenu onClose={() => this.toggleNewItemMenu(false)} />
        }
      </React.Fragment>
    )
  }
}
