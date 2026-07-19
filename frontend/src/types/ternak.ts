import type { JenisTernak } from "./master";
import type { Peternak } from "./peternak";

export type JenisKelamin = "JANTAN" | "BETINA";
export type StatusTernak = "HIDUP" | "MATI";

export interface Ternak {
  id: string;
  kodeTernak: string;
  jenisTernakId: string;
  peternakId: string;
  jenisKelamin: JenisKelamin;
  rasRumpun: string | null;
  tanggalLahir: string;
  status: StatusTernak;
  createdAt: string;
  updatedAt: string;
  jenisTernak?: JenisTernak;
  peternak?: Peternak;
  laporanKematian?: { id: string }[];
}
