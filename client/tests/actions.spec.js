// import * as eventsActions from '../actions/events'
// import * as eventActions from '../actions/event'
// import * as types from '../actions'

// describe('actions', () => {

//   describe('Events', () => {
//     it('should create an action to fetch all events', () => {
//       var expectedAction = {
//         type: types.API,
//         payload: {
//           method: 'get',
//           url: '/events',
//           next: types.FETCH_EVENTS
//         }
//       }
//       expect(eventsActions.fetchEvents()).toEqual(expectedAction)
//     })
//   })

//   describe('Event', () => {
//     it('should create an action to fetch a single event', () => {
//       var expectedAction = {
//         type: types.API,
//         payload: {
//           method: 'get',
//           id: '123',
//           url: '/events/123',
//           next: types.FETCH_EVENT
//         }
//       }
//       expect(eventActions.fetchEvent('123')).toEqual(expectedAction)
//     })
//   })

// })