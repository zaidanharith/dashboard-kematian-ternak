jest.mock('../../database/connections/prisma_client', () => ({
  peternak: { findMany: jest.fn() },
  ternak: { findMany: jest.fn() },
  laporanKelahiran: { findMany: jest.fn() },
  laporanKematian: { findMany: jest.fn(), groupBy: jest.fn(), count: jest.fn() },
  penyebabKematian: { findMany: jest.fn() },
}));

const prisma = require('../../database/connections/prisma_client');
const analisisController = require('../../controllers/analisis.controller');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAnalisisPopulasi', () => {
  const peternakList = [
    { id: 'p1', desa: 'Besuki', dusun: 'Krajan', rt: '01', rw: '01' },
    { id: 'p2', desa: 'Besuki', dusun: 'Krajan', rt: '02', rw: '01' },
    { id: 'p3', desa: 'Besuki', dusun: 'Sumber', rt: '01', rw: '02' },
  ];

  beforeEach(() => {
    prisma.peternak.findMany.mockResolvedValue(peternakList);
    prisma.ternak.findMany.mockResolvedValue([
      { status: 'HIDUP', peternakId: 'p1' },
      { status: 'HIDUP', peternakId: 'p1' },
      { status: 'MATI', peternakId: 'p1' },
      { status: 'HIDUP', peternakId: 'p2' },
      { status: 'HIDUP', peternakId: 'p3' },
    ]);
    prisma.laporanKelahiran.findMany.mockResolvedValue([
      { ternak: { peternakId: 'p1' } },
      { ternak: { peternakId: 'p2' } },
    ]);
    prisma.laporanKematian.findMany.mockResolvedValue([
      { ternak: { peternakId: 'p1' } },
    ]);
  });

  it('groups by dusun by default, combining peternak from the same dusun', async () => {
    const req = { query: {} };
    const res = buildRes();

    await analisisController.getAnalisisPopulasi(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.analisis.level).toBe('dusun');
    const krajan = payload.data.analisis.wilayah.find((w) => w.label === 'Dusun Krajan');
    expect(krajan).toEqual(
      expect.objectContaining({ jumlahPeternak: 2, populasi: 3, lahir: 2, mati: 1, pertumbuhanBersih: 1 }),
    );
  });

  it('groups by rt when level=rt is requested', async () => {
    const req = { query: { level: 'rt' } };
    const res = buildRes();

    await analisisController.getAnalisisPopulasi(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.analisis.level).toBe('rt');
    expect(payload.data.analisis.wilayah).toHaveLength(3);
    const rt01 = payload.data.analisis.wilayah.find((w) => w.label === 'Dusun Krajan RT 01');
    expect(rt01).toEqual(expect.objectContaining({ populasi: 2, lahir: 1, mati: 1 }));
  });

  it('falls back to dusun when an invalid level is passed', async () => {
    const req = { query: { level: 'invalid' } };
    const res = buildRes();

    await analisisController.getAnalisisPopulasi(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.analisis.level).toBe('dusun');
  });

  it('computes totals across all wilayah', async () => {
    const req = { query: {} };
    const res = buildRes();

    await analisisController.getAnalisisPopulasi(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data.analisis.totalPopulasi).toBe(4);
    expect(payload.data.analisis.totalLahir).toBe(2);
    expect(payload.data.analisis.totalMati).toBe(1);
  });
});
