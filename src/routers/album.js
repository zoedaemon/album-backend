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

const AlbumUploadHelper = require('../helpers/album-upload')

/**
 * health check for status of API
 * path : GET /health
 * response :
 *  - 200 : {"message" : "OK"}
 *  - 503 : {"message" : "WARN"} //if system of API unhealthy
 *  - 500 : {"message" : "FAIL"} //something wrong with API
 */
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

/**
 * get list of photos that have been uploaded and still exist / not deleted
 * path : POST /{{prefix}}/list
 * response :
 *  - 200 : {"message" : "OK", "documents": [ << array of albums >> ]}
 *  - 500 : {"message" : "ERROR"} //something wrong with get list data
 */
router.post(config.api.prefix + '/list', async (req, res) => {
  try {
    // get all album data
    const result = await Album.findAll({
      attributes: ['id', 'album', 'name', 'path', 'raw'],
      offset: req.body.skip,
      limit: req.body.limit,
      order: [
        ['createdAt', 'DESC']
      ]
    })
    const response = { message: 'OK', documents: result }
    res.status(200).json(response)
  } catch (error) {
    console.log('error : ' + error)
    res.status(500).json({ message: 'ERROR' })
  }
})

/**
 * upload single or multiple photos by it's album name or none (empty album name)
 * path : PUT /{{prefix}}
 * response :
 *  - 200 : {"message" : "OK", "data": [ << array of albums >> ]}
 *  - 422 : {"message" : "ERROR"} //Unprocessable entity of invalid request fields
 *  - 500 : {"message" : "ERROR"} //something happen -- check console.log
 */
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
          albumName = fields.album
        }

        // DONE: if saveToPath not exist create directory
        const saveToPath = path.join(config.albumPath, albumName.toLowerCase()) + '/'
        await AlbumMod.createDirIfNotExist(saveToPath)

        if (files.documents) {
          // multiple files upload
          if (files.documents.length > 0) {
            const resultRaw = []
            // doing parallel upload
            const resultsPromises = files.documents.map(async (srcFile) => {
              // upload image
              return AlbumUploadHelper(AlbumMod, srcFile, req.headers, albumName, saveToPath)
            })

            // log & assign sequentially
            for (const resultsPromise of resultsPromises) {
              const r = await resultsPromise
              // console.log(r)
              resultRaw.push(r)
            }
            resolve(resultRaw)

          // single files upload
          } else {
            // upload image - generalize the data output which is type of array
            //                even with 1 file
            const resultRaw = []
            const single = await AlbumUploadHelper(AlbumMod, files.documents, req.headers,
              albumName, saveToPath)
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
      // store data to db with help of Sequelize ORM
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

/**
 * delete single existing photo
 * path : PUT /{{prefix}}/:album/:filename
 * response :
 *  - 200 : {"message" : "OK"}
 *  - 500 : {"message" : "ERROR"} //something happen -- check console.log
 */
router.delete(config.api.prefix + '/:album/:filename', async (req, res) => {
  try {
    const filePathToDelete = path.join(__dirname, '../../', config.albumPath + '/' +
      req.params.album.toLowerCase() + '/' + req.params.filename)

    if (await AlbumMod.deleteSingleDataPhotos(filePathToDelete) === true) {
      res.status(200).json({ message: 'OK' })
    } else {
      res.status(500).json({ message: 'ERROR' })
    }
  } catch (error) {
    console.log('error : ' + error)
    res.status(500).json({ message: 'ERROR' })
  }
})

/**
 * delete multiple existing photo
 * path : PUT /{{prefix}}
 * response :
 *  - 200 : {"message" : "OK"}
 *  - 500 : {"message" : "ERROR"} //something happen -- check console.log
 */
router.delete(config.api.prefix, async (req, res) => {
  try {
    // request body must not be null and have array length
    if (req.body && Array.isArray(req.body) && req.body.length > 0) {
      // use promise for simplefy error handling in multiple loop
      const deleteProcess = await new Promise((resolve, reject) => {
        // loop over array of album
        req.body.forEach(async (album) => {
          const photos = album.documents.split(',')

          // loop over array of photos
          photos.forEach(async (photo) => {
            const filePathToDelete = path.join(__dirname, '../../', config.albumPath + '/' +
            album.album.toLowerCase() + '/' + photo.trim())

            // try to delete file
            const isDeleted = await AlbumMod.deleteSingleDataPhotos(filePathToDelete)
            if (isDeleted !== true) {
              // console.log(` (${isDeleted})`)
              reject(new Error('delete operation failed for document : ' + photo))
            } else {
              resolve('OK')
            }
          })
        })
      })

      // wait all job
      Promise.all(deleteProcess).then(result => {
        const response = { message: 'OK' }
        res.status(200).json(response)
      }).catch(error => {
        console.log(error)
        res.status(500).json({ message: 'ERROR', detail: error })
      })

    } else {
      const response = { message: 'ERROR', detail: 'Unprocessable entity - check your fields' }
      res.status(422).json(response)
    }
  } catch (error) {
    console.log('error : ' + error)
    res.status(500).json({ message: 'ERROR', detail: error })
  }
})

module.exports = router
