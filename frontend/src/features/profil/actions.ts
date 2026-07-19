"use server";

import { revalidatePath } from "next/cache";
import { updateMe } from "@/services/user.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

export async function updateProfilAction(name: string): Promise<ActionResult> {
  try {
    await updateMe(name);
    revalidatePath("/profil");
    revalidatePath("/", "layout");
    return { success: "Profil berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui profil.") };
  }
}
