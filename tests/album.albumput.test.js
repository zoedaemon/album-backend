const request = require('supertest')
const fs = require('mz/fs')
const app = require('../src/app')
const config = require('../src/config/index')
const db = require('../src/models/index')

describe('PUT + ' + config.api.prefix, () => {
  // prepare before test
  // beforeEach(async () => {
  //   await request(app)
  //     .put(config.api.prefix)
  //     .send()
  //   return true;
  // })

  // after all test done
  // TODO: clean up all files test that has been successfully uploaded
  afterAll(() => db.sequelize.close())

  it('should OK to upload 1 file and return response data', async () => {
    const fileName = 'Great-Observatories.jpg'
    const filePath = `${__dirname}/uploadTestSamples/` + fileName

    // Test if the test file is exist
    await fs.exists(filePath)
      .then(async (exists) => {
        if (!exists) {
          throw new Error('file does not exist')
        }

        const res = await request(app)
          .put(config.api.prefix)
          .attach('documents', filePath)
        expect(res.statusCode).toEqual(200)

        const { message, data } = res.body
        expect(message).toBe('OK')
        expect(data.length).toBe(1)
        expect(data[0].path).toBe(config.albumPath.replace('.', '') + '/' + fileName)
      })
  })

  it('should OK to upload multiple files and return responses data', async () => {
    const testDirName = 'uploadTestSamples'
    const albumName = 'universe'
    const dirPath = `${__dirname}/${testDirName}`

    // Test if the test file is exist
    await fs.exists(dirPath)
      .then(async (exists) => {
        if (!exists) {
          throw new Error('file does not exist')
        }

        // get directory and contents
        const files = await fs.readdir(dirPath)

        // build request
        const req = request(app)
          .put(config.api.prefix)
          .field('album', albumName)

        // set multipart data as files being uploaded
        for (const file of files) {
          req.attach('documents', dirPath + '/' + file)
        }

        // send request and wait for result/response
        const res = await req

        // get response and check for all condition
        expect(res.statusCode).toEqual(200)
        const { message, data } = res.body
        expect(message).toBe('OK')
        expect(data.length).toBe(2)
      })
  })
})
