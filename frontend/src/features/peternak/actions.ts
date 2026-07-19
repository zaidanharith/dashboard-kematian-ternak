"use server";

import { revalidatePath } from "next/cache";
import {
  createPeternak,
  updatePeternak,
  deletePeternak,
  type PeternakInput,
} from "@/services/peternak.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

export async function createPeternakAction(input: PeternakInput): Promise<ActionResult> {
  try {
    await createPeternak(input);
    revalidatePath("/peternak");
    return { success: "Peternak berhasil ditambahkan." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menambahkan peternak.") };
  }
}

export async function updatePeternakAction(
  id: string,
  input: PeternakInput,
): Promise<ActionResult> {
  try {
    await updatePeternak(id, input);
    revalidatePath("/peternak");
    revalidatePath(`/peternak/${id}`);
    return { success: "Data peternak berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui data peternak.") };
  }
}

export async function deletePeternakAction(id: string): Promise<ActionResult> {
  try {
    await deletePeternak(id);
    revalidatePath("/peternak");
    return { success: "Peternak berhasil dihapus." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menghapus peternak.") };
  }
}
