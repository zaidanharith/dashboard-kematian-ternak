import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function formatTanggal(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "d MMMM yyyy", { locale: id });
}

export function formatTanggalSingkat(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy", { locale: id });
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "yyyy-MM-dd");
}

export function hitungUmur(tanggalLahir: string | Date | null | undefined): string {
  if (!tanggalLahir) return "-";
  const lahir = typeof tanggalLahir === "string" ? parseISO(tanggalLahir) : tanggalLahir;
  const now = new Date();
  let bulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth());
  if (now.getDate() < lahir.getDate()) bulan -= 1;
  if (bulan < 0) bulan = 0;
  const tahun = Math.floor(bulan / 12);
  const sisaBulan = bulan % 12;
  if (tahun === 0) return `${sisaBulan} bln`;
  if (sisaBulan === 0) return `${tahun} thn`;
  return `${tahun} thn ${sisaBulan} bln`;
}

export function inisial(nama: string | null | undefined): string {
  if (!nama) return "?";
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}
