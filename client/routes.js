import styled, { ThemeProvider } from 'styled-components'
import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { theme } from './styles/theme.jsx'
import {
  Event,
  Events,
  Login,
  Pages,
  Project,
  Projects,
  Publication,
  Publications,
  Settings,
  NewUser
} from './apps'
import Header from './components/header/header.jsx'

export default class Routes extends Component {
  render () {
    return (
      <ThemeProvider theme={theme}>
        <Content>
          <Header />
          <Main>
            <Route exact path='/' component={Events} />
            <Route exact path='/events' component={Events} />
            <Route path='/events/:id' component={Event} />

            <Route exact path='/projects' component={Projects} />
            <Route exact path='/projects/:id' component={Project} />

            <Route exact path='/releases' component={Publications} />
            <Route exact path='/releases/:id' component={Publication} />
            <Route exact path='/publications' component={Publications} />
            <Route exact path='/publications/:id' component={Publication} />

            <Route exact path='/login' component={Login} />
            <Route exact path='/new/user' component={NewUser} />
            <Route exact path='/info' component={Pages} />
            <Route exact path='/settings' component={Settings} />
          </Main>
        </Content>
      </ThemeProvider>
    )
  }
}

const Main = styled.main`
  padding-top: 2.5em;
`

const Content = styled.div`
  font-family: 'Roboto', 'helvetica neue', 'helvetica', 'arial', 'sans-serif';
  font-size: 16px;
  line-height: 1.2em;
  letter-spacing: .015em;

  a {
    color: black;
    &:hover {
      color: #ddd;
    }
  }
`
