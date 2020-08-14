const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const albumRouter = require('./routers/album')
const port = process.env.PORT
const app = express()

app.use(express.json())
app.use(albumRouter)
app.use(helmet())

if (process.env && process.env.NODE_ENV !== 'test') {
  // TODO: use cors by domain name in production mode -
  //        register DOMAIN variable in environment variable
  app.use(cors())
  app.options('*', cors())

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

module.exports = app
