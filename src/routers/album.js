const express = require('express')
const router = express.Router()

const osutils = require('node-os-utils')
const limit = 50 // in percent

const config = require('../config/index')

// initialize sequelize
const db = require('../models/index')
const Album = require('../models/album')(db.sequelize, db.Sequelize.DataTypes)
const AlbumMod = require('../modules/album')

// for upload and read file
const formidable = require('formidable')
const path = require('path')

const AlbumUploadHelper = async (documents, headers, album, saveToPath) => {
  // TODO: clean up malicious file name (slash, dots, etc)
  const dstPath = saveToPath + documents.name
  // TODO: mime check
  console.log(documents.name + ':' + documents.type)
  // upload image in documents to dstPath
  return {
    album: album,
    name: documents.name,
    path: await AlbumMod.upload(documents.path, dstPath),
    raw: config.api.protocol + '://' + headers.host + '/' + config.api.prefix + '/' +
      album + '/' + documents.name
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

        // allow empty albumname so file uploaded to root dir (i.e. ./albums)
        let albumName = ''
        if (fields.album) {
          albumName = fields.album.toLowerCase()
        }

        // DONE: if saveToPath not exist create directory
        const saveToPath = path.join(config.albumPath, albumName) + '/'
        await AlbumMod.createDirIfNotExist(saveToPath)

        if (files.documents) {
          if (files.documents.length > 0) {
            const resultRaw = []
            // doing parallel upload
            const resultsPromises = files.documents.map(async (srcFile) => {
              // upload image
              return AlbumUploadHelper(srcFile, req.headers, albumName, saveToPath)
            })

            // log & assign sequentially
            for (const resultsPromise of resultsPromises) {
              const r = await resultsPromise
              // console.log(r)
              resultRaw.push(r)
            }
            resolve(resultRaw)
          } else {
            // upload image - generalize the data output which is type of array
            //                even with 1 file
            const resultRaw = []
            const single = await AlbumUploadHelper(files.documents, req.headers, albumName,
              saveToPath)
            resultRaw.push(single)
            resolve(resultRaw)
          }
        } else {
          resolve(null)
        }
      })
    })

    // check results
    if (results && results.length > 0) {
      // store data to db
      AlbumMod.storeData(Album, results)

      const response = { message: 'OK', data: results }
      res.status(200).json(response)
    } else {
      const response = { message: 'ERROR', detail: 'Unprocessable entity - check your fields' }
      // unprocessable entity coz put fields not correct
      res.status(422).json(response)
    }
  } catch (error) {
    console.log('error : ' + error)
    res.status(500).json({ message: 'ERROR' })
  }
})

module.exports = router
