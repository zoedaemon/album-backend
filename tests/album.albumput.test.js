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
})
