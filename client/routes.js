import styled from 'styled-components'
import React, { Component } from 'react'
import { Route } from 'react-router-dom'
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
      <div>
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
      </div>
    )
  }
}

const Main = styled.main`
  padding-top: 2.5em;
`
