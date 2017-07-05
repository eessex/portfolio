import React, { PropTypes } from 'react';
import { Route } from 'react-router-dom';
import { Header, Events, Event, Pages, User, Error } from './apps';

const Routes = (props) => (
  <div>
    <Header />
    <main>
      <Route exact path='/' component={Events} />
      <Route exact path='/events' component={Events}/>
      <Route path='/events/:id' component={Event}/>
      <Route exact path='/login' component={User}/>
      <Route exact path='/pages' component={Pages}/>
    </main>
   </div>
);

export default Routes;