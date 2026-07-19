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
import { createPeternakAction, updatePeternakAction } from "../actions";
import type { Peternak } from "@/types/peternak";

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  nik: z.string().min(1, "NIK wajib diisi").regex(/^\d+$/, "NIK hanya boleh angka"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  telepon: z.string().min(1, "Nomor telepon wajib diisi"),
  dusun: z.string().min(1, "Dusun wajib diisi"),
  rt: z.string().min(1, "RT wajib diisi"),
  rw: z.string().min(1, "RW wajib diisi"),
});

type PeternakValues = z.infer<typeof schema>;

interface PeternakFormDialogProps {
  trigger: React.ReactNode;
  peternak?: Peternak;
}

export function PeternakFormDialog({ trigger, peternak }: PeternakFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(peternak);

  const form = useForm<PeternakValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama: peternak?.nama ?? "",
      nik: peternak?.nik ?? "",
      alamat: peternak?.alamat ?? "",
      telepon: peternak?.telepon ?? "",
      dusun: peternak?.dusun ?? "",
      rt: peternak?.rt ?? "",
      rw: peternak?.rw ?? "",
    },
  });

  async function onSubmit(values: PeternakValues) {
    const result = isEdit
      ? await updatePeternakAction(peternak!.id, values)
      : await createPeternakAction(values);

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !isEdit) form.reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Peternak" : "Tambah Peternak"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data peternak." : "Tambahkan data peternak baru ke sistem."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama peternak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" placeholder="Nomor Induk Kependudukan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="telepon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl>
                      <Input inputMode="tel" placeholder="08xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dusun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dusun</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama dusun" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RT</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RW</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="002" {...field} />
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
