const {
  buildAktaKelahiranData,
  generateAktaKelahiranDocx,
  generateAktaKelahiranPdf,
} = require('../../services/akta-kelahiran.service');

function buildLaporan(overrides = {}) {
  return {
    nomorAkta: null,
    createdAt: new Date('2026-07-18'),
    tanggalLahir: new Date('2026-07-15'),
    catatan: 'Lahir normal',
    ternak: {
      kodeTernak: 'KAMBING-002',
      jenisKelamin: 'BETINA',
      rasRumpun: 'Kambing Jawa',
      jenisTernak: { nama: 'Kambing' },
      peternak: { nama: 'Pak Slamet', desa: 'Besuki', dusun: 'Krajan', rt: '01', rw: '02' },
    },
    petugasNama: 'Budi Petugas',
    ...overrides,
  };
}

describe('buildAktaKelahiranData', () => {
  it('maps laporan fields to the template placeholder names', () => {
    const data = buildAktaKelahiranData(buildLaporan());

    expect(data).toEqual(
      expect.objectContaining({
        jenis_ternak: 'Kambing',
        kode_ternak: 'KAMBING-002',
        nama_peternak: 'Pak Slamet',
        alamat_peternak: 'Desa Besuki, Dusun Krajan RT 01/RW 02',
        jenis_kelamin_ternak: 'Betina',
        ras_rumpun: 'Kambing Jawa',
        petugas_pencatat: 'Budi Petugas',
      }),
    );
  });

  it('falls back to a blank underscore line when nomorAkta is not set', () => {
    const data = buildAktaKelahiranData(buildLaporan());

    expect(data.nomor_urut).toBe('______________');
  });

  it('uses the manually filled nomorAkta when present', () => {
    const data = buildAktaKelahiranData(buildLaporan({ nomorAkta: '003' }));

    expect(data.nomor_urut).toBe('003');
  });

  it('falls back to "-" when rasRumpun is not set', () => {
    const laporan = buildLaporan();
    laporan.ternak.rasRumpun = null;

    const data = buildAktaKelahiranData(laporan);

    expect(data.ras_rumpun).toBe('-');
  });
});

describe('generateAktaKelahiranDocx', () => {
  it('throws a TEMPLATE_NOT_FOUND error when the template file is missing', () => {
    expect(() => generateAktaKelahiranDocx(buildLaporan())).toThrow(
      expect.objectContaining({ code: 'TEMPLATE_NOT_FOUND' }),
    );
  });
});

describe('generateAktaKelahiranPdf', () => {
  it('generates a valid PDF buffer', async () => {
    const buffer = await generateAktaKelahiranPdf(buildLaporan());

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
