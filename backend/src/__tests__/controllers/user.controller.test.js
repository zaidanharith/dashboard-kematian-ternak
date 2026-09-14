const mockRecordingFetch = jest.fn();
jest.mock('../../lib/recording-client', () => ({
  recordingFetch: (...args) => mockRecordingFetch(...args),
}));

const { getMe, updateMe, getAllUsers, registerUser } = require('../../controllers/user.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

function buildAdmin(overrides = {}) {
  return { id: 'user-1', name: 'Test User', email: 'test@example.com', avatarUrl: null, role: 'ADMIN', ...overrides };
}

describe('getMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the authenticated user data', async () => {
    mockRecordingFetch.mockResolvedValue({ data: { admin: buildAdmin() } });
    const req = { user: { id: 'user-1' }, token: 'jwt-token' };
    const res = buildRes();

    await getMe(req, res);

    expect(mockRecordingFetch).toHaveBeenCalledWith('/api/auth/me', { token: 'jwt-token' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { user: expect.objectContaining({ id: 'user-1' }) } }),
    );
  });

  it('forwards the error status when recording-ternak fails', async () => {
    const error = new Error('Akun tidak ditemukan.');
    error.status = 404;
    error.payload = { message: 'Akun tidak ditemukan.' };
    mockRecordingFetch.mockRejectedValue(error);
    const req = { user: { id: 'deleted-user' }, token: 'jwt-token' };
    const res = buildRes();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe('updateMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when name is missing', async () => {
    const req = { user: { id: 'user-1' }, body: {} };
    const res = buildRes();

    await updateMe(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRecordingFetch).not.toHaveBeenCalled();
  });

  it('updates the user name and returns the updated user', async () => {
    mockRecordingFetch.mockResolvedValue({ data: { admin: buildAdmin({ name: 'New Name' }) } });
    const req = { user: { id: 'user-1' }, token: 'jwt-token', body: { name: 'New Name' } };
    const res = buildRes();

    await updateMe(req, res);

    expect(mockRecordingFetch).toHaveBeenCalledWith('/api/auth/me', {
      method: 'PATCH',
      token: 'jwt-token',
      body: { name: 'New Name' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getAllUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the list of users without exposing password hashes', async () => {
    mockRecordingFetch.mockResolvedValue({
      data: { admins: [buildAdmin({ password: 'hashed' })] },
    });
    const req = { token: 'jwt-token' };
    const res = buildRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data.users[0]).not.toHaveProperty('password');
  });
});

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const req = { body: { email: 'new@example.com' } };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRecordingFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when role is not ADMIN or VIEWER', async () => {
    const req = {
      body: { name: 'New User', email: 'new@example.com', password: 'password123', role: 'SUPERADMIN' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRecordingFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const req = {
      body: { name: 'New User', email: 'new@example.com', password: 'short', role: 'VIEWER' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRecordingFetch).not.toHaveBeenCalled();
  });

  it('forwards the error status when recording-ternak rejects the registration', async () => {
    const error = new Error('Email sudah terdaftar.');
    error.status = 409;
    error.payload = { message: 'Email sudah terdaftar.' };
    mockRecordingFetch.mockRejectedValue(error);
    const req = {
      token: 'jwt-token',
      body: { name: 'New User', email: 'taken@example.com', password: 'password123', role: 'VIEWER' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('creates an ADMIN/VIEWER account by proxying to recording-ternak', async () => {
    mockRecordingFetch.mockResolvedValue({
      data: { admin: buildAdmin({ id: 'user-2', name: 'New User', email: 'new@example.com', role: 'VIEWER' }) },
    });
    const req = {
      token: 'jwt-token',
      body: { name: 'New User', email: 'new@example.com', password: 'password123', role: 'VIEWER' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(mockRecordingFetch).toHaveBeenCalledWith('/api/admins', {
      method: 'POST',
      token: 'jwt-token',
      body: expect.objectContaining({ email: 'new@example.com', role: 'VIEWER', username: 'new' }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { user: expect.not.objectContaining({ password: expect.anything() }) } }),
    );
  });
});
