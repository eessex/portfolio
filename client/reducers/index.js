import { combineReducers } from 'redux'
import eventReducer from './event'
import eventsReducer from './events'
import itemReducer from './item'
import itemsReducer from './items'
import projectsReducer from './projects'
import publicationReducer from './publication'
import publicationsReducer from './publications'
import settingsReducer from './settings'
import userReducer from './user'

const rootReducer = combineReducers({
  event: eventReducer,
  events: eventsReducer,
  item: itemReducer,
  items: itemsReducer,
  projects: projectsReducer,
  publication: publicationReducer,
  publications: publicationsReducer,
  settings: settingsReducer,
  user: userReducer
})

export default rootReducer
