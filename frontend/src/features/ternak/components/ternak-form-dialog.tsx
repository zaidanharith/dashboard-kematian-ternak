"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createTernakAction, updateTernakAction } from "../actions";
import { toDateInputValue } from "@/utils/format";
import type { Ternak } from "@/types/ternak";
import type { JenisTernak } from "@/types/master";
import type { Peternak } from "@/types/peternak";

const schema = z.object({
  kodeTernak: z.string().min(1, "Kode ternak wajib diisi"),
  jenisTernakId: z.string().min(1, "Jenis ternak wajib dipilih"),
  peternakId: z.string().min(1, "Peternak wajib dipilih"),
  jenisKelamin: z.enum(["JANTAN", "BETINA"]),
  rasRumpun: z.string().optional(),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
});

type TernakValues = z.infer<typeof schema>;

interface TernakFormDialogProps {
  trigger: React.ReactNode;
  ternak?: Ternak;
  jenisOptions: JenisTernak[];
  peternakOptions: Pick<Peternak, "id" | "nama">[];
}

export function TernakFormDialog({
  trigger,
  ternak,
  jenisOptions,
  peternakOptions,
}: TernakFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(ternak);

  const form = useForm<TernakValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kodeTernak: ternak?.kodeTernak ?? "",
      jenisTernakId: ternak?.jenisTernakId ?? "",
      peternakId: ternak?.peternakId ?? "",
      jenisKelamin: ternak?.jenisKelamin ?? "JANTAN",
      rasRumpun: ternak?.rasRumpun ?? "",
      tanggalLahir: ternak ? toDateInputValue(ternak.tanggalLahir) : "",
    },
  });

  async function onSubmit(values: TernakValues) {
    const payload = {
      kodeTernak: values.kodeTernak,
      jenisTernakId: values.jenisTernakId,
      peternakId: values.peternakId,
      jenisKelamin: values.jenisKelamin,
      rasRumpun: values.rasRumpun || null,
      tanggalLahir: values.tanggalLahir,
    };

    const result = isEdit
      ? await updateTernakAction(ternak!.id, payload)
      : await createTernakAction(payload);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.success ?? "Berhasil disimpan.");
    setOpen(false);
    if (!isEdit) form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Ternak" : "Tambah Ternak"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data ternak." : "Tambahkan data ternak milik peternak."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="kodeTernak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Ternak</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. SAPI-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <FormField
                control={form.control}
                name="tanggalLahir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
