const request = require('supertest')
const fs = require('mz/fs')
const path = require('path')
const app = require('../src/app')
const config = require('../src/config/index')
const db = require('../src/models/index')
// Loading the crypto module in node.js
var crypto = require('crypto')

describe('POST + ' + config.api.prefix + '/{{Album}}/{{FileName}}', () => {
  // beforeEach(async () => {
  //   await request(app)
  //     .put(config.api.prefix)
  //     .send()
  //   return true;
  // })

  /* if still error : "A worker process has failed to exit gracefully and has been force exited.
  This is likely caused by tests leaking due to improper teardown.
  Try running with --runInBand --detectOpenHandles to find leaks."
  ...please see this issue https://github.com/sequelize/sequelize/issues/6758
  */
  afterAll(() => db.sequelize.close())

  // positive test
  it('should OK and return single raw data', async () => {
    // get current seeding value
    let res = await request(app)
      .post(config.api.prefix + '/list')
      .send()
    expect(res.statusCode).toEqual(200)

    const { message, documents } = res.body
    expect(message).toBe('OK')
    expect(documents.length).toBeGreaterThanOrEqual(1)

    // get uri and make new request for get raw image
    const uri = config.api.prefix + '/' + documents[0].album.toLowerCase() + '/' +
      documents[0].name
    console.log(uri)
    res = await request(app)
      .get(uri)
      .send()
    expect(res.statusCode).toEqual(200)

    // creating hash object
    let hash = crypto.createHash('sha1')
    // hash response data for comparing the real file in server
    const imageFromAPIHashed = hash.update(res.body, 'utf-8').digest('hex')
    console.log('imageFromAPIHashed = ' + imageFromAPIHashed)

    // Test if the real file in server is exist
    const filePath = path.join(__dirname, '../' + config.albumPath + '/' +
      documents[0].album.toLowerCase() + '/' + documents[0].name)
    console.log(filePath)
    await fs.exists(filePath)
      .then(async (exists) => {
        if (!exists) {
          throw new Error('file does not exist')
        }

        // get file real file in server and create new hash
        const realImage = fs.readFileSync(filePath)
        hash = crypto.createHash('sha1')
        const realImageHashed = hash.update(realImage, 'utf-8').digest('hex')
        console.log('realImageHash = ' + realImageHashed)

        // real check here, image from API must equal file with stored in server
        expect(imageFromAPIHashed).toEqual(realImageHashed)
      })
  })
})
