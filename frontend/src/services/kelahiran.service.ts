import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { LaporanKelahiran } from "@/types/laporan";
import type { JenisKelamin } from "@/types/ternak";

export interface KelahiranCreateInput {
  peternakId: string;
  jenisTernakId: string;
  kodeTernak: string;
  jenisKelamin: JenisKelamin;
  rasRumpun?: string | null;
  tanggalLahir: string;
  catatan?: string | null;
}

export interface KelahiranUpdateInput {
  tanggalLahir: string;
  catatan?: string | null;
  nomorAkta?: string | null;
}

export async function getKelahiranList(params?: { peternakId?: string }): Promise<LaporanKelahiran[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ laporanKelahiran: LaporanKelahiran[] }>>(
    "/laporan-kelahiran",
    { params },
  );
  return data.data.laporanKelahiran;
}

export async function getKelahiranById(id: string): Promise<LaporanKelahiran> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ laporan: LaporanKelahiran }>>(
    `/laporan-kelahiran/${id}`,
  );
  return data.data.laporan;
}

export async function createKelahiran(input: KelahiranCreateInput): Promise<LaporanKelahiran> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ laporan: LaporanKelahiran }>>(
    "/laporan-kelahiran",
    input,
  );
  return data.data.laporan;
}

export async function updateKelahiran(id: string, input: KelahiranUpdateInput): Promise<LaporanKelahiran> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ laporan: LaporanKelahiran }>>(
    `/laporan-kelahiran/${id}`,
    input,
  );
  return data.data.laporan;
}

export async function deleteKelahiran(id: string): Promise<void> {
  const client = await getServerApi();
  await client.delete(`/laporan-kelahiran/${id}`);
}

export async function getAkta(
  id: string,
  format: "docx" | "pdf",
): Promise<{ buffer: ArrayBuffer; contentType: string; filename: string }> {
  const client = await getServerApi();
  const response = await client.get(`/laporan-kelahiran/${id}/akta`, {
    params: { format },
    responseType: "arraybuffer",
  });

  const disposition = response.headers["content-disposition"] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `akta-kelahiran.${format}`;

  return {
    buffer: response.data as ArrayBuffer,
    contentType: response.headers["content-type"] as string,
    filename,
  };
}
