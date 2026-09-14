const mockRecordingFetch = jest.fn();
jest.mock('../../lib/recording-client', () => ({
  recordingFetch: (...args) => mockRecordingFetch(...args),
}));

const { googleSignIn, login } = require('../../controllers/auth.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

function buildAdmin(overrides = {}) {
  return {
    id: 'admin-1',
    name: 'Test',
    email: 'test@example.com',
    avatarUrl: null,
    role: 'ADMIN',
    ...overrides,
  };
}

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when email or password is missing', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRecordingFetch).not.toHaveBeenCalled();
  });

  it('proxies to recording-ternak and forwards its error status', async () => {
    const error = new Error('Email atau password salah.');
    error.status = 401;
    error.payload = { message: 'Email atau password salah.' };
    mockRecordingFetch.mockRejectedValue(error);

    const req = { body: { email: 'nobody@example.com', password: 'password123' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Email atau password salah.' }),
    );
  });

  it('returns 200 with a token when recording-ternak confirms the credentials', async () => {
    mockRecordingFetch.mockResolvedValue({
      data: { token: 'jwt-token', admin: buildAdmin({ role: 'ADMIN' }) },
    });

    const req = { body: { email: 'test@example.com', password: 'correct-password' } };
    const res = buildRes();

    await login(req, res);

    expect(mockRecordingFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST', body: req.body }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: 'jwt-token', user: expect.objectContaining({ role: 'ADMIN' }) }),
      }),
    );
  });
});

describe('googleSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when idToken is missing', async () => {
    const req = { body: {} };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRecordingFetch).not.toHaveBeenCalled();
  });

  it('returns 200 with a token when recording-ternak confirms the Google login', async () => {
    mockRecordingFetch.mockResolvedValue({
      data: { token: 'jwt-token', admin: buildAdmin() },
    });

    const req = { body: { idToken: 'valid-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(mockRecordingFetch).toHaveBeenCalledWith(
      '/api/auth/google',
      expect.objectContaining({ method: 'POST', body: { idToken: 'valid-token' } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'jwt-token' }) }),
    );
  });

  it('forwards the error status when recording-ternak rejects the Google token', async () => {
    const error = new Error('Google ID Token tidak valid atau kedaluwarsa.');
    error.status = 401;
    error.payload = { message: 'Google ID Token tidak valid atau kedaluwarsa.' };
    mockRecordingFetch.mockRejectedValue(error);

    const req = { body: { idToken: 'bad-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
