import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import {
  Event,
  Events,
  Pages,
  Project,
  Projects,
  Publication,
  Publications,
  Settings,
  User
} from './apps'
import Header from './components/header/header.jsx'

export default class Routes extends Component {
  render () {
    return (
      <div>
        <Header />
        <main>
          <Route exact path='/' component={Events} />
          <Route exact path='/events' component={Events} />
          <Route path='/events/:id' component={Event} />

          <Route exact path='/projects' component={Projects} />
          <Route exact path='/projects/:id' component={Project} />

          <Route exact path='/releases' component={Publications} />
          <Route exact path='/releases/:id' component={Publication} />
          <Route exact path='/publications' component={Publications} />
          <Route exact path='/publications/:id' component={Publication} />

          <Route exact path='/login' component={User} />
          <Route exact path='/new/user' component={User} />
          <Route exact path='/info' component={Pages} />
          <Route exact path='/settings' component={Settings} />
        </main>
      </div>
    )
  }
}
