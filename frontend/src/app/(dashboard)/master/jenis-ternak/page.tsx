import type { Metadata } from "next";
import { FiTag } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { MasterManager } from "@/features/master/components/master-manager";
import {
  createJenisTernakAction,
  updateJenisTernakAction,
  deleteJenisTernakAction,
} from "@/features/master/actions";
import { getJenisTernakList } from "@/services/master.service";

export const metadata: Metadata = {
  title: "Jenis Ternak",
};

export default async function JenisTernakPage() {
  const jenisList = await getJenisTernakList();

  return (
    <>
      <PageHeader
        title="Jenis Ternak"
        description="Kelola daftar jenis ternak (sapi, kambing, ayam, dll)."
      />
      <MasterManager
        items={jenisList}
        singular="Jenis Ternak"
        icon={FiTag}
        createAction={createJenisTernakAction}
        updateAction={updateJenisTernakAction}
        deleteAction={deleteJenisTernakAction}
      />
    </>
  );
}
