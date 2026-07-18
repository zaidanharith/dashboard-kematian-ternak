jest.mock('../../database/connections/prisma_client', () => ({
  user: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
}));

const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

const bcrypt = require('bcryptjs');
const prisma = require('../../database/connections/prisma_client');
const { googleSignIn, login } = require('../../controllers/auth.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('googleSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when idToken is missing', async () => {
    const req = { body: {} };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 401 when Google ID token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('invalid token'));
    const req = { body: { idToken: 'bad-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when Google account email is not verified', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-1',
        name: 'Test User',
        email: 'test@example.com',
        email_verified: false,
      }),
    });
    const req = { body: { idToken: 'valid-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates a new user when no existing user matches googleId or email', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-1',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'http://avatar.example.com/1.png',
        email_verified: true,
      }),
    });
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'http://avatar.example.com/1.png',
      role: 'PETUGAS',
    });

    const req = { body: { idToken: 'valid-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ googleId: 'google-1' }) }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: expect.any(String) }),
      }),
    );
  });

  it('links googleId to an existing user found by email', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-1',
        name: 'Test User',
        email: 'test@example.com',
        email_verified: true,
      }),
    });
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Old Name',
      avatarUrl: null,
      role: 'PETUGAS',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Old Name',
      avatarUrl: null,
      role: 'PETUGAS',
    });

    const req = { body: { idToken: 'valid-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({ googleId: 'google-1' }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 500 with the standard error envelope when prisma throws', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-1',
        name: 'Test User',
        email: 'test@example.com',
        email_verified: true,
      }),
    });
    prisma.user.findUnique.mockRejectedValue(new Error('db down'));

    const req = { body: { idToken: 'valid-token' } };
    const res = buildRes();

    await googleSignIn(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'db down' }),
    );
  });
});

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when email or password is missing', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 401 when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const req = { body: { email: 'nobody@example.com', password: 'password123' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the user has no password set (Google-only account)', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com', password: null });
    const req = { body: { email: 'test@example.com', password: 'password123' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1', email: 'test@example.com', password: hashedPassword, name: 'Test', role: 'PETUGAS',
    });
    const req = { body: { email: 'test@example.com', password: 'wrong-password' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with a token when credentials are correct', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1', email: 'test@example.com', password: hashedPassword, name: 'Test', role: 'ADMIN', avatarUrl: null,
    });
    const req = { body: { email: 'test@example.com', password: 'correct-password' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: expect.any(String), user: expect.objectContaining({ role: 'ADMIN' }) }),
      }),
    );
  });
});
