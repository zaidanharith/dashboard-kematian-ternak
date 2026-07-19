import type { LaporanKematian } from "./laporan";

export interface PenyebabRingkas {
  id: string;
  nama: string;
  jumlah: number;
}

export interface TrenPoint {
  label: string;
  jumlah: number;
}

export interface DashboardSummary {
  totalLaporan: number;
  totalPeternak: number;
  totalTernak: number;
  ternakHidup: number;
  ternakMati: number;
  laporanTahunIni: number;
  laporanBulanIni: number;
  penyebabDominan: PenyebabRingkas[];
  trenKematian: TrenPoint[];
  laporanTerbaru: LaporanKematian[];
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
