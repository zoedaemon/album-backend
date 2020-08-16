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
  let status = 'OK'
  try {
    // TODO: mock high CPU usage
    osutils.cpu.usage().then(info => {
      console.log('CPU Usage (%): ' + info)
      if (info > limit) {
        console.log(`CPU Usage Over ${limit}% !`)
        status = 'WARN'
        res.status(503).json({ message: status })
      } else {
        res.status(200).json({ message: status })
      }
    })
  } catch (error) {
    console.log('error : ' + error)
    res.status(400).json({ message: 'ERROR' })
  }
})

router.post(config.api.prefix + '/list', async (req, res) => {
  try {
    // get all album data
    const result = await Album.findAll({
      attributes: ['id', 'album', 'name', 'path', 'raw']
    })
    const response = { message: 'OK', documents: result }
    res.status(200).json(response)
  } catch (error) {
    console.log('error : ' + error)
    res.status(400).json({ message: 'ERROR' })
  }
})

module.exports = router
