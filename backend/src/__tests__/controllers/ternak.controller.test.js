jest.mock('../../database/connections/prisma_client', () => ({
  ternak: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  peternak: { findUnique: jest.fn() },
  jenisTernak: { findUnique: jest.fn() },
}));

const prisma = require('../../database/connections/prisma_client');
const ternakController = require('../../controllers/ternak.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

const validPayload = {
  kodeTernak: 'SAPI-001',
  jenisTernakId: 'jenis-1',
  peternakId: 'peternak-1',
  jenisKelamin: 'JANTAN',
  tanggalLahir: '2022-01-15',
};

describe('createTernak', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = { body: { kodeTernak: 'SAPI-001' } };
    const res = buildRes();

    await ternakController.createTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.ternak.create).not.toHaveBeenCalled();
  });

  it('returns 400 when jenisKelamin is not JANTAN or BETINA', async () => {
    const req = { body: { ...validPayload, jenisKelamin: 'TIDAK_VALID' } };
    const res = buildRes();

    await ternakController.createTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when peternak does not exist', async () => {
    prisma.peternak.findUnique.mockResolvedValue(null);
    const req = { body: validPayload };
    const res = buildRes();

    await ternakController.createTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.ternak.create).not.toHaveBeenCalled();
  });

  it('returns 400 when jenis ternak does not exist', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'peternak-1' });
    prisma.jenisTernak.findUnique.mockResolvedValue(null);
    const req = { body: validPayload };
    const res = buildRes();

    await ternakController.createTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.ternak.create).not.toHaveBeenCalled();
  });

  it('creates the ternak when all references exist', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'peternak-1' });
    prisma.jenisTernak.findUnique.mockResolvedValue({ id: 'jenis-1' });
    prisma.ternak.create.mockResolvedValue({ id: 'ternak-1', ...validPayload, status: 'HIDUP' });
    const req = { body: validPayload };
    const res = buildRes();

    await ternakController.createTernak(req, res);

    expect(prisma.ternak.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kodeTernak: 'SAPI-001', tanggalLahir: expect.any(Date) }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when kodeTernak is already used', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'peternak-1' });
    prisma.jenisTernak.findUnique.mockResolvedValue({ id: 'jenis-1' });
    const error = new Error('unique constraint');
    error.code = 'P2002';
    prisma.ternak.create.mockRejectedValue(error);
    const req = { body: validPayload };
    const res = buildRes();

    await ternakController.createTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('deleteTernak', () => {
  it('returns 400 when ternak still has related laporan kematian', async () => {
    const error = new Error('foreign key constraint');
    error.code = 'P2003';
    prisma.ternak.delete.mockRejectedValue(error);
    const req = { params: { id: 'ternak-1' } };
    const res = buildRes();

    await ternakController.deleteTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('laporan kematian') }),
    );
  });

  it('returns 404 when ternak does not exist', async () => {
    const error = new Error('not found');
    error.code = 'P2025';
    prisma.ternak.delete.mockRejectedValue(error);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await ternakController.deleteTernak(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
