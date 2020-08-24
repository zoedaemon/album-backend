'use strict'
const fs = require('fs').promises

module.exports = class Album {
  // static function (data) {
  // define association here
  // }
  // upload file asnycronously
  static async upload (srcPath, dstPath) {
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
  static async createDirIfNotExist (path) {
    try {
      const stats = await fs.lstat(path)
      if (stats.isDirectory()) {
        ;// do nothing if is correct dir
      }
    } catch {
      await fs.mkdir(path)
    }
  }

  static async storeData (albumModels, objToStore) {
    try {
      // get all album data
      let result = null
      if (objToStore.length > 1) {
        result = await albumModels.bulkCreate(objToStore)
      } else if (objToStore.length === 1) {
        result = await albumModels.create(objToStore[0])
      } else {
        throw new Error('invalid object to store')
      }
      // console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return error
    }
  }

  static async deleteSingleDataPhotos (filePathToDelete) {
    try {
      // TODO: check if file actually exist
      const stats = await fs.lstat(filePathToDelete)
      if (stats.isFile()) {
        // delete photos
        await fs.unlink(filePathToDelete)
        // TODO remove from database
        return true
      } else {
        return new Error('not existing file')
      }
    } catch (error) {
      console.log(error)
      return error
    }
  }
}
