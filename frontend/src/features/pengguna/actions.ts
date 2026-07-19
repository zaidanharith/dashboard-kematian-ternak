"use server";

import { revalidatePath } from "next/cache";
import { registerUser, type RegisterUserInput } from "@/services/user.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

export async function registerUserAction(input: RegisterUserInput): Promise<ActionResult> {
  try {
    await registerUser(input);
    revalidatePath("/pengguna");
    return { success: "Akun berhasil didaftarkan." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal mendaftarkan akun.") };
  }
}
