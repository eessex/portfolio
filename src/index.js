import mongoose from 'mongoose'
const { MONGODB_URI, PORT } = process.env
const app = require('./app')

mongoose.Promise = global.Promise

mongoose.connect(
  MONGODB_URI,
  { useMongoClient: true }
).then(() => {
  console.log('Mongodb connected')
}).catch((err) => {
  console.log('Mongodb error', err)
})

app.listen(PORT, () => {
  console.log(`Server is listening on port:${PORT}`)
})
