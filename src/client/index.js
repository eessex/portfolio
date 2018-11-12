import { hydrate } from 'react-dom'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import React from 'react'
import Cookies from 'universal-cookie'
import { App } from 'client/App'
import createStore from 'client/utils/store'

const cookies = new Cookies()
const session = cookies.get('portfolio.session')

const { store, history } = createStore({ session })

hydrate(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>
  , document.getElementById('app')
)
