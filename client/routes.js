import React, { PropTypes } from 'react';
import { Route } from 'react-router-dom';
import { Header, Events, Event, Pages, Error } from './components';

const Routes = (props) => (
  <div>
    <Header />
    <Route exact path='/' component={Pages} />
    <Route exact path='/events' component={Events}/>
    <Route path='/events/:id' component={Event}/>
    <Route exact path='/pages' component={Pages}/>
  </div>
);

export default Routes;