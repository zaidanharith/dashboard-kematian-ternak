require('dotenv').config();
const bcrypt = require('bcryptjs');
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

  if (process.env.SUPERADMIN_EMAIL && process.env.SUPERADMIN_PASSWORD) {
    console.log('[Seed] Membuat akun SUPERADMIN...');
    const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);

    await prisma.user.upsert({
      where: { email: process.env.SUPERADMIN_EMAIL },
      update: {},
      create: {
        name: 'Super Admin',
        email: process.env.SUPERADMIN_EMAIL,
        password: hashedPassword,
        role: 'SUPERADMIN',
      },
    });
  } else {
    console.log('[Seed] SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD tidak diset, akun SUPERADMIN dilewati.');
  }

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
