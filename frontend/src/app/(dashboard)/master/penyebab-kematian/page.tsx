import type { Metadata } from "next";
import { FiActivity } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { MasterManager } from "@/features/master/components/master-manager";
import {
  createPenyebabKematianAction,
  updatePenyebabKematianAction,
  deletePenyebabKematianAction,
} from "@/features/master/actions";
import { getPenyebabKematianList } from "@/services/master.service";

export const metadata: Metadata = {
  title: "Penyebab Kematian",
};

export default async function PenyebabKematianPage() {
  const penyebabList = await getPenyebabKematianList();

  return (
    <>
      <PageHeader
        title="Penyebab Kematian"
        description="Kelola daftar penyebab kematian yang dapat dipilih pada laporan."
      />
      <MasterManager
        items={penyebabList}
        singular="Penyebab Kematian"
        icon={<FiActivity className="h-6 w-6" />}
        createAction={createPenyebabKematianAction}
        updateAction={updatePenyebabKematianAction}
        deleteAction={deletePenyebabKematianAction}
      />
    </>
  );
}
