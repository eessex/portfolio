import React from 'react';
import { Route } from 'react-router-dom';
import { Header, Events, Pages, Error } from './components';

const Routes = () => (
  <div>
    <Header />
    <Route exact path='/' component={Pages} />
    <Route path='/events' component={Events}/>
    <Route path='/pages' component={Pages}/>
  </div>
);

export default Routes;