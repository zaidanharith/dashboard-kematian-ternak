"use server";

import { revalidatePath } from "next/cache";
import {
  createLaporan,
  updateLaporan,
  deleteLaporan,
  type LaporanCreateInput,
  type LaporanUpdateInput,
} from "@/services/laporan.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

export async function createLaporanAction(
  input: LaporanCreateInput,
): Promise<ActionResult & { id?: string }> {
  try {
    const laporan = await createLaporan(input);
    revalidatePath("/laporan");
    revalidatePath("/dashboard");
    return { success: "Laporan kematian berhasil dibuat.", id: laporan.id };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal membuat laporan kematian.") };
  }
}

export async function updateLaporanAction(
  id: string,
  input: LaporanUpdateInput,
): Promise<ActionResult> {
  try {
    await updateLaporan(id, input);
    revalidatePath("/laporan");
    revalidatePath(`/laporan/${id}`);
    return { success: "Laporan kematian berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui laporan kematian.") };
  }
}

export async function deleteLaporanAction(id: string): Promise<ActionResult> {
  try {
    await deleteLaporan(id);
    revalidatePath("/laporan");
    revalidatePath("/dashboard");
    return { success: "Laporan kematian berhasil dihapus." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menghapus laporan kematian.") };
  }
}
