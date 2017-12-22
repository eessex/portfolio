import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import {
  Error,
  Event,
  Events,
  Pages,
  Project,
  Projects,
  Publications,
  Settings,
  User
} from './apps'
import { ComingSoon } from './components/coming_soon.jsx'
import Header from './components/header/header.jsx'


export default class Routes extends Component {
  render () {
    return (
      <div>
        <Header />
        <main>
          <Route exact path='/' component={Events} />
          <Route exact path='/events' component={Events}/>
          <Route path='/events/:id' component={Event}/>
          <Route exact path='/projects' component={Projects}/>
          <Route exact path='/projects/:id' component={Project}/>
          <Route exact path='/releases' component={Publications}/>
          <Route exact path='/login' component={User}/>
          <Route exact path='/new/user' component={User}/>
          <Route exact path='/info' component={Pages}/>
          <Route exact path='/settings' component={Settings}/>
        </main>
      </div>
    )
  } 
}
