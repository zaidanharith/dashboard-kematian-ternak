const prisma = require('../database/connections/prisma_client');

exports.getAnalisisPenyebabKematian = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const tanggalFilter = {};
    if (startDate) tanggalFilter.gte = new Date(startDate);
    if (endDate) tanggalFilter.lte = new Date(endDate);
    const where = Object.keys(tanggalFilter).length ? { tanggalKematian: tanggalFilter } : {};

    const [penyebabGroup, laporan, totalLaporan] = await Promise.all([
      prisma.laporanKematian.groupBy({
        by: ['penyebabKematianId'],
        where,
        _count: { penyebabKematianId: true },
        orderBy: { _count: { penyebabKematianId: 'desc' } },
      }),
      prisma.laporanKematian.findMany({
        where,
        select: {
          penyebabKematianId: true,
          ternak: { select: { jenisTernak: { select: { nama: true } } } },
        },
      }),
      prisma.laporanKematian.count({ where }),
    ]);

    const penyebabIds = penyebabGroup.map((item) => item.penyebabKematianId);
    const penyebabList = penyebabIds.length
      ? await prisma.penyebabKematian.findMany({ where: { id: { in: penyebabIds } } })
      : [];
    const penyebabNamaById = Object.fromEntries(penyebabList.map((p) => [p.id, p.nama]));

    const jenisPerPenyebab = new Map();
    for (const item of laporan) {
      const jenisNama = item.ternak?.jenisTernak?.nama || 'Tidak diketahui';
      if (!jenisPerPenyebab.has(item.penyebabKematianId)) {
        jenisPerPenyebab.set(item.penyebabKematianId, new Map());
      }
      const jenisMap = jenisPerPenyebab.get(item.penyebabKematianId);
      jenisMap.set(jenisNama, (jenisMap.get(jenisNama) || 0) + 1);
    }

    const ranking = penyebabGroup.map((item) => {
      const jumlah = item._count.penyebabKematianId;
      const jenisMap = jenisPerPenyebab.get(item.penyebabKematianId) || new Map();
      return {
        id: item.penyebabKematianId,
        nama: penyebabNamaById[item.penyebabKematianId] || 'Tidak diketahui',
        jumlah,
        persentase: totalLaporan ? Math.round((jumlah / totalLaporan) * 1000) / 10 : 0,
        breakdownJenisTernak: Array.from(jenisMap.entries())
          .map(([nama, count]) => ({ nama, jumlah: count }))
          .sort((a, b) => b.jumlah - a.jumlah),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Analisis penyebab kematian berhasil diambil.',
      data: {
        analisis: {
          totalLaporan,
          jumlahPenyebab: ranking.length,
          ranking,
        },
      },
    });
  } catch (error) {
    console.error('Get Analisis Penyebab Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil analisis penyebab kematian.',
      error: error.message,
    });
  }
};

const LEVEL_WILAYAH = ['dusun', 'rt', 'rw'];

function wilayahKey(peternak, level) {
  if (level === 'dusun') return `${peternak.desa}|${peternak.dusun}`;
  if (level === 'rt') return `${peternak.desa}|${peternak.dusun}|${peternak.rt}`;
  return `${peternak.desa}|${peternak.dusun}|${peternak.rt}|${peternak.rw}`;
}

function wilayahLabel(peternak, level) {
  if (level === 'dusun') return `Dusun ${peternak.dusun}`;
  if (level === 'rt') return `Dusun ${peternak.dusun} RT ${peternak.rt}`;
  return `Dusun ${peternak.dusun} RT ${peternak.rt}/RW ${peternak.rw}`;
}

exports.getAnalisisPopulasi = async (req, res) => {
  try {
    const level = LEVEL_WILAYAH.includes(req.query.level) ? req.query.level : 'dusun';
    const { startDate, endDate } = req.query;

    const tanggalFilter = {};
    if (startDate) tanggalFilter.gte = new Date(startDate);
    if (endDate) tanggalFilter.lte = new Date(endDate);
    const periodeWhere = Object.keys(tanggalFilter).length ? tanggalFilter : undefined;

    const [peternakList, ternakList, kelahiranList, kematianList] = await Promise.all([
      prisma.peternak.findMany({ select: { id: true, desa: true, dusun: true, rt: true, rw: true } }),
      prisma.ternak.findMany({ select: { status: true, peternakId: true } }),
      prisma.laporanKelahiran.findMany({
        where: periodeWhere ? { tanggalLahir: periodeWhere } : undefined,
        select: { ternak: { select: { peternakId: true } } },
      }),
      prisma.laporanKematian.findMany({
        where: periodeWhere ? { tanggalKematian: periodeWhere } : undefined,
        select: { ternak: { select: { peternakId: true } } },
      }),
    ]);

    const peternakById = new Map(peternakList.map((p) => [p.id, p]));
    const wilayahMap = new Map();
    const peternakDihitung = new Set();

    function ambilEntry(peternak) {
      const key = wilayahKey(peternak, level);
      if (!wilayahMap.has(key)) {
        wilayahMap.set(key, {
          wilayah: {
            desa: peternak.desa,
            dusun: peternak.dusun,
            rt: level === 'dusun' ? null : peternak.rt,
            rw: level === 'rw' ? peternak.rw : null,
          },
          label: wilayahLabel(peternak, level),
          jumlahPeternak: 0,
          populasi: 0,
          lahir: 0,
          mati: 0,
        });
      }
      return wilayahMap.get(key);
    }

    for (const peternak of peternakList) {
      const entry = ambilEntry(peternak);
      if (!peternakDihitung.has(peternak.id)) {
        entry.jumlahPeternak += 1;
        peternakDihitung.add(peternak.id);
      }
    }

    for (const ternak of ternakList) {
      if (ternak.status !== 'HIDUP') continue;
      const peternak = peternakById.get(ternak.peternakId);
      if (!peternak) continue;
      ambilEntry(peternak).populasi += 1;
    }

    for (const item of kelahiranList) {
      const peternak = item.ternak ? peternakById.get(item.ternak.peternakId) : null;
      if (!peternak) continue;
      ambilEntry(peternak).lahir += 1;
    }

    for (const item of kematianList) {
      const peternak = item.ternak ? peternakById.get(item.ternak.peternakId) : null;
      if (!peternak) continue;
      ambilEntry(peternak).mati += 1;
    }

    const wilayah = Array.from(wilayahMap.values())
      .map((entry) => ({ ...entry, pertumbuhanBersih: entry.lahir - entry.mati }))
      .sort((a, b) => b.populasi - a.populasi);

    return res.status(200).json({
      success: true,
      message: 'Analisis populasi berhasil diambil.',
      data: {
        analisis: {
          level,
          totalPopulasi: wilayah.reduce((sum, item) => sum + item.populasi, 0),
          totalLahir: wilayah.reduce((sum, item) => sum + item.lahir, 0),
          totalMati: wilayah.reduce((sum, item) => sum + item.mati, 0),
          wilayah,
        },
      },
    });
  } catch (error) {
    console.error('Get Analisis Populasi Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil analisis populasi.',
      error: error.message,
    });
  }
};
