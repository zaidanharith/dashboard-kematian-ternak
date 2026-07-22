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
import { createKelahiranAction, updateKelahiranAction } from "../actions";
import type { JenisTernak } from "@/types/master";
import type { Peternak } from "@/types/peternak";

const schema = z.object({
  peternakId: z.string().optional(),
  jenisTernakId: z.string().optional(),
  kodeTernak: z.string().optional(),
  jenisKelamin: z.enum(["JANTAN", "BETINA"]),
  rasRumpun: z.string().optional(),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  catatan: z.string().max(1000, "Catatan terlalu panjang").optional(),
  nomorAkta: z.string().max(50, "Nomor terlalu panjang").optional(),
});

type KelahiranValues = z.infer<typeof schema>;

interface KelahiranFormProps {
  mode: "create" | "edit";
  peternakOptions?: Pick<Peternak, "id" | "nama">[];
  jenisOptions?: JenisTernak[];
  ternakLabel?: string;
  laporanId?: string;
  defaultValues?: Partial<KelahiranValues>;
}

export function KelahiranForm({
  mode,
  peternakOptions = [],
  jenisOptions = [],
  ternakLabel,
  laporanId,
  defaultValues,
}: KelahiranFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<KelahiranValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      peternakId: defaultValues?.peternakId ?? "",
      jenisTernakId: defaultValues?.jenisTernakId ?? "",
      kodeTernak: defaultValues?.kodeTernak ?? "",
      jenisKelamin: defaultValues?.jenisKelamin ?? "JANTAN",
      rasRumpun: defaultValues?.rasRumpun ?? "",
      tanggalLahir: defaultValues?.tanggalLahir ?? "",
      catatan: defaultValues?.catatan ?? "",
      nomorAkta: defaultValues?.nomorAkta ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: KelahiranValues) {
    setServerError(null);

    if (mode === "create") {
      let missing = false;
      if (!values.peternakId) {
        form.setError("peternakId", { message: "Peternak wajib dipilih" });
        missing = true;
      }
      if (!values.jenisTernakId) {
        form.setError("jenisTernakId", { message: "Jenis ternak wajib dipilih" });
        missing = true;
      }
      if (!values.kodeTernak) {
        form.setError("kodeTernak", { message: "Kode ternak wajib diisi" });
        missing = true;
      }
      if (missing) return;

      const result = await createKelahiranAction({
        peternakId: values.peternakId as string,
        jenisTernakId: values.jenisTernakId as string,
        kodeTernak: values.kodeTernak as string,
        jenisKelamin: values.jenisKelamin,
        rasRumpun: values.rasRumpun || null,
        tanggalLahir: values.tanggalLahir,
        catatan: values.catatan || null,
      });
      if (result.error) {
        setServerError(result.error);
        return;
      }
      toast.success(result.success ?? "Laporan berhasil dibuat.");
      router.push(`/kelahiran/${result.id}`);
      router.refresh();
      return;
    }

    const result = await updateKelahiranAction(laporanId as string, {
      tanggalLahir: values.tanggalLahir,
      catatan: values.catatan || null,
      nomorAkta: values.nomorAkta || null,
    });
    if (result.error) {
      setServerError(result.error);
      return;
    }
    toast.success(result.success ?? "Laporan berhasil diperbarui.");
    router.push(`/kelahiran/${laporanId}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {mode === "create" ? (
          <>
            <FormField
              control={form.control}
              name="peternakId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peternak Pemilik</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih peternak" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {peternakOptions.map((option) => (
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
              name="kodeTernak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Ternak</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. SAPI-002" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="jenisTernakId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Ternak</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jenisOptions.map((option) => (
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
                name="jenisKelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="JANTAN">Jantan</SelectItem>
                        <SelectItem value="BETINA">Betina</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rasRumpun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ras / Rumpun (opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Limousin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <FormItem>
            <FormLabel>Ternak</FormLabel>
            <Input value={ternakLabel ?? "-"} disabled readOnly />
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="tanggalLahir"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal lahir</FormLabel>
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
                  placeholder="Keterangan tambahan mengenai kelahiran ternak…"
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
            name="nomorAkta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Akta (opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="mis. 003" {...field} />
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
