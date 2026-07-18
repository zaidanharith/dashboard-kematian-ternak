jest.mock('../../database/connections/prisma_client', () => ({
  peternak: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
}));

const prisma = require('../../database/connections/prisma_client');
const peternakController = require('../../controllers/peternak.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllPeternak', () => {
  it('returns all peternak with their ternak included', async () => {
    prisma.peternak.findMany.mockResolvedValue([{ id: 'p1', nama: 'Pak Slamet', ternak: [] }]);
    const req = { query: {} };
    const res = buildRes();

    await peternakController.getAllPeternak(req, res);

    expect(prisma.peternak.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { ternak: true } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('filters by search term when provided', async () => {
    prisma.peternak.findMany.mockResolvedValue([]);
    const req = { query: { search: 'Slamet' } };
    const res = buildRes();

    await peternakController.getAllPeternak(req, res);

    expect(prisma.peternak.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { nama: { contains: 'Slamet', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
  });
});

describe('getPeternakById', () => {
  it('returns 404 when peternak does not exist', async () => {
    prisma.peternak.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await peternakController.getPeternakById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns the peternak when found', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'p1', nama: 'Pak Slamet' });
    const req = { params: { id: 'p1' } };
    const res = buildRes();

    await peternakController.getPeternakById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('createPeternak', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = { body: { nama: 'Pak Slamet' } };
    const res = buildRes();

    await peternakController.createPeternak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.peternak.create).not.toHaveBeenCalled();
  });

  it('creates a peternak when all fields are present', async () => {
    const payload = {
      nama: 'Pak Slamet', nik: '123', alamat: 'Jl. Mawar', telepon: '0812', dusun: 'Krajan', rt: '01', rw: '02',
    };
    prisma.peternak.create.mockResolvedValue({ id: 'p1', ...payload });
    const req = { body: payload };
    const res = buildRes();

    await peternakController.createPeternak(req, res);

    expect(prisma.peternak.create).toHaveBeenCalledWith({ data: payload });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when NIK is already taken', async () => {
    const error = new Error('unique constraint');
    error.code = 'P2002';
    prisma.peternak.create.mockRejectedValue(error);
    const req = {
      body: { nama: 'Pak Slamet', nik: '123', alamat: 'Jl. Mawar', telepon: '0812', dusun: 'Krajan', rt: '01', rw: '02' },
    };
    const res = buildRes();

    await peternakController.createPeternak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('NIK') }),
    );
  });
});

describe('deletePeternak', () => {
  it('returns 404 when peternak does not exist', async () => {
    const error = new Error('not found');
    error.code = 'P2025';
    prisma.peternak.delete.mockRejectedValue(error);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await peternakController.deletePeternak(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes the peternak successfully', async () => {
    prisma.peternak.delete.mockResolvedValue({ id: 'p1' });
    const req = { params: { id: 'p1' } };
    const res = buildRes();

    await peternakController.deletePeternak(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
