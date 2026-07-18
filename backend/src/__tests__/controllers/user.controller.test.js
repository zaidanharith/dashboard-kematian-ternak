jest.mock('../../database/connections/prisma_client', () => ({
  user: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), create: jest.fn() },
}));

const prisma = require('../../database/connections/prisma_client');
const { getMe, updateMe, getAllUsers, registerUser } = require('../../controllers/user.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('getMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the authenticated user data', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: null,
      role: 'PETUGAS',
    });
    const req = { user: { id: 'user-1' } };
    const res = buildRes();

    await getMe(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { user: expect.objectContaining({ id: 'user-1' }) } }),
    );
  });

  it('returns 404 when the user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const req = { user: { id: 'deleted-user' } };
    const res = buildRes();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 500 with error envelope when prisma throws', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('db down'));
    const req = { user: { id: 'user-1' } };
    const res = buildRes();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'db down' }),
    );
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
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('updates the user name and returns the updated user', async () => {
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      name: 'New Name',
      email: 'test@example.com',
      avatarUrl: null,
      role: 'PETUGAS',
    });
    const req = { user: { id: 'user-1' }, body: { name: 'New Name' } };
    const res = buildRes();

    await updateMe(req, res);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'New Name' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getAllUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the list of users without exposing password hashes', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'user-1', name: 'A', email: 'a@example.com', avatarUrl: null, role: 'ADMIN', password: 'hashed', createdAt: new Date() },
    ]);
    const req = {};
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
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 400 when role is not ADMIN or PETUGAS', async () => {
    const req = {
      body: { name: 'New User', email: 'new@example.com', password: 'password123', role: 'SUPERADMIN' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const req = {
      body: { name: 'New User', email: 'new@example.com', password: 'short', role: 'PETUGAS' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 400 when email is already registered', async () => {
    const error = new Error('unique constraint');
    error.code = 'P2002';
    prisma.user.create.mockRejectedValue(error);
    const req = {
      body: { name: 'New User', email: 'taken@example.com', password: 'password123', role: 'PETUGAS' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates an ADMIN/PETUGAS account with a hashed password', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-2', name: 'New User', email: 'new@example.com', avatarUrl: null, role: 'PETUGAS',
    });
    const req = {
      body: { name: 'New User', email: 'new@example.com', password: 'password123', role: 'PETUGAS' },
    };
    const res = buildRes();

    await registerUser(req, res);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'new@example.com', role: 'PETUGAS' }),
      }),
    );
    const createCallArgs = prisma.user.create.mock.calls[0][0];
    expect(createCallArgs.data.password).not.toBe('password123');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { user: expect.not.objectContaining({ password: expect.anything() }) } }),
    );
  });
});
