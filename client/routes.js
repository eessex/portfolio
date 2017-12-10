import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import Waypoint from 'react-waypoint'
import {
  Error,
  Event,
  Events,
  Pages,
  Project,
  Projects,
  Settings,
  User
} from './apps'

import Header from './components/header/header.jsx'


export default class Routes extends Component {
  state = {
    navOpen: true
  }

  onWaypointEnter = () => {
    console.log('onWaypointEnter')
  }

  onWaypointLeave = () => {
    console.log('onWaypointLeave')
  }

  render () {
    return (
      <div>
        <Header />
          <Waypoint
            onEnter={this.onWaypointEnter}
            onLeave={this.onWaypointLeave}
          >
                  <main>
            <Route exact path='/' component={Events} />
            <Route exact path='/events' component={Events}/>
            <Route path='/events/:id' component={Event}/>
            <Route exact path='/projects' component={Projects}/>
            <Route exact path='/projects/:id' component={Project}/>
            <Route exact path='/login' component={User}/>
            <Route exact path='/new/user' component={User}/>
            <Route exact path='/info' component={Pages}/>
            <Route exact path='/settings' component={Settings}/>
            </main>
          </Waypoint>
      </div>
    )
  } 
}

// export default Routes
