import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { Peternak } from "@/types/peternak";

export interface PeternakInput {
  nama: string;
  nik: string;
  telepon: string;
  desa: string;
  dusun: string;
  rt: string;
  rw: string;
}

export async function getPeternakList(search?: string): Promise<Peternak[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ peternak: Peternak[] }>>("/peternak", {
    params: search ? { search } : undefined,
  });
  return data.data.peternak;
}

export async function getPeternakById(id: string): Promise<Peternak> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ peternak: Peternak }>>(`/peternak/${id}`);
  return data.data.peternak;
}

export async function createPeternak(input: PeternakInput): Promise<Peternak> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ peternak: Peternak }>>("/peternak", input);
  return data.data.peternak;
}

export async function updatePeternak(id: string, input: PeternakInput): Promise<Peternak> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ peternak: Peternak }>>(`/peternak/${id}`, input);
  return data.data.peternak;
}

export async function deletePeternak(id: string): Promise<void> {
  const client = await getServerApi();
  await client.delete(`/peternak/${id}`);
}
