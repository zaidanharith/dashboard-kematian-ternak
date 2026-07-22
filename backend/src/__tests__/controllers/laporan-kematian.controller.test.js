jest.mock('../../database/connections/prisma_client', () => ({
  laporanKematian: {
    findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn(),
  },
  ternak: { findUnique: jest.fn(), update: jest.fn() },
  penyebabKematian: { findUnique: jest.fn() },
  $transaction: jest.fn(),
}));

jest.mock('../../services/berita-acara.service', () => ({
  generateBeritaAcaraDocx: jest.fn(),
  generateBeritaAcaraPdf: jest.fn(),
}));

const prisma = require('../../database/connections/prisma_client');
const { generateBeritaAcaraDocx, generateBeritaAcaraPdf } = require('../../services/berita-acara.service');
const laporanKematianController = require('../../controllers/laporan-kematian.controller');

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
});

describe('createLaporanKematian', () => {
  const validBody = { ternakId: 'ternak-1', penyebabKematianId: 'penyebab-1', tanggalKematian: '2026-07-15' };

  it('returns 400 when required fields are missing', async () => {
    const req = { body: {}, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKematianController.createLaporanKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 when ternak does not exist', async () => {
    prisma.ternak.findUnique.mockResolvedValue(null);
    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKematianController.createLaporanKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when ternak is already reported dead', async () => {
    prisma.ternak.findUnique.mockResolvedValue({ id: 'ternak-1', status: 'MATI' });
    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKematianController.createLaporanKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('sudah dilaporkan mati') }),
    );
  });

  it('returns 400 when penyebab kematian does not exist', async () => {
    prisma.ternak.findUnique.mockResolvedValue({ id: 'ternak-1', status: 'HIDUP' });
    prisma.penyebabKematian.findUnique.mockResolvedValue(null);
    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKematianController.createLaporanKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates the laporan and marks the ternak as MATI in a single transaction', async () => {
    prisma.ternak.findUnique.mockResolvedValue({ id: 'ternak-1', status: 'HIDUP' });
    prisma.penyebabKematian.findUnique.mockResolvedValue({ id: 'penyebab-1' });
    prisma.laporanKematian.create.mockReturnValue({ id: 'laporan-1', ternakId: 'ternak-1' });
    prisma.ternak.update.mockReturnValue({ id: 'ternak-1', status: 'MATI' });
    const createdLaporan = { id: 'laporan-1', ternakId: 'ternak-1' };
    prisma.$transaction.mockResolvedValue([createdLaporan, { id: 'ternak-1', status: 'MATI' }]);

    const req = { body: validBody, user: { id: 'petugas-1' } };
    const res = buildRes();

    await laporanKematianController.createLaporanKematian(req, res);

    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything(), expect.anything()]),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { laporan: createdLaporan } }),
    );
  });
});

describe('updateLaporanKematian', () => {
  it('allows petugas to manually fill in nomorBeritaAcara', async () => {
    prisma.laporanKematian.update.mockResolvedValue({ id: 'laporan-1', nomorBeritaAcara: '007' });
    const req = {
      params: { id: 'laporan-1' },
      body: { penyebabKematianId: 'penyebab-1', tanggalKematian: '2026-07-15', catatan: null, nomorBeritaAcara: '007' },
    };
    const res = buildRes();

    await laporanKematianController.updateLaporanKematian(req, res);

    expect(prisma.laporanKematian.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nomorBeritaAcara: '007' }) }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getBeritaAcara', () => {
  const laporan = {
    id: 'laporan-1',
    nomorBeritaAcara: '001',
    createdAt: new Date('2026-01-10'),
    ternak: { kodeTernak: 'SAPI-001' },
  };

  it('returns 404 when laporan does not exist', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'missing' }, query: {} };
    const res = buildRes();

    await laporanKematianController.getBeritaAcara(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('does not auto-generate nomorBeritaAcara when it is not set', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue({ ...laporan, nomorBeritaAcara: null });
    generateBeritaAcaraDocx.mockReturnValue(Buffer.from('docx'));

    const req = { params: { id: 'laporan-1' }, query: {} };
    const res = buildRes();

    await laporanKematianController.getBeritaAcara(req, res);

    expect(prisma.laporanKematian.update).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(Buffer.from('docx'));
  });

  it('returns docx by default with the correct content type', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue(laporan);
    generateBeritaAcaraDocx.mockReturnValue(Buffer.from('docx-content'));

    const req = { params: { id: 'laporan-1' }, query: {} };
    const res = buildRes();

    await laporanKematianController.getBeritaAcara(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(generateBeritaAcaraPdf).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(Buffer.from('docx-content'));
  });

  it('returns pdf when format=pdf is requested', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue(laporan);
    generateBeritaAcaraPdf.mockResolvedValue(Buffer.from('pdf-content'));

    const req = { params: { id: 'laporan-1' }, query: { format: 'pdf' } };
    const res = buildRes();

    await laporanKematianController.getBeritaAcara(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(generateBeritaAcaraDocx).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(Buffer.from('pdf-content'));
  });

  it('returns 500 with a clear message when the docx template is missing', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue(laporan);
    const templateError = new Error('template not found');
    templateError.code = 'TEMPLATE_NOT_FOUND';
    generateBeritaAcaraDocx.mockImplementation(() => {
      throw templateError;
    });

    const req = { params: { id: 'laporan-1' }, query: {} };
    const res = buildRes();

    await laporanKematianController.getBeritaAcara(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('Template') }),
    );
  });
});

describe('deleteLaporanKematian', () => {
  it('returns 404 when laporan does not exist', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'missing' } };
    const res = buildRes();

    await laporanKematianController.deleteLaporanKematian(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes the laporan and reverts the ternak status to HIDUP', async () => {
    prisma.laporanKematian.findUnique.mockResolvedValue({ id: 'laporan-1', ternakId: 'ternak-1' });
    prisma.laporanKematian.delete.mockReturnValue({ id: 'laporan-1' });
    prisma.ternak.update.mockReturnValue({ id: 'ternak-1', status: 'HIDUP' });
    prisma.$transaction.mockResolvedValue([{}, {}]);
    const req = { params: { id: 'laporan-1' } };
    const res = buildRes();

    await laporanKematianController.deleteLaporanKematian(req, res);

    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything(), expect.anything()]),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
