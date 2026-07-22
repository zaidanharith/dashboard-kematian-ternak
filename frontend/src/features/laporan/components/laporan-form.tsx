"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLaporanAction, updateLaporanAction } from "../actions";

const schema = z.object({
  ternakId: z.string().optional(),
  penyebabKematianId: z.string().min(1, "Penyebab kematian wajib dipilih"),
  tanggalKematian: z.string().min(1, "Tanggal kematian wajib diisi"),
  catatan: z.string().max(1000, "Catatan terlalu panjang").optional(),
  nomorBeritaAcara: z.string().max(50, "Nomor terlalu panjang").optional(),
});

type LaporanValues = z.infer<typeof schema>;

interface TernakOption {
  id: string;
  label: string;
}

interface LaporanFormProps {
  mode: "create" | "edit";
  penyebabOptions: { id: string; nama: string }[];
  ternakOptions?: TernakOption[];
  ternakLabel?: string;
  laporanId?: string;
  defaultValues?: Partial<LaporanValues>;
}

export function LaporanForm({
  mode,
  penyebabOptions,
  ternakOptions = [],
  ternakLabel,
  laporanId,
  defaultValues,
}: LaporanFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LaporanValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ternakId: defaultValues?.ternakId ?? "",
      penyebabKematianId: defaultValues?.penyebabKematianId ?? "",
      tanggalKematian: defaultValues?.tanggalKematian ?? "",
      catatan: defaultValues?.catatan ?? "",
      nomorBeritaAcara: defaultValues?.nomorBeritaAcara ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LaporanValues) {
    setServerError(null);

    if (mode === "create") {
      if (!values.ternakId) {
        form.setError("ternakId", { message: "Ternak wajib dipilih" });
        return;
      }
      const result = await createLaporanAction({
        ternakId: values.ternakId,
        penyebabKematianId: values.penyebabKematianId,
        tanggalKematian: values.tanggalKematian,
        catatan: values.catatan || null,
      });
      if (result.error) {
        setServerError(result.error);
        return;
      }
      toast.success(result.success ?? "Laporan berhasil dibuat.");
      router.push(`/laporan/${result.id}`);
      router.refresh();
      return;
    }

    const result = await updateLaporanAction(laporanId as string, {
      penyebabKematianId: values.penyebabKematianId,
      tanggalKematian: values.tanggalKematian,
      catatan: values.catatan || null,
      nomorBeritaAcara: values.nomorBeritaAcara || null,
    });
    if (result.error) {
      setServerError(result.error);
      return;
    }
    toast.success(result.success ?? "Laporan berhasil diperbarui.");
    router.push(`/laporan/${laporanId}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {mode === "create" ? (
          <FormField
            control={form.control}
            name="ternakId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ternak yang mati</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih ternak (hidup)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ternakOptions.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Tidak ada ternak berstatus hidup.
                      </div>
                    ) : (
                      ternakOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormItem>
            <FormLabel>Ternak yang mati</FormLabel>
            <Input value={ternakLabel ?? "-"} disabled readOnly />
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="penyebabKematianId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penyebab kematian</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih penyebab kematian" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {penyebabOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tanggalKematian"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal kematian</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="catatan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (opsional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Keterangan tambahan mengenai kematian ternak…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "edit" ? (
          <FormField
            control={form.control}
            name="nomorBeritaAcara"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Berita Acara (opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="mis. 007" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Isi setelah nomor ditulis tangan di dokumen cetak, agar tercatat di sistem.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {serverError ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan…" : mode === "create" ? "Simpan Laporan" : "Perbarui"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
