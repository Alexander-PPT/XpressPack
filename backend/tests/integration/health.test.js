const request = require('supertest');
const { app } = require('../../src/app');

describe('Health endpoint', () => {
  test('GET /health returns success', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  });
});
