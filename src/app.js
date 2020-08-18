const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression');
const albumRouter = require('./routers/album')
const config = require('./config')

const app = express()

app.use(express.json())
app.use(albumRouter)
app.use(helmet())
app.use(compression())

// dont tell to public our system
app.disable('x-powered-by')

if (process.env && process.env.NODE_ENV !== 'test') {
  // TODO: use cors by domain name in production mode -
  //        register DOMAIN variable in environment variable
  app.use(cors())
  app.options('*', cors())

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
}

module.exports = app
