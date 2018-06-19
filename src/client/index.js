import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import Routes from 'client/routes'
import store from 'client/utils/store'
import { saveState } from 'client/utils/local_storage'
import { fetchSettings } from 'client/actions/settings'

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
