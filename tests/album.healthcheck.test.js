const request = require('supertest')
const app = require('../src/app')

describe('GET /health', () => {
  it('should OK', async () => {
    const res = await request(app)
      .get('/health')
      .send()
    expect(res.statusCode).toEqual(200)
  })
})
