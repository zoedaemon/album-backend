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
}
