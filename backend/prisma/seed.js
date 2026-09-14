require('dotenv').config();
const prisma = require('../src/database/connections/prisma_client');

const jenisTernak = ['Sapi', 'Kambing', 'Domba', 'Kerbau', 'Ayam', 'Bebek'];

const penyebabKematian = [
  'Penyakit',
  'Kecelakaan',
  'Usia Tua',
  'Keracunan',
  'Cuaca Ekstrem',
  'Tidak Diketahui',
];

async function main() {
  console.log('[Seed] Menghapus data referensi lama...');
  await prisma.penyebabKematian.deleteMany({});
  await prisma.jenisTernak.deleteMany({});

  console.log('[Seed] Menambahkan data jenis ternak...');
  await prisma.jenisTernak.createMany({
    data: jenisTernak.map((nama) => ({ nama })),
  });

  console.log('[Seed] Menambahkan data penyebab kematian...');
  await prisma.penyebabKematian.createMany({
    data: penyebabKematian.map((nama) => ({ nama })),
  });

  console.log('[Seed] Akun SUPERADMIN tidak dibuat di sini — tabel users sudah digabung ke database');
  console.log('[Seed] recording-ternak. Jalankan seed/bootstrap admin di sana (model Admin).');
  console.log('[Seed] Selesai.');
}

main()
  .catch((error) => {
    console.error('[Seed] Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
