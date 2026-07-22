import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { AnalisisPenyebab, AnalisisPopulasi, DashboardSummary, LevelWilayah } from "@/types/dashboard";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ summary: DashboardSummary }>>("/dashboard/summary");
  return data.data.summary;
}

export async function getAnalisisPenyebab(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AnalisisPenyebab> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ analisis: AnalisisPenyebab }>>(
    "/analisis/penyebab-kematian",
    { params },
  );
  return data.data.analisis;
}

export async function getAnalisisPopulasi(params?: {
  level?: LevelWilayah;
  startDate?: string;
  endDate?: string;
}): Promise<AnalisisPopulasi> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ analisis: AnalisisPopulasi }>>(
    "/analisis/populasi",
    { params },
  );
  return data.data.analisis;
}
