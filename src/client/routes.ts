import { fetchItem } from 'client/actions/item'
import { fetchItems } from 'client/actions/items'
import { fetchPage } from 'client/actions/page'
import Item from 'client/apps/Item/Item'
import Items from 'client/apps/Items/Items'
import Page from 'client/apps/Page/Page'
import Login from 'client/apps/user/login'

const { HOMEPAGE_ENABLED } = process.env

const getQuery = store => {
  if (!store.getState().userReducer.isAuthenticated) {
    return { published: true }
  }
  return {}
}

const fetchInitialItem = (path = '', store, model) => {
  const param = path.split('/').pop()
  const query = getQuery(store)

  return store.dispatch(fetchItem(`/${model}`, param, query))
}

const fetchInitialItems = (_path = '', store, model) => {
  const query = getQuery(store)
  return store.dispatch(fetchItems(`/${model}`, query))
}

const HomeRoute = {
  path: '/',
  exact: true,
  component: HOMEPAGE_ENABLED ? Page : Items,
  model: HOMEPAGE_ENABLED ? undefined : 'events',
  title: 'Home',
  fetchInitialData: (_path = '', store) => {
    if (HOMEPAGE_ENABLED) {
      return store.dispatch(fetchPage('/home'))
    } else {
      return store.dispatch(fetchItems('/events', getQuery(store)))
    }
  }
}

export const routes = [
  HomeRoute,
  {
    path: '/events/:id',
    model: 'events',
    component: Item,
    fetchInitialData: fetchInitialItem
  },
  {
    path: '/events',
    component: Items,
    model: 'events',
    title: 'Events',
    fetchInitialData: fetchInitialItems
  },
  {
    path: '/info',
    component: Item,
    title: 'Info',
    model: 'pages',
    fetchInitialData: fetchInitialItem
  },
  {
    path: '/login',
    component: Login,
    title: 'Login'
  },
  {
    path: '/projects/:id',
    model: 'projects',
    component: Item,
    fetchInitialData: fetchInitialItem
  },
  {
    path: '/projects',
    component: Items,
    model: 'projects',
    title: 'Projects',
    fetchInitialData: fetchInitialItems
  },
  {
    path: '/releases/:id',
    model: 'publications',
    component: Item,
    fetchInitialData: fetchInitialItem
  },
  {
    path: '/releases',
    component: Items,
    model: 'publications',
    title: 'Releases',
    fetchInitialData: fetchInitialItems
  }
]
