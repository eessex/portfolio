import { Home } from 'client/apps/Home/Home'
// import { fetchItem } from 'client/actions/item'
import { fetchItems } from 'client/actions/items2'
// import Item from 'client/Apps/Item/Item'
import Items from 'client/apps/Items/Items'
import Page from 'client/apps/pages/Page'

const routes = [
  {
    path: '/',
    exact: true,
    component: Home,
    title: 'Home'
  },
  // {
  // path: '/events/:id',
  // model: 'events',
  // component: Home,
  // component: Item,
  // fetchInitialData: (path = '', store) => {
  //   return store.dispatch(fetchItem('events', path.split('/').pop()))
  // }
  // },
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
    model: 'page',
    title: 'Info'
    // fetchInitialData: (path = '', store) => {
    //   return store.dispatch(fetchItems('settings'))
    // }
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
