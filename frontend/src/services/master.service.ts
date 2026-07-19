import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { JenisTernak, PenyebabKematian } from "@/types/master";

export async function getJenisTernakList(): Promise<JenisTernak[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ jenisTernak: JenisTernak[] }>>("/jenis-ternak");
  return data.data.jenisTernak;
}

export async function createJenisTernak(nama: string): Promise<JenisTernak> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ jenisTernak: JenisTernak }>>("/jenis-ternak", {
    nama,
  });
  return data.data.jenisTernak;
}

export async function updateJenisTernak(id: string, nama: string): Promise<JenisTernak> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ jenisTernak: JenisTernak }>>(
    `/jenis-ternak/${id}`,
    { nama },
  );
  return data.data.jenisTernak;
}

export async function deleteJenisTernak(id: string): Promise<void> {
  const client = await getServerApi();
  await client.delete(`/jenis-ternak/${id}`);
}

export async function getPenyebabKematianList(): Promise<PenyebabKematian[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ penyebabKematian: PenyebabKematian[] }>>(
    "/penyebab-kematian",
  );
  return data.data.penyebabKematian;
}

export async function createPenyebabKematian(nama: string): Promise<PenyebabKematian> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ penyebabKematian: PenyebabKematian }>>(
    "/penyebab-kematian",
    { nama },
  );
  return data.data.penyebabKematian;
}

export async function updatePenyebabKematian(id: string, nama: string): Promise<PenyebabKematian> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ penyebabKematian: PenyebabKematian }>>(
    `/penyebab-kematian/${id}`,
    { nama },
  );
  return data.data.penyebabKematian;
}

export async function deletePenyebabKematian(id: string): Promise<void> {
  const client = await getServerApi();
  await client.delete(`/penyebab-kematian/${id}`);
}
