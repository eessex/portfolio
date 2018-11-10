import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import { createItem } from 'client/actions/items'
import { logoutUser } from 'client/actions/user'
import { Button, ButtonContainer } from 'client/components/forms/buttons/button'
import { H2, H3 } from 'client/styles/text'

export class AdminNav extends React.Component {
  static propTypes = {
    createItemAction: PropTypes.func,
    logoutUserAction: PropTypes.func
  }

  state = {
    menuIsOpen: false
  }

  toggleNewItemMenu = menuIsOpen => {
    this.setState({ menuIsOpen })
  }

  newItem = async (model) => {
    try {
      await this.props.createItemAction(model)
    } catch (err) {
      console.log(err)
    }
  }

  newItemMenu = () => {
    return (
      <NewItemMenu>
        <NewItemInner>
          <NewItemHeader>
            <H2>Create a new ...</H2>
          </NewItemHeader>

          <NewItemContainer>
            <H3>
              <a onClick={() => this.newItem('events')}>
                Event
              </a>
            </H3>
            <H3>
              <a onClick={() => this.newItem('projects')}>
                Project
              </a>
            </H3>
            <H3>
              <a onClick={() => this.newItem('publications')}>
                Release
              </a>
            </H3>
          </NewItemContainer>
        </NewItemInner>
        <Button icon='times' borderless onClick={() => this.toggleNewItemMenu(false)} />
      </NewItemMenu>
    )
  }

  render () {
    const { logoutUserAction } = this.props
    const { menuIsOpen } = this.state

    return (
      <AdminNavContainer>
        <Button
          text='New'
          icon='file'
          onClick={() => this.toggleNewItemMenu(true)}
        />
        <a onClick={logoutUserAction}>
          Logout
        </a>
        {menuIsOpen && this.newItemMenu()}
      </AdminNavContainer>
    )
  }
}

const mapStateToProps = ({ userReducer }) => ({
  isAuthenticated: userReducer.isAuthenticated
})

const mapDispatchToProps = {
  logoutUserAction: logoutUser,
  createItemAction: createItem
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AdminNav)
)

export const AdminNavContainer = styled.div`
  a {
    cursor: pointer;
    padding-left: 15px;
  }
`

const NewItemMenu = styled.div`
  position: fixed;
  left: 20px;
  right: 20px;
  top: 15px;
  bottom: 15px;
  z-index: 1;
  padding: 20px;
  border: 1px solid;
  background: white;
  display: flex;

  ${ButtonContainer} {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.5em;
  }
`

const NewItemHeader = styled.div`
  flex: 1;
`

const NewItemContainer = styled.div`
  flex: 2;
  margin-top: .45em;

  ${H3} {
    a {
      padding-left: 0;
      &:hover {
        border-bottom: 2px solid;
      }
    }
  }
`

const NewItemInner = styled.div`
  display: flex;
  max-width 700px;
  margin: auto;
  width: 100%;
`
