jest.mock('../../database/connections/prisma_client', () => ({
  penyebabKematian: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
}));

const prisma = require('../../database/connections/prisma_client');
const penyebabKematianController = require('../../controllers/penyebab-kematian.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllPenyebabKematian', () => {
  it('returns the list of penyebab kematian', async () => {
    prisma.penyebabKematian.findMany.mockResolvedValue([{ id: '1', nama: 'Penyakit' }]);
    const req = {};
    const res = buildRes();

    await penyebabKematianController.getAllPenyebabKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('createPenyebabKematian', () => {
  it('returns 400 when nama is missing', async () => {
    const req = { body: {} };
    const res = buildRes();

    await penyebabKematianController.createPenyebabKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.penyebabKematian.create).not.toHaveBeenCalled();
  });

  it('creates a penyebab kematian', async () => {
    prisma.penyebabKematian.create.mockResolvedValue({ id: '1', nama: 'Penyakit' });
    const req = { body: { nama: 'Penyakit' } };
    const res = buildRes();

    await penyebabKematianController.createPenyebabKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('deletePenyebabKematian', () => {
  it('returns 400 when penyebab kematian is still referenced by laporan kematian', async () => {
    const error = new Error('foreign key constraint');
    error.code = 'P2003';
    prisma.penyebabKematian.delete.mockRejectedValue(error);
    const req = { params: { id: '1' } };
    const res = buildRes();

    await penyebabKematianController.deletePenyebabKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when penyebab kematian does not exist', async () => {
    const error = new Error('not found');
    error.code = 'P2025';
    prisma.penyebabKematian.delete.mockRejectedValue(error);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await penyebabKematianController.deletePenyebabKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
