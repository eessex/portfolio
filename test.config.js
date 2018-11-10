const Adapter = require('enzyme-adapter-react-16')
const Enzyme = require('enzyme')

Enzyme.configure({
  adapter: new Adapter()
})

require('dotenv').config({
  path: require('path').join(process.cwd(), '.env.example')
})
