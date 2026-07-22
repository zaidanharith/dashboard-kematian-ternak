"use server";

import { revalidatePath } from "next/cache";
import {
  createKelahiran,
  updateKelahiran,
  deleteKelahiran,
  type KelahiranCreateInput,
  type KelahiranUpdateInput,
} from "@/services/kelahiran.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

export async function createKelahiranAction(
  input: KelahiranCreateInput,
): Promise<ActionResult & { id?: string }> {
  try {
    const laporan = await createKelahiran(input);
    revalidatePath("/kelahiran");
    revalidatePath("/dashboard");
    return { success: "Laporan kelahiran berhasil dibuat.", id: laporan.id };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal membuat laporan kelahiran.") };
  }
}

export async function updateKelahiranAction(
  id: string,
  input: KelahiranUpdateInput,
): Promise<ActionResult> {
  try {
    await updateKelahiran(id, input);
    revalidatePath("/kelahiran");
    revalidatePath(`/kelahiran/${id}`);
    return { success: "Laporan kelahiran berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui laporan kelahiran.") };
  }
}

export async function deleteKelahiranAction(id: string): Promise<ActionResult> {
  try {
    await deleteKelahiran(id);
    revalidatePath("/kelahiran");
    revalidatePath("/dashboard");
    return { success: "Laporan kelahiran berhasil dihapus." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menghapus laporan kelahiran.") };
  }
}
