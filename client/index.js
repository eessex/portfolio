import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import Routes from './routes'
import store from './store'
import { saveState } from './utils/local_storage.js'
import { fetchSettings } from './actions/settings'
require('./styles/index.scss')

store.subscribe(() => {
  saveState({user: store.getState().user})
})

store.dispatch(fetchSettings())

window.store = store

render(
  <Provider store={store}>
    <Router>
      <Routes store={store} />
    </Router>
  </Provider>
  , document.getElementById('app')
)
