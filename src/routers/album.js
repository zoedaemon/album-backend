const express = require('express')
const router = express.Router()

const osutils = require('node-os-utils')
const limit = 50 // in percent

const config = require('../config/index')

// initialize sequelize
const db = require('../models/index')
const Album = require('../models/album')(db.sequelize, db.Sequelize.DataTypes)

// DONE : 503 for WARN, e.g. high CPU, high memory usage
// TODO : 500 for FAIL, i.e database not connected
router.get('/health', async (req, res) => {
  try {
    // TODO: mock high CPU usage
    osutils.cpu.usage().then(info => {
      console.log('CPU Usage (%): ' + info)
      if (info > limit) {
        console.log('CPU Usage Over 20%!')
        res.status(503).send('WARN')
      } else {
        res.status(200).send('OK')
      }
    })
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post(config.api.prefix + '/list', async (req, res) => {
  try {
    // get all album data
    const result = await Album.findAll({
      attributes: ['id', 'album', 'name', 'path', 'raw']
    })
    res.status(200).send(JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('error : ' + error)
    res.status(400).send(error)
  }
})

module.exports = router
