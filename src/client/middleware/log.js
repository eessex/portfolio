const logMiddleware = ({ getState, dispatch }) => (next) => (action) => {
  console.log(`${action.type}`)
  next(action)
}

export default logMiddleware
