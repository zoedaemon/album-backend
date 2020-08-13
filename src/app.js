const express = require('express')
const port = process.env.PORT
const albumRouter = require('./routers/album')

const app = express()

app.use(express.json())
app.use(albumRouter)

if (process.env && process.env.NODE_ENV != 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}

module.exports = app