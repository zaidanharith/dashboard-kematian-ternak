import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { AnalisisPenyebab, DashboardSummary } from "@/types/dashboard";

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
