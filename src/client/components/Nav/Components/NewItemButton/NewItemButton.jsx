import React from 'react'
import { Button } from 'client/components/Button'
import NewItemMenu from 'client/components/Nav/Components/NewItemButton/NewItemMenu'

export class NewItemButton extends React.Component {
  state = {
    menuIsOpen: false
  }

  toggleNewItemMenu = menuIsOpen => {
    this.setState({ menuIsOpen })
  }

  render () {
    const { menuIsOpen } = this.state

    return (
      <React.Fragment>
        <Button
          text='New'
          icon='file'
          onClick={() => this.toggleNewItemMenu(true)}
        />
        {menuIsOpen &&
          <NewItemMenu onClose={() => this.toggleNewItemMenu(false)} />
        }
      </React.Fragment>
    )
  }
}
