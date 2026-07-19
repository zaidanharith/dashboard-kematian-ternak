"use server";

import { revalidatePath } from "next/cache";
import {
  createJenisTernak,
  updateJenisTernak,
  deleteJenisTernak,
  createPenyebabKematian,
  updatePenyebabKematian,
  deletePenyebabKematian,
} from "@/services/master.service";
import { getApiErrorMessage } from "@/lib/api-server";
import type { ActionResult } from "@/types/action";

const JENIS_PATH = "/master/jenis-ternak";
const PENYEBAB_PATH = "/master/penyebab-kematian";

export async function createJenisTernakAction(nama: string): Promise<ActionResult> {
  try {
    await createJenisTernak(nama);
    revalidatePath(JENIS_PATH);
    return { success: "Jenis ternak berhasil ditambahkan." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menambahkan jenis ternak.") };
  }
}

export async function updateJenisTernakAction(id: string, nama: string): Promise<ActionResult> {
  try {
    await updateJenisTernak(id, nama);
    revalidatePath(JENIS_PATH);
    return { success: "Jenis ternak berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui jenis ternak.") };
  }
}

export async function deleteJenisTernakAction(id: string): Promise<ActionResult> {
  try {
    await deleteJenisTernak(id);
    revalidatePath(JENIS_PATH);
    return { success: "Jenis ternak berhasil dihapus." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menghapus jenis ternak.") };
  }
}

export async function createPenyebabKematianAction(nama: string): Promise<ActionResult> {
  try {
    await createPenyebabKematian(nama);
    revalidatePath(PENYEBAB_PATH);
    return { success: "Penyebab kematian berhasil ditambahkan." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menambahkan penyebab kematian.") };
  }
}

export async function updatePenyebabKematianAction(id: string, nama: string): Promise<ActionResult> {
  try {
    await updatePenyebabKematian(id, nama);
    revalidatePath(PENYEBAB_PATH);
    return { success: "Penyebab kematian berhasil diperbarui." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal memperbarui penyebab kematian.") };
  }
}

export async function deletePenyebabKematianAction(id: string): Promise<ActionResult> {
  try {
    await deletePenyebabKematian(id);
    revalidatePath(PENYEBAB_PATH);
    return { success: "Penyebab kematian berhasil dihapus." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menghapus penyebab kematian.") };
  }
}
