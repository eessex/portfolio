import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Events, Pages } from './components';

const Routes = () => (
  <div>
    <Link to="/">Home</Link>
    <Link to="/events">Events</Link>
    <Link to="/pages">Pages</Link>
    <Route path='/events' component={Events}/>
    <Route path='/pages' component={Pages}/>
    <Route exact path='/' component={Pages} />
  </div>
);

export default Routes;