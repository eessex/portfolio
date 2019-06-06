export const logMiddleware = (_redux) => next => action => {
  console.log(`${action.type}`)
  next(action)
}
