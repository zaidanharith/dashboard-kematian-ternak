"use client";

import { FiEdit2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/common/confirm-delete-button";
import { TernakFormDialog } from "./ternak-form-dialog";
import { deleteTernakAction } from "../actions";
import type { Ternak } from "@/types/ternak";
import type { JenisTernak } from "@/types/master";
import type { Peternak } from "@/types/peternak";

interface TernakRowActionsProps {
  ternak: Ternak;
  jenisOptions: JenisTernak[];
  peternakOptions: Pick<Peternak, "id" | "nama">[];
}

export function TernakRowActions({ ternak, jenisOptions, peternakOptions }: TernakRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <TernakFormDialog
        ternak={ternak}
        jenisOptions={jenisOptions}
        peternakOptions={peternakOptions}
        trigger={
          <Button variant="outline" size="icon-sm" aria-label={`Edit ${ternak.kodeTernak}`}>
            <FiEdit2 className="h-4 w-4" />
          </Button>
        }
      />
      <ConfirmDeleteButton
        action={deleteTernakAction.bind(null, ternak.id)}
        iconOnly
        title="Hapus ternak?"
        description={`Ternak "${ternak.kodeTernak}" akan dihapus permanen. Ternak yang memiliki laporan kematian tidak dapat dihapus.`}
      />
    </div>
  );
}
