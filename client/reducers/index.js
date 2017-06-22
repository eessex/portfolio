import { combineReducers } from 'redux';
import eventsReducer from './events';
import eventReducer from './event';
import userReducer from './user';

const rootReducer = combineReducers({
  events: eventsReducer,
  event: eventReducer,
  user: userReducer
});

export default rootReducer;