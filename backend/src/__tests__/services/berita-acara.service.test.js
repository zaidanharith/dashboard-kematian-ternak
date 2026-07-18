const {
  hitungUmur,
  buildBeritaAcaraData,
  generateBeritaAcaraDocx,
  generateBeritaAcaraPdf,
} = require('../../services/berita-acara.service');

function buildLaporan(overrides = {}) {
  return {
    nomorBeritaAcara: '001',
    createdAt: new Date('2026-07-18'),
    tanggalKematian: new Date('2026-07-15'),
    catatan: 'Ditemukan mati di kandang',
    ternak: {
      kodeTernak: 'SAPI-001',
      jenisKelamin: 'JANTAN',
      rasRumpun: 'Kambing Jawa',
      tanggalLahir: new Date('2023-03-10'),
      jenisTernak: { nama: 'Kambing' },
      peternak: { nama: 'Pak Slamet', alamat: 'Jl. Mawar 1', dusun: 'Krajan', rt: '01', rw: '02' },
    },
    penyebabKematian: { nama: 'Penyakit' },
    ...overrides,
  };
}

describe('hitungUmur', () => {
  it('calculates full years and remaining months correctly', () => {
    const umur = hitungUmur(new Date('2023-03-10'), new Date('2026-07-15'));

    expect(umur).toEqual({ tahun: 3, bulan: 4 });
  });

  it('rolls back a month when the death day precedes the birth day-of-month', () => {
    const umur = hitungUmur(new Date('2023-03-20'), new Date('2026-07-15'));

    expect(umur).toEqual({ tahun: 3, bulan: 3 });
  });
});

describe('buildBeritaAcaraData', () => {
  it('maps laporan fields to the template placeholder names', () => {
    const data = buildBeritaAcaraData(buildLaporan());

    expect(data).toEqual(
      expect.objectContaining({
        nomor_urut: '001',
        jenis_ternak: 'Kambing',
        kode_ternak: 'SAPI-001',
        nama_peternak: 'Pak Slamet',
        jenis_kelamin_ternak: 'Jantan',
        ras_rumpun: 'Kambing Jawa',
        penyebab_kematian: 'penyakit',
        umur_ternak: '3 tahun 4 bulan',
      }),
    );
  });

  it('falls back to "-" when rasRumpun is not set', () => {
    const laporan = buildLaporan();
    laporan.ternak.rasRumpun = null;

    const data = buildBeritaAcaraData(laporan);

    expect(data.ras_rumpun).toBe('-');
  });

  it('maps BETINA jenisKelamin to "Betina"', () => {
    const laporan = buildLaporan();
    laporan.ternak.jenisKelamin = 'BETINA';

    const data = buildBeritaAcaraData(laporan);

    expect(data.jenis_kelamin_ternak).toBe('Betina');
  });
});

describe('generateBeritaAcaraDocx', () => {
  it('throws a TEMPLATE_NOT_FOUND error when the template file is missing', () => {
    const originalEnv = process.env.BERITA_ACARA_TEMPLATE_NAME;
    process.env.BERITA_ACARA_TEMPLATE_NAME = 'file-yang-tidak-ada.docx';

    expect(() => generateBeritaAcaraDocx(buildLaporan())).toThrow(
      expect.objectContaining({ code: 'TEMPLATE_NOT_FOUND' }),
    );

    if (originalEnv === undefined) {
      delete process.env.BERITA_ACARA_TEMPLATE_NAME;
    } else {
      process.env.BERITA_ACARA_TEMPLATE_NAME = originalEnv;
    }
  });

  it('generates a non-empty docx buffer when the template exists', () => {
    const buffer = generateBeritaAcaraDocx(buildLaporan());

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});

describe('generateBeritaAcaraPdf', () => {
  it('generates a valid PDF buffer', async () => {
    const buffer = await generateBeritaAcaraPdf(buildLaporan());

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
