import { combineReducers } from 'redux'
import eventReducer from './event'
import eventsReducer from './events'
import projectReducer from './project'
import projectsReducer from './projects'
import settingsReducer from './settings'
import userReducer from './user'

const rootReducer = combineReducers({
  event: eventReducer,
  events: eventsReducer,
  project: projectReducer,
  projects: projectsReducer,
  settings: settingsReducer,
  user: userReducer
});

export default rootReducer
