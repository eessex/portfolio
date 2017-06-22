import React, { PropTypes } from 'react';
import { Route } from 'react-router-dom';
import { Header, Events, Event, Pages, User, Error } from './apps';

const Routes = (props) => (
  <div>
    <Header
    	isAuthenticated={window.store.getState().user.isAuthenticated}/>
    <Route exact path='/' component={User} />
    <Route exact path='/events' component={Events}/>
    <Route path='/events/:id' component={Event}/>
    <Route exact path='/pages' component={Pages}/>
  </div>
);

export default Routes;