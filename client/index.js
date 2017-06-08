import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import Routes from './routes';
import store from './store';
import { fetchEvents } from './actions/events';

store.subscribe(() => {
  console.log('App loaded.');
});

window.store = store;

render(
      <Provider store={store}>
        <Router>
          <Routes />
        </Router>
      </Provider>
      , document.getElementById('app')
    );