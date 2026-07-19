"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateProfilAction } from "../actions";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
});

type ProfilValues = z.infer<typeof schema>;

export function ProfilForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const form = useForm<ProfilValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName },
  });

  async function onSubmit(values: ProfilValues) {
    const result = await updateProfilAction(values.name);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.success ?? "Profil diperbarui.");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
