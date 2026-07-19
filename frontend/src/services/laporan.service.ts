import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { LaporanKematian } from "@/types/laporan";

export interface LaporanCreateInput {
  ternakId: string;
  penyebabKematianId: string;
  tanggalKematian: string;
  catatan?: string | null;
}

export interface LaporanUpdateInput {
  penyebabKematianId: string;
  tanggalKematian: string;
  catatan?: string | null;
}

export async function getLaporanList(params?: {
  penyebabKematianId?: string;
  peternakId?: string;
}): Promise<LaporanKematian[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ laporanKematian: LaporanKematian[] }>>(
    "/laporan-kematian",
    { params },
  );
  return data.data.laporanKematian;
}

export async function getLaporanById(id: string): Promise<LaporanKematian> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ laporan: LaporanKematian }>>(
    `/laporan-kematian/${id}`,
  );
  return data.data.laporan;
}

export async function createLaporan(input: LaporanCreateInput): Promise<LaporanKematian> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ laporan: LaporanKematian }>>(
    "/laporan-kematian",
    input,
  );
  return data.data.laporan;
}

export async function updateLaporan(id: string, input: LaporanUpdateInput): Promise<LaporanKematian> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ laporan: LaporanKematian }>>(
    `/laporan-kematian/${id}`,
    input,
  );
  return data.data.laporan;
}

export async function deleteLaporan(id: string): Promise<void> {
  const client = await getServerApi();
  await client.delete(`/laporan-kematian/${id}`);
}

export async function getBeritaAcara(
  id: string,
  format: "docx" | "pdf",
): Promise<{ buffer: ArrayBuffer; contentType: string; filename: string }> {
  const client = await getServerApi();
  const response = await client.get(`/laporan-kematian/${id}/berita-acara`, {
    params: { format },
    responseType: "arraybuffer",
  });

  const disposition = response.headers["content-disposition"] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `berita-acara.${format}`;

  return {
    buffer: response.data as ArrayBuffer,
    contentType: response.headers["content-type"] as string,
    filename,
  };
}
