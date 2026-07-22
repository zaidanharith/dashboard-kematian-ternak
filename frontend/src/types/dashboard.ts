import type { LaporanKematian } from "./laporan";

export interface PenyebabRingkas {
  id: string;
  nama: string;
  jumlah: number;
}

export interface TrenPopulasiPoint {
  label: string;
  lahir: number;
  mati: number;
}

export interface DashboardSummary {
  totalLaporan: number;
  totalPeternak: number;
  totalTernak: number;
  ternakHidup: number;
  ternakMati: number;
  laporanTahunIni: number;
  laporanBulanIni: number;
  totalLaporanKelahiran: number;
  laporanKelahiranTahunIni: number;
  laporanKelahiranBulanIni: number;
  penyebabDominan: PenyebabRingkas[];
  trenPopulasi: TrenPopulasiPoint[];
  laporanTerbaru: LaporanKematian[];
}

export type LevelWilayah = "dusun" | "rt" | "rw";

export interface WilayahPopulasi {
  wilayah: { desa: string; dusun: string; rt: string | null; rw: string | null };
  label: string;
  jumlahPeternak: number;
  populasi: number;
  lahir: number;
  mati: number;
  pertumbuhanBersih: number;
}

export interface AnalisisPopulasi {
  level: LevelWilayah;
  totalPopulasi: number;
  totalLahir: number;
  totalMati: number;
  wilayah: WilayahPopulasi[];
}

export interface AnalisisRankingItem {
  id: string;
  nama: string;
  jumlah: number;
  persentase: number;
  breakdownJenisTernak: { nama: string; jumlah: number }[];
}

export interface AnalisisPenyebab {
  totalLaporan: number;
  jumlahPenyebab: number;
  ranking: AnalisisRankingItem[];
}
