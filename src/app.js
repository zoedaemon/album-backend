const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const bodyParser = require('body-parser')
const albumRouter = require('./routers/album')
const config = require('./config')

const app = express()

// initialize cors for app; NOTE must called before routers setting
require('./helpers/cors')(app)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
// app.use(express.json())
app.use(helmet())
app.use(compression())

// NOTE: all cors setting must be set up before setting routers
app.use(albumRouter)

// dont tell to public our system
app.disable('x-powered-by')

// serve static images in albumPath
app.use(config.api.prefix, express.static(config.albumPath))

if (process.env && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
}

module.exports = app
