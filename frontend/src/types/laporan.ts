import type { PenyebabKematian } from "./master";
import type { Ternak } from "./ternak";
import type { User } from "./user";

export interface LaporanKematian {
  id: string;
  ternakId: string;
  penyebabKematianId: string;
  petugasId: string;
  tanggalKematian: string;
  catatan: string | null;
  nomorBeritaAcara: string | null;
  createdAt: string;
  updatedAt: string;
  ternak?: Ternak;
  penyebabKematian?: PenyebabKematian;
  petugas?: User;
}
