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

// upload file asnycronously
async function uploader (srcPath, dstPath) {
  try {
    const srcFile = await fs.readFile(srcPath)
    await fs.writeFile(dstPath, srcFile)
    return '/' + dstPath
  } catch (error) {
    console.log('error : ' + error)
    return null
  }
}

// create directory asyncronously
async function createDirIfNotExist (path) {
  try {
    const stats = await fs.lstat(path)
    if (stats.isDirectory()) {
      ;// do nothing if is correct dir
    }
  } catch {
    await fs.mkdir(path)
  }
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
    // set multipart
    const formPost = formidable({ multiples: true })

    // create promise for corectly parse all data needed to upload
    const results = await new Promise((resolve, reject) => {
      formPost.parse(req, async (err, fields, files) => {
        if (err) {
          reject(err)
          return
        }

        let albumName = ''
        if (fields.album) {
          albumName = fields.album.toLowerCase()
        }

        // DONE: if saveToPath not exist create directory
        const saveToPath = path.join(config.albumPath, albumName) + '/'
        await createDirIfNotExist(saveToPath)

        if (files.documents) {

          if (files.documents.length > 0) {
            let resultRaw = []
            // doing parallel upload
            const resultsPromises = files.documents.map(async (srcFile) => {
              // TODO: clean up malicious file name (slash, dots, etc)
              const dstPath = saveToPath + srcFile.name

              // TODO: mime check
              console.log(srcFile.name + ':' + srcFile.type)

              // upload image in documents to dstPath
              return { path: await uploader(srcFile.path, dstPath) }
            })

            // log & assign sequentially
            for (const resultsPromise of resultsPromises) {
              const r = await resultsPromise
              console.log(r)
              resultRaw.push(r)
            }
            resolve(resultRaw)
          } else {
            // TODO: clean up malicious file name (slash, dots, etc)
            const dstPath = saveToPath + files.documents.name

            // TODO: mime check
            console.log(files.documents.name + ':' + files.documents.type)

            // upload image in documents to dstPath
            const resultRaw = [{ path: await uploader(files.documents.path, dstPath) }]
            resolve(resultRaw)
          }
        } else {
          resolve(null)
        }
      })
    })

    // check results
    if (results && results.length > 0) {
      const response = { message: 'OK', data: results }
      res.status(200).json(response)
    } else {
      const response = { message: 'ERROR' }
      res.status(500).json(response)
    }
  } catch (error) {
    console.log('error : ' + error)
    res.status(500).json({ message: 'ERROR' })
  }
})

module.exports = router
