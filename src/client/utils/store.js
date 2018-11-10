import apiMiddleware from 'client/middleware/api'
import { logMiddleware } from 'client/middleware/log'
import { applyMiddleware, createStore, compose } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import { createBrowserHistory, createMemoryHistory } from 'history'
import rootReducer from 'client/reducers'

export const isServer = !(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

export default ({ entry, session }) => {
  const history = isServer
    ? createMemoryHistory({ initialEntries: [entry || '/'] })
    : createBrowserHistory()

  const enhancers = []

  if (process.env.NODE_ENV === 'development' && !isServer) {
    const devToolsExtension = window.devToolsExtension

    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension())
    }
  }

  const middleware = [
    thunk,
    logMiddleware,
    apiMiddleware,
    routerMiddleware(history)
  ]

  const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
  )

  const initialState = !isServer ? window.__INITIAL_DATA__ : {
    userReducer: {
      isAuthenticated: session && true,
      session
    }
  }

  if (!isServer) {
    delete window.__INITIAL_DATA__
  }

  const store = createStore(
    connectRouter(history)(rootReducer),
    initialState,
    composedEnhancers
  )

  return {
    store,
    history
  }
}
