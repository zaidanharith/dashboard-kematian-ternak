const prisma = require('../database/connections/prisma_client');

const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const awalTahun = new Date(now.getFullYear(), 0, 1);
    const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1);
    const mulaiTren = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalLaporan,
      totalPeternak,
      totalTernak,
      ternakMati,
      laporanTahunIni,
      laporanBulanIni,
      totalLaporanKelahiran,
      laporanKelahiranTahunIni,
      laporanKelahiranBulanIni,
      penyebabGroup,
      kematianTren,
      kelahiranTren,
      laporanTerbaru,
    ] = await Promise.all([
      prisma.laporanKematian.count(),
      prisma.peternak.count(),
      prisma.ternak.count(),
      prisma.ternak.count({ where: { status: 'MATI' } }),
      prisma.laporanKematian.count({ where: { tanggalKematian: { gte: awalTahun } } }),
      prisma.laporanKematian.count({ where: { tanggalKematian: { gte: awalBulan } } }),
      prisma.laporanKelahiran.count(),
      prisma.laporanKelahiran.count({ where: { tanggalLahir: { gte: awalTahun } } }),
      prisma.laporanKelahiran.count({ where: { tanggalLahir: { gte: awalBulan } } }),
      prisma.laporanKematian.groupBy({
        by: ['penyebabKematianId'],
        _count: { penyebabKematianId: true },
        orderBy: { _count: { penyebabKematianId: 'desc' } },
        take: 5,
      }),
      prisma.laporanKematian.findMany({
        where: { tanggalKematian: { gte: mulaiTren } },
        select: { tanggalKematian: true },
      }),
      prisma.laporanKelahiran.findMany({
        where: { tanggalLahir: { gte: mulaiTren } },
        select: { tanggalLahir: true },
      }),
      prisma.laporanKematian.findMany({
        take: 5,
        orderBy: { tanggalKematian: 'desc' },
        include: {
          ternak: { include: { peternak: true, jenisTernak: true } },
          penyebabKematian: true,
        },
      }),
    ]);

    const penyebabIds = penyebabGroup.map((item) => item.penyebabKematianId);
    const penyebabList = penyebabIds.length
      ? await prisma.penyebabKematian.findMany({ where: { id: { in: penyebabIds } } })
      : [];
    const penyebabNamaById = Object.fromEntries(penyebabList.map((p) => [p.id, p.nama]));

    const penyebabDominan = penyebabGroup.map((item) => ({
      id: item.penyebabKematianId,
      nama: penyebabNamaById[item.penyebabKematianId] || 'Tidak diketahui',
      jumlah: item._count.penyebabKematianId,
    }));

    const trenMap = new Map();
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      trenMap.set(key, { label: `${BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}`, lahir: 0, mati: 0 });
    }
    for (const laporan of kematianTren) {
      const d = new Date(laporan.tanggalKematian);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (trenMap.has(key)) trenMap.get(key).mati += 1;
    }
    for (const laporan of kelahiranTren) {
      const d = new Date(laporan.tanggalLahir);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (trenMap.has(key)) trenMap.get(key).lahir += 1;
    }
    const trenPopulasi = Array.from(trenMap.values());

    return res.status(200).json({
      success: true,
      message: 'Ringkasan dashboard berhasil diambil.',
      data: {
        summary: {
          totalLaporan,
          totalPeternak,
          totalTernak,
          ternakHidup: totalTernak - ternakMati,
          ternakMati,
          laporanTahunIni,
          laporanBulanIni,
          totalLaporanKelahiran,
          laporanKelahiranTahunIni,
          laporanKelahiranBulanIni,
          penyebabDominan,
          trenPopulasi,
          laporanTerbaru,
        },
      },
    });
  } catch (error) {
    console.error('Get Dashboard Summary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil ringkasan dashboard.',
      error: error.message,
    });
  }
};
