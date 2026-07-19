import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { JenisKelamin, StatusTernak, Ternak } from "@/types/ternak";

export interface TernakInput {
  kodeTernak: string;
  jenisTernakId: string;
  peternakId: string;
  jenisKelamin: JenisKelamin;
  rasRumpun?: string | null;
  tanggalLahir: string;
}

export async function getTernakList(params?: {
  peternakId?: string;
  status?: StatusTernak;
}): Promise<Ternak[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ ternak: Ternak[] }>>("/ternak", { params });
  return data.data.ternak;
}

export async function getTernakById(id: string): Promise<Ternak> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ ternak: Ternak }>>(`/ternak/${id}`);
  return data.data.ternak;
}

export async function createTernak(input: TernakInput): Promise<Ternak> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ ternak: Ternak }>>("/ternak", input);
  return data.data.ternak;
}

export async function updateTernak(id: string, input: TernakInput): Promise<Ternak> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ ternak: Ternak }>>(`/ternak/${id}`, input);
  return data.data.ternak;
}

export async function deleteTernak(id: string): Promise<void> {
  const client = await getServerApi();
  await client.delete(`/ternak/${id}`);
}
