import { fetchItem } from 'client/actions/item2'
import { fetchItems } from 'client/actions/items2'
import { fetchPage } from 'client/actions/page'
import Item from 'client/apps/Item/Item'
import Items from 'client/apps/Items/Items'
import Page from 'client/apps/pages/Page'

const routes = [
  {
    path: '/',
    exact: true,
    component: Page,
    title: 'Home',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchPage('/home'))
    }
  },
  {
    path: '/events/:id',
    model: 'events',
    component: Item,
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/events', path.split('/').pop()))
    }
  },
  {
    path: '/events',
    component: Items,
    model: 'events',
    title: 'Events',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItems(path))
    }
  },
  {
    path: '/info',
    component: Page,
    title: 'Info',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchPage(path))
    }
  },
  {
    path: '/projects/:id',
    model: 'projects',
    component: Item,
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/projects', path.split('/').pop()))
    }
  },
  {
    path: '/projects',
    component: Items,
    model: 'projects',
    title: 'Projects',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItems(path))
    }
  },
  {
    path: '/releases/:id',
    model: 'publications',
    component: Item,
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItem('/publications', path.split('/').pop()))
    }
  },
  {
    path: '/releases',
    component: Items,
    model: 'publications',
    title: 'Releases',
    fetchInitialData: (path = '', store) => {
      return store.dispatch(fetchItems('/publications'))
    }
  }
]

export default routes
