const express = require('express')
const router = express.Router()

const osutils = require('node-os-utils')
const limit = 50 // in percent

const config = require('../config/index')

// initialize sequelize
const db = require('../models/index')
const Album = require('../models/album')(db.sequelize, db.Sequelize.DataTypes)

// for upload and read file
const fs = require('fs').promises
const formidable = require('formidable')
const path = require('path')

/* eslint no-useless-catch: "error" */
async function uploader (srcPath, dstPath) {
  try {
    const srcFile = await fs.readFile(srcPath)
    await fs.writeFile(dstPath, srcFile)
  } catch (error) {
    console.log('error : ' + error)
    return false
  }
  return true
}

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
    res.status(500).json({ message: 'ERROR' })
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
    res.status(500).json({ message: 'ERROR' })
  }
})

// TODO: better to put in controllers/logics/helpers modules
router.put(config.api.prefix, async (req, res) => {
  try {
    const formPost = formidable({ multiples: true })
    await formPost.parse(req, async (err, fields, files, next) => {
      if (err) {
        next(err)
        return
      }

      let albumName = ''
      if (fields.album) {
        albumName = fields.album.toLowerCase()
      }
      // TODO: if saveToPath not exist create folder
      const saveToPath = path.join(config.albumPath, albumName) + '/'

      if (files.documents && files.documents.length > 0) {
        files.documents.map(async (srcFile) => {
          // TODO: clean up malicious file name (slash, dot, etc)
          const dstPath = saveToPath + srcFile.name
          console.log(srcFile.name + ':' + srcFile.type)

          // upload image in documents
          const results = await uploader(srcFile.path, dstPath)
          if (results) {
            const response = { message: 'OK' }
            res.status(200).json(response)
          } else {
            // TODO: clean up last uploaded images
            const response = { message: 'ERROR' }
            res.status(500).json(response)
          }
        })
      }
    })
  } catch (error) {
    console.log('error : ' + error)
    res.status(500).json({ message: 'ERROR' })
  }
})

module.exports = router
