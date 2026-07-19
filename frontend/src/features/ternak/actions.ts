"use server";

import { revalidatePath } from "next/cache";
import {
  createTernak,
  updateTernak,
  deleteTernak,
  type TernakInput,
} from "@/services/ternak.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

export async function createTernakAction(input: TernakInput): Promise<ActionResult> {
  try {
    await createTernak(input);
    revalidatePath("/ternak");
    revalidatePath("/peternak");
    return { success: "Ternak berhasil ditambahkan." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menambahkan ternak.") };
  }
}

export async function updateTernakAction(id: string, input: TernakInput): Promise<ActionResult> {
  try {
    await updateTernak(id, input);
    revalidatePath("/ternak");
    revalidatePath("/peternak");
    return { success: "Data ternak berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui data ternak.") };
  }
}

export async function deleteTernakAction(id: string): Promise<ActionResult> {
  try {
    await deleteTernak(id);
    revalidatePath("/ternak");
    revalidatePath("/peternak");
    return { success: "Ternak berhasil dihapus." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menghapus ternak.") };
  }
}
