import React from 'react'
import { Route } from 'react-router-dom'
import {
  Error,
  Event,
  Events,
  Header,
  Pages,
  Project,
  Projects,
  Settings,
  User
} from './apps'

const Routes = (props) => (
  <div>
    <Header />
    <main>
      <Route exact path='/' component={Events} />
      <Route exact path='/events' component={Events}/>
      <Route path='/events/:id' component={Event}/>
      <Route exact path='/projects' component={Projects}/>
      <Route exact path='/projects/:id' component={Project}/>
      <Route exact path='/login' component={User}/>
      <Route exact path='/new/user' component={User}/>
      <Route exact path='/about' component={Pages}/>
      <Route exact path='/settings' component={Settings}/>
    </main>
   </div>
)

export default Routes
