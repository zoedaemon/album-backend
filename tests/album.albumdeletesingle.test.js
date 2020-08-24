const request = require('supertest')
const fs = require('mz/fs')
const app = require('../src/app')
const config = require('../src/config/index')
const db = require('../src/models/index')

describe('PUT + ' + config.api.prefix, () => {
  const testDirName = 'uploadTestSamples'
  const albumName = 'universe'
  const dirPath = `${__dirname}/${testDirName}`
  const fileName = 'Great-Observatories.jpg'
  const filePath = dirPath + '/' + fileName

  // prepare uploaded image before test
  beforeEach(async () => {
    console.log(filePath)
    // Test if the test file is exist
    await fs.exists(filePath)
      .then(async (exists) => {
        if (!exists) {
          throw new Error('file does not exist')
        }

        const res = await request(app)
          .put(config.api.prefix)
          .field('album', albumName)
          .attach('documents', filePath)
        expect(res.statusCode).toEqual(200)
        const { message, data } = res.body
        expect(message).toBe('OK')
        expect(data.length).toBe(1)

        // path to compare
        const path = config.albumPath.replace('.', '') + '/' + albumName + '/' + fileName
        expect(data[0].path).toBe(path)
      })
    return true
  })

  // after all test done
  // TODO: clean up all files test that has been successfully uploaded
  afterAll(() => db.sequelize.close())

  // positive test
  it('should OK to delete 1 image', async () => {
    const endpointFileToDelete = config.api.prefix + '/' + albumName + '/' + fileName
    const res = await request(app)
      .delete(endpointFileToDelete)

    expect(res.statusCode).toEqual(200)
    const { message } = res.body
    expect(message).toBe('OK')
  })
})
