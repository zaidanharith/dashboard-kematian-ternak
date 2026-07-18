const request = require('supertest');
const app = require('../../app');

describe('GET /api', () => {
  it('returns the API self-documentation payload', async () => {
    const res = await request(app).get('/api/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ routes: expect.any(Array) }),
      }),
    );
  });
});

describe('GET /api/users/me', () => {
  it('returns 401 without an authorization header', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false }));
  });
});
