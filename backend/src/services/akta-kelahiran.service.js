const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const PDFDocument = require('pdfkit');

function getTemplatePath() {
  return path.join(
    __dirname,
    '..',
    'templates',
    process.env.AKTA_KELAHIRAN_TEMPLATE_NAME || 'akta-kelahiran.docx',
  );
}

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function buildAktaKelahiranData(laporan) {
  const tanggalLahir = new Date(laporan.tanggalLahir);
  const tanggalDibuat = new Date(laporan.createdAt);

  return {
    nomor_urut: laporan.nomorAkta || '______________',
    bulan_romawi: BULAN_ROMAWI[tanggalDibuat.getMonth()],
    tahun_dibuat: String(tanggalDibuat.getFullYear()),
    hari_dibuat: NAMA_HARI[tanggalDibuat.getDay()],
    tanggal_dibuat_angka: String(tanggalDibuat.getDate()),
    bulan_dibuat: NAMA_BULAN[tanggalDibuat.getMonth()],
    tanggal_dibuat_lengkap: `${tanggalDibuat.getDate()} ${NAMA_BULAN[tanggalDibuat.getMonth()]}`,
    nama_peternak: laporan.ternak.peternak.nama,
    alamat_peternak: `Desa ${laporan.ternak.peternak.desa}, Dusun ${laporan.ternak.peternak.dusun} RT ${laporan.ternak.peternak.rt}/RW ${laporan.ternak.peternak.rw}`,
    jenis_ternak: laporan.ternak.jenisTernak.nama,
    kode_ternak: laporan.ternak.kodeTernak,
    jenis_kelamin_ternak: laporan.ternak.jenisKelamin === 'JANTAN' ? 'Jantan' : 'Betina',
    ras_rumpun: laporan.ternak.rasRumpun || '-',
    tanggal_lahir_angka: String(tanggalLahir.getDate()),
    bulan_lahir: NAMA_BULAN[tanggalLahir.getMonth()],
    tahun_lahir: String(tanggalLahir.getFullYear()),
    petugas_pencatat: laporan.petugas.name,
    catatan: laporan.catatan || '-',
  };
}

function generateAktaKelahiranDocx(laporan) {
  const templatePath = getTemplatePath();

  if (!fs.existsSync(templatePath)) {
    const error = new Error(
      `Template akta kelahiran tidak ditemukan di ${templatePath}. Letakkan file .docx template di folder src/templates.`,
    );
    error.code = 'TEMPLATE_NOT_FOUND';
    throw error;
  }

  const data = buildAktaKelahiranData(laporan);

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  return doc.getZip().generate({ type: 'nodebuffer' });
}

function generateAktaKelahiranPdf(laporan) {
  const data = buildAktaKelahiranData(laporan);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Times-Bold').fontSize(14).text('AKTA KELAHIRAN TERNAK', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .font('Times-Italic')
      .fontSize(11)
      .text(`Nomor : ${data.nomor_urut}/AK-LH/BUMDES-KETAPANG/${data.bulan_romawi}/${data.tahun_dibuat}`, {
        align: 'center',
      });
    doc.moveDown(1);

    doc.font('Times-Roman').fontSize(11);
    doc.text(
      `Pada hari ini ${data.hari_dibuat}, tanggal ${data.tanggal_dibuat_angka} bulan ${data.bulan_dibuat} tahun ${data.tahun_dibuat}, yang bertanda tangan di bawah ini menerangkan bahwa telah lahir ternak ${data.jenis_ternak} BUMDesa Sumber Abadi Unit Ketahanan Pangan Desa Besuki yang dikelola oleh :`,
      { align: 'justify' },
    );
    doc.moveDown(1);

    doc.text(`Nama Peternak : ${data.nama_peternak}`);
    doc.text(`Alamat : ${data.alamat_peternak}`);
    doc.moveDown(1);

    doc.text('Dengan sidik ternak sebagai berikut :');
    doc.moveDown(0.5);
    doc.list([
      `Jenis / Nomor Ternak : ${data.jenis_ternak} / ${data.kode_ternak}`,
      `Kelamin : ${data.jenis_kelamin_ternak}`,
      `Ras/Rumpun : ${data.ras_rumpun}`,
    ]);
    doc.moveDown(1);

    doc.text(
      `Bahwa ternak tersebut diatas lahir pada tanggal ${data.tanggal_lahir_angka} bulan ${data.bulan_lahir} tahun ${data.tahun_lahir}, dicatat oleh petugas ${data.petugas_pencatat}.`,
      { align: 'justify' },
    );
    doc.moveDown(1);

    doc.text(
      'Demikian Akta Kelahiran ini dibuat dengan sebenar - benarnya untuk dapat dipergunakan sebagaimana mestinya.',
      { align: 'justify' },
    );
    doc.moveDown(2);

    doc.text(`Besuki, ${data.tanggal_dibuat_lengkap} ${data.tahun_dibuat}`, { align: 'right' });
    doc.moveDown(3);

    const startY = doc.y;
    doc.text('Pengelola Ternak', 56, startY, { width: 240, align: 'center' });
    doc.text('Ketua Unit Ketahanan Pangan', 300, startY, { width: 240, align: 'center' });
    doc.moveDown(3);
    doc.text('________________________', 56, doc.y, { width: 240, align: 'center' });
    doc.text('MUSANI', 300, doc.y - doc.currentLineHeight(), { width: 240, align: 'center' });

    doc.moveDown(3);
    doc.text('Mengetahui,', { align: 'center' });
    doc.text('Direktur BUMDesa Sumber Abadi Desa Besuki', { align: 'center' });
    doc.moveDown(2);
    doc.font('Times-Bold').text('SUWITO, S.Pd', { align: 'center' });

    doc.end();
  });
}

module.exports = { generateAktaKelahiranDocx, generateAktaKelahiranPdf, buildAktaKelahiranData };
