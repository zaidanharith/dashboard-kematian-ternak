jest.mock('../../database/connections/prisma_client', () => ({
  jenisTernak: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
}));

const prisma = require('../../database/connections/prisma_client');
const jenisTernakController = require('../../controllers/jenis-ternak.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllJenisTernak', () => {
  it('returns the list of jenis ternak', async () => {
    prisma.jenisTernak.findMany.mockResolvedValue([{ id: '1', nama: 'Sapi' }]);
    const req = {};
    const res = buildRes();

    await jenisTernakController.getAllJenisTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { jenisTernak: [{ id: '1', nama: 'Sapi' }] } }),
    );
  });
});

describe('createJenisTernak', () => {
  it('returns 400 when nama is missing', async () => {
    const req = { body: {} };
    const res = buildRes();

    await jenisTernakController.createJenisTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.jenisTernak.create).not.toHaveBeenCalled();
  });

  it('returns 400 when nama already exists', async () => {
    const error = new Error('unique constraint');
    error.code = 'P2002';
    prisma.jenisTernak.create.mockRejectedValue(error);
    const req = { body: { nama: 'Sapi' } };
    const res = buildRes();

    await jenisTernakController.createJenisTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates a jenis ternak', async () => {
    prisma.jenisTernak.create.mockResolvedValue({ id: '1', nama: 'Sapi' });
    const req = { body: { nama: 'Sapi' } };
    const res = buildRes();

    await jenisTernakController.createJenisTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('deleteJenisTernak', () => {
  it('returns 400 when jenis ternak is still referenced by ternak', async () => {
    const error = new Error('foreign key constraint');
    error.code = 'P2003';
    prisma.jenisTernak.delete.mockRejectedValue(error);
    const req = { params: { id: '1' } };
    const res = buildRes();

    await jenisTernakController.deleteJenisTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when jenis ternak does not exist', async () => {
    const error = new Error('not found');
    error.code = 'P2025';
    prisma.jenisTernak.delete.mockRejectedValue(error);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await jenisTernakController.deleteJenisTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
