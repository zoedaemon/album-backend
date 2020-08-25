// const cors = require('cors')
const config = require('../config')

module.exports = (app) => {
  // TODO multiple host check for cors not implemented yet, need manual test
  // var allowlist = ['http://localhost:3000/', 'http://localhost:8888', config.api.host]
  // var corsOptionsDelegate = function (req, callback) {
  //   var corsOptions
  //   if (allowlist.indexOf(req.header('Origin')) !== -1) {
  //     corsOptions = { origin: true} // reflect (enable) the requested origin in the CORS response
  //   } else {
  //     corsOptions = { origin: false } // disable CORS for this request
  //   }
  //   callback(null, corsOptions) // callback expects two parameters: error and options
  // }

  app.use(function (req, res, next) {
    // DONE: use cors by domain name in production mode -
    //       register DOMAIN variable in environment variable
    if (process.env.NODE_ENV === 'production') {
      res.header('Access-Control-Allow-Origin', config.api.protocol + '://' + config.api.host)
    } else {
      res.header('Access-Control-Allow-Origin', '*')
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, PATCH, OPTIONS')
    res.header('Access-Control-Allow-Credentials', true)
    next()
  })

  // app.use(cors(corsOptionsDelegate))
  // app.use(cors({origin: '*'}))
  // app.options('*', cors())
}
