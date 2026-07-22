jest.mock('../../database/connections/prisma_client', () => ({
  laporanKelahiran: {
    findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(),
  },
  ternak: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  peternak: { findUnique: jest.fn() },
  jenisTernak: { findUnique: jest.fn() },
  $transaction: jest.fn(),
}));

jest.mock('../../services/akta-kelahiran.service', () => ({
  generateAktaKelahiranDocx: jest.fn(),
  generateAktaKelahiranPdf: jest.fn(),
}));

const prisma = require('../../database/connections/prisma_client');
const { generateAktaKelahiranDocx, generateAktaKelahiranPdf } = require('../../services/akta-kelahiran.service');
const laporanKelahiranController = require('../../controllers/laporan-kelahiran.controller');

function buildRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    send: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  prisma.$transaction.mockImplementation((callback) => callback(prisma));
});

describe('createLaporanKelahiran', () => {
  const validBody = {
    peternakId: 'peternak-1',
    jenisTernakId: 'jenis-1',
    kodeTernak: 'KAMBING-002',
    jenisKelamin: 'BETINA',
    tanggalLahir: '2026-07-15',
  };

  it('returns 400 when required fields are missing', async () => {
    const req = { body: {}, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKelahiranController.createLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 when jenisKelamin is invalid', async () => {
    const req = { body: { ...validBody, jenisKelamin: 'X' }, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKelahiranController.createLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 when peternak does not exist', async () => {
    prisma.peternak.findUnique.mockResolvedValue(null);
    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKelahiranController.createLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 when jenis ternak does not exist', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'peternak-1' });
    prisma.jenisTernak.findUnique.mockResolvedValue(null);
    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKelahiranController.createLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates the ternak and laporan kelahiran in a single transaction', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'peternak-1' });
    prisma.jenisTernak.findUnique.mockResolvedValue({ id: 'jenis-1' });
    prisma.ternak.create.mockResolvedValue({ id: 'ternak-1' });
    const createdLaporan = { id: 'laporan-1', ternakId: 'ternak-1' };
    prisma.laporanKelahiran.create.mockResolvedValue(createdLaporan);

    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKelahiranController.createLaporanKelahiran(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.ternak.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ kodeTernak: 'KAMBING-002', peternakId: 'peternak-1' }) }),
    );
    expect(prisma.laporanKelahiran.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ternakId: 'ternak-1', petugasId: 'petugas-1' }) }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { laporan: createdLaporan } }),
    );
  });

  it('returns 400 when kodeTernak is already used', async () => {
    prisma.peternak.findUnique.mockResolvedValue({ id: 'peternak-1' });
    prisma.jenisTernak.findUnique.mockResolvedValue({ id: 'jenis-1' });
    const error = new Error('unique constraint');
    error.code = 'P2002';
    prisma.ternak.create.mockRejectedValue(error);

    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKelahiranController.createLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Kode ternak') }),
    );
  });
});

describe('updateLaporanKelahiran', () => {
  it('updates catatan and nomorAkta without touching the ternak', async () => {
    prisma.laporanKelahiran.update.mockResolvedValue({ id: 'laporan-1', ternakId: 'ternak-1' });
    const req = {
      params: { id: 'laporan-1' },
      body: { catatan: 'Sehat', nomorAkta: '002' },
    };
    const res = buildRes();

    await laporanKelahiranController.updateLaporanKelahiran(req, res);

    expect(prisma.ternak.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('syncs the ternak tanggalLahir when it is changed', async () => {
    prisma.laporanKelahiran.update.mockResolvedValue({ id: 'laporan-1', ternakId: 'ternak-1' });
    const req = {
      params: { id: 'laporan-1' },
      body: { tanggalLahir: '2026-07-01' },
    };
    const res = buildRes();

    await laporanKelahiranController.updateLaporanKelahiran(req, res);

    expect(prisma.ternak.update).toHaveBeenCalledWith({
      where: { id: 'ternak-1' },
      data: { tanggalLahir: new Date('2026-07-01') },
    });
  });

  it('returns 404 when laporan does not exist', async () => {
    const error = new Error('not found');
    error.code = 'P2025';
    prisma.laporanKelahiran.update.mockRejectedValue(error);
    const req = { params: { id: 'missing' }, body: { catatan: 'x' } };
    const res = buildRes();

    await laporanKelahiranController.updateLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('getAkta', () => {
  const laporan = {
    id: 'laporan-1',
    nomorAkta: null,
    ternak: { kodeTernak: 'KAMBING-002' },
  };

  it('returns 404 when laporan does not exist', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'missing' }, query: {} };
    const res = buildRes();

    await laporanKelahiranController.getAkta(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns docx by default with the correct content type', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue(laporan);
    generateAktaKelahiranDocx.mockReturnValue(Buffer.from('docx-content'));

    const req = { params: { id: 'laporan-1' }, query: {} };
    const res = buildRes();

    await laporanKelahiranController.getAkta(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(generateAktaKelahiranPdf).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(Buffer.from('docx-content'));
  });

  it('returns pdf when format=pdf is requested', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue(laporan);
    generateAktaKelahiranPdf.mockResolvedValue(Buffer.from('pdf-content'));

    const req = { params: { id: 'laporan-1' }, query: { format: 'pdf' } };
    const res = buildRes();

    await laporanKelahiranController.getAkta(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(generateAktaKelahiranDocx).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(Buffer.from('pdf-content'));
  });

  it('returns 500 with a clear message when the docx template is missing', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue(laporan);
    const templateError = new Error('template not found');
    templateError.code = 'TEMPLATE_NOT_FOUND';
    generateAktaKelahiranDocx.mockImplementation(() => {
      throw templateError;
    });

    const req = { params: { id: 'laporan-1' }, query: {} };
    const res = buildRes();

    await laporanKelahiranController.getAkta(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('Template') }),
    );
  });
});

describe('deleteLaporanKelahiran', () => {
  it('returns 404 when laporan does not exist', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await laporanKelahiranController.deleteLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes the laporan and the ternak it created', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue({ id: 'laporan-1', ternakId: 'ternak-1' });

    const req = { params: { id: 'laporan-1' } };
    const res = buildRes();

    await laporanKelahiranController.deleteLaporanKelahiran(req, res);

    expect(prisma.laporanKelahiran.delete).toHaveBeenCalledWith({ where: { id: 'laporan-1' } });
    expect(prisma.ternak.delete).toHaveBeenCalledWith({ where: { id: 'ternak-1' } });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns a friendly 400 when the ternak already has a laporan kematian', async () => {
    prisma.laporanKelahiran.findUnique.mockResolvedValue({ id: 'laporan-1', ternakId: 'ternak-1' });
    const error = new Error('foreign key constraint failed');
    error.code = 'P2003';
    prisma.$transaction.mockRejectedValue(error);

    const req = { params: { id: 'laporan-1' } };
    const res = buildRes();

    await laporanKelahiranController.deleteLaporanKelahiran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('laporan kematian') }),
    );
  });
});
