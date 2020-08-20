const config = require('../config/index')

module.exports = async (AlbumMod, documents, headers, album, saveToPath) => {
  try {
    // TODO: clean up malicious file name (slash, dots, etc)
    const dstPath = saveToPath + documents.name

    // TODO: mime check
    console.log(documents.name + ':' + documents.type)

    // upload images from multipart file (documents) to dstPath
    await AlbumMod.upload(documents.path, dstPath)

    // album can be exist or not
    let albumExist = ''
    if (album) {
      albumExist = album + '/'
    }

    // upload image in documents to dstPath
    return {
      album: album,
      name: documents.name,
      path: config.albumPath.replace('.', '') + '/' + albumExist + documents.name,
      raw: config.api.protocol + '://' + headers.host + config.api.prefix + '/' +
        album.toLowerCase() + '/' + documents.name
    }
  } catch (error) {
    return null
  }
}
