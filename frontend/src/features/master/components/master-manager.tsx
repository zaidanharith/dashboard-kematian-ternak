"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDeleteButton } from "@/components/common/confirm-delete-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionResult } from "@/types/action";
import type { IconType } from "react-icons";

interface MasterItem {
  id: string;
  nama: string;
}

interface MasterManagerProps {
  items: MasterItem[];
  singular: string;
  icon: IconType;
  createAction: (nama: string) => Promise<ActionResult>;
  updateAction: (id: string, nama: string) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<ActionResult>;
}

export function MasterManager({
  items,
  singular,
  icon: Icon,
  createAction,
  updateAction,
  deleteAction,
}: MasterManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MasterItem | null>(null);
  const [nama, setNama] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setNama("");
    setDialogOpen(true);
  }

  function openEdit(item: MasterItem) {
    setEditing(item);
    setNama(item.nama);
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nama.trim()) {
      toast.error("Nama wajib diisi.");
      return;
    }
    setSubmitting(true);
    const result = editing
      ? await updateAction(editing.id, nama.trim())
      : await createAction(nama.trim());
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.success ?? "Berhasil disimpan.");
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <FiPlus className="h-4 w-4" />
          Tambah {singular}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Icon} title={`Belum ada ${singular.toLowerCase()}`} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama {singular}</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit ${item.nama}`}
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <ConfirmDeleteButton
                          action={deleteAction.bind(null, item.id)}
                          iconOnly
                          title={`Hapus ${singular.toLowerCase()}?`}
                          description={`"${item.nama}" akan dihapus. Data yang masih digunakan tidak dapat dihapus.`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${singular}` : `Tambah ${singular}`}
            </DialogTitle>
            <DialogDescription>
              {editing ? `Perbarui nama ${singular.toLowerCase()}.` : `Tambahkan ${singular.toLowerCase()} baru.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              placeholder={`Nama ${singular.toLowerCase()}`}
              autoFocus
              aria-label={`Nama ${singular}`}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
