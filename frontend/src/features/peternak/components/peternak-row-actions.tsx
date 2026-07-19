"use client";

import { FiEdit2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/common/confirm-delete-button";
import { PeternakFormDialog } from "./peternak-form-dialog";
import { deletePeternakAction } from "../actions";
import type { Peternak } from "@/types/peternak";

export function PeternakRowActions({ peternak }: { peternak: Peternak }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <PeternakFormDialog
        peternak={peternak}
        trigger={
          <Button variant="outline" size="icon-sm" aria-label={`Edit ${peternak.nama}`}>
            <FiEdit2 className="h-4 w-4" />
          </Button>
        }
      />
      <ConfirmDeleteButton
        action={deletePeternakAction.bind(null, peternak.id)}
        iconOnly
        title="Hapus peternak?"
        description={`Peternak "${peternak.nama}" beserta seluruh data ternaknya akan dihapus permanen.`}
      />
    </div>
  );
}
