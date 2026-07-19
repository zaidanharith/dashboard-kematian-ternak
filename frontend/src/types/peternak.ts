import type { Ternak } from "./ternak";

export interface Peternak {
  id: string;
  nama: string;
  nik: string;
  alamat: string;
  telepon: string;
  dusun: string;
  rt: string;
  rw: string;
  createdAt: string;
  updatedAt: string;
  ternak?: Ternak[];
}
