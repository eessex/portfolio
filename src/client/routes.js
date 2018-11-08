import { fetchItem } from 'client/actions/item'
import { fetchItems } from 'client/actions/items'
import { fetchPage } from 'client/actions/page'
import Item from 'client/apps/Item/Item'
import Items from 'client/apps/Items/Items'
import Page from 'client/apps/pages/Page'
import Login from 'client/apps/user/login'

const { HOMEPAGE_ENABLED } = process.env

const getQuery = store => {
  if (!store.getState().user.isAuthenticated) {
    return { published: true }
  }
  return {}
}

const HomeRoute = {
  path: '/',
  exact: true,
  component: HOMEPAGE_ENABLED ? Page : Items,
  model: HOMEPAGE_ENABLED ? undefined : 'events',
  title: 'Home',
  fetchInitialData: (path = '', store) => {
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
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/events', path.split('/').pop(), getQuery(store)))
    }
  },
  {
    path: '/events',
    component: Items,
    model: 'events',
    title: 'Events',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItems(path, getQuery(store)))
    }
  },
  {
    path: '/info',
    component: Item,
    title: 'Info',
    model: 'pages',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/pages', path.split('/').pop(), getQuery(store)))
    }
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
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/projects', path.split('/').pop(), getQuery(store)))
    }
  },
  {
    path: '/projects',
    component: Items,
    model: 'projects',
    title: 'Projects',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItems(path, getQuery(store)))
    }
  },
  {
    path: '/releases/:id',
    model: 'publications',
    component: Item,
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/publications', path.split('/').pop(), getQuery(store)))
    }
  },
  {
    path: '/releases',
    component: Items,
    model: 'publications',
    title: 'Releases',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItems('/publications', getQuery(store)))
    }
  }
]
