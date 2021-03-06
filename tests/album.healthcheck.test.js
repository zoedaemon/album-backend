const request = require('supertest')
const app = require('../src/app')
const db = require('../src/models/index')

describe('GET /health', () => {
  /* if still error : "A worker process has failed to exit gracefully and has been force exited.
  This is likely caused by tests leaking due to improper teardown.
  Try running with --runInBand --detectOpenHandles to find leaks."
  ...please see this issue https://github.com/sequelize/sequelize/issues/6758
  */
  afterAll(() => db.sequelize.close())

  it('should OK', async () => {
    const res = await request(app)
      .get('/health')
      .send()
    expect(res.statusCode).toEqual(200)
  })
})
