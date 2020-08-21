const request = require('supertest')
const app = require('../src/app')
const config = require('../src/config/index')
const db = require('../src/models/index')

describe('POST + ' + config.api.prefix + '/list', () => {
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

  it('should OK and return list data', async () => {
    const res = await request(app)
      .post(config.api.prefix + '/list')
      .send()
    expect(res.statusCode).toEqual(200)
  })
})
