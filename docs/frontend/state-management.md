# State Management

## Perbedaan dengan konvensi umum di `CLAUDE.md`

`CLAUDE.md` menyebutkan React Query (TanStack Query) untuk server state dan Zustand untuk client state global sebagai konvensi standar proyek-proyek lain. **Kode frontend saat ini tidak memakai keduanya** — tidak ada `@tanstack/react-query` maupun `zustand` di `frontend/package.json`, dan folder `frontend/src/stores/` tidak ada isinya. Sebagai gantinya, proyek ini memakai pola **Server Components + Server Actions** penuh (native Next.js App Router), yang dipilih karena backend adalah sumber data satu-satunya dan tidak ada state real-time/client-only yang butuh caching lintas-komponen. Dokumen ini menjelaskan pola yang **sebenarnya dipakai**.

## Pola yang dipakai

### 1. Server state → Server Components + `services/*.service.ts`

Halaman (`app/(dashboard)/**/page.tsx`) adalah **async Server Component** yang langsung memanggil fungsi dari `services/*.service.ts` (yang di dalamnya memanggil `getServerApi()` dari `lib/api-server.ts`) — tanpa hook, tanpa cache client-side, tanpa `useEffect`:

```typescript
export default async function PeternakPage() {
  const peternak = await getPeternakList();
  return <PeternakTable data={peternak} />;
}
```

Data selalu fresh per request (server-rendered) — tidak ada stale-while-revalidate ala React Query. "Cache invalidation" dilakukan lewat `revalidatePath()` di Server Action setelah mutasi berhasil (lihat di bawah).

### 2. Mutasi → Server Actions (`features/*/actions.ts`)

Semua create/update/delete adalah Server Action (`"use server"`) yang memanggil fungsi `services/*.service.ts`, lalu `revalidatePath()` halaman terkait supaya Server Component di atas re-fetch data terbaru:

```typescript
export async function createPeternakAction(input: PeternakInput): Promise<ActionResult> {
  try {
    await createPeternak(input);
    revalidatePath("/peternak");
    return { success: "Peternak berhasil ditambahkan." };
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal menambahkan peternak.") };
  }
}
```

Komponen form (Client Component) memanggil Server Action ini langsung, biasanya dari `onSubmit` `react-hook-form`, lalu menampilkan hasil lewat toast (`sonner`). Return type seragam: `ActionResult` (`{ success?: string; error?: string }`, `types/action.ts`).

### 3. Sesi/auth state → cookie httpOnly, bukan client store

Status login **tidak disimpan** di Zustand/Context — sepenuhnya derived dari cookie `session_token` (httpOnly) yang dibaca ulang setiap request server (`getCurrentUser()` di `services/auth.service.ts`, dipanggil dari `(dashboard)/layout.tsx`). Lihat [decisions/adr-002](../decisions/adr-002-httponly-cookie-session-server-actions.md).

### 4. State lokal murni UI → `useState`

Untuk state yang benar-benar hanya dipakai satu komponen (buka/tutup dialog, mobile sidebar toggle) — pakai `useState` biasa, tidak ada abstraksi tambahan. Contoh: `mobileOpen` di `components/layout/dashboard-shell.tsx`.

## Kapan pola ini (bukan React Query/Zustand) mulai tidak cukup

Kalau ke depannya butuh: polling/real-time data, optimistic update kompleks, atau state client yang perlu di-share lintas route tanpa round-trip server (mis. filter yang harus tahan saat navigasi client-side) — itu saat yang tepat mempertimbangkan menambahkan React Query/Zustand sesuai konvensi umum di `CLAUDE.md`, bukan sebelum ada kebutuhan nyata.
