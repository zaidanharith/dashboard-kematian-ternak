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
