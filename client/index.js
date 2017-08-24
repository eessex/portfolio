import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import Routes from './routes';
import store from './store';
import { saveState } from './localstorage'
import { fetchSettings } from './actions/settings'
require('./styles/index.scss');

store.subscribe(() => {
  saveState({user: store.getState().user})
  saveState({signature: store.getState().upload})
});

store.dispatch(fetchSettings())

window.store = store;

render(
      <Provider store={store}>
        <Router>
          <Routes />
        </Router>
      </Provider>
      , document.getElementById('app')
    );