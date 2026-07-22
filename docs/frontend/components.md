# Components

## Tiga lapisan komponen

```text
components/ui/       shadcn/ui primitives — vendor-like, jangan diubah strukturnya
components/common/   reusable lintas fitur, tidak terikat satu domain data
components/layout/   kerangka halaman (shell, sidebar, header)
features/*/components/  spesifik satu fitur/domain data
```

### `components/ui/`

Primitives shadcn: `button`, `card`, `dialog`, `alert-dialog`, `dropdown-menu`, `form`, `input`, `label`, `popover`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `table`, `tabs`, `textarea`, `tooltip`, `avatar`, `badge`.

### `components/common/`

Komponen generik yang dipakai di banyak fitur, tidak tahu-menahu soal domain data spesifik:

| Komponen | Kegunaan |
|---|---|
| `page-header.tsx` | Header halaman (judul + aksi) konsisten di semua halaman dashboard |
| `stat-card.tsx` | Kartu angka ringkasan (dipakai di `/dashboard`, `/populasi`) |
| `empty-state.tsx` | Placeholder saat data kosong |
| `description-list.tsx` | Layout label-value untuk halaman detail (mis. detail peternak) |
| `confirm-delete-button.tsx` | Tombol hapus dengan konfirmasi (`AlertDialog`), dipakai di semua tabel yang punya aksi hapus |
| `search-input.tsx` | Input pencarian generik |
| `role-badge.tsx` | Badge warna per role (`SUPERADMIN`/`ADMIN`/`PETUGAS`) |
| `status-ternak-badge.tsx` | Badge warna status ternak (`HIDUP`/`MATI`) |

### `components/layout/`

`dashboard-shell.tsx` (kerangka sidebar + header + konten, menerima `user` untuk filter menu per role), `sidebar-nav.tsx` (render `NAV_GROUPS` dari `lib/navigation.ts` sesuai role), `user-menu.tsx` (dropdown profil + logout).

### `features/*/components/`

Komponen yang terikat satu domain — form, kartu, chart spesifik. Contoh: `features/laporan/components/laporan-form.tsx`, `features/analisis/components/analisis-chart.tsx`. Selalu didampingi `features/*/actions.ts` (Server Actions) di level yang sama.

## Konvensi

- **Satu komponen satu file** — hindari file dengan lebih dari satu komponen besar.
- **Penamaan file**: kebab-case (`peternak-form-dialog.tsx`, `login-form.tsx`), match dengan konvensi hooks (`use-*.ts` — folder `hooks/` sendiri saat ini kosong/tidak dipakai) dan service (`*.service.ts`).
- **Client vs Server Component**: default Server Component (tanpa `"use client"`) kecuali butuh interaktivitas/state browser (form dengan `react-hook-form`, dialog dengan state buka-tutup, chart `recharts`) — komponen-komponen itu diberi `"use client"` eksplisit di baris pertama, mis. `features/auth/components/google-login-button.tsx`.
- **Route groups** App Router dipakai untuk memisahkan layout: `(auth)/` untuk halaman login tanpa shell dashboard, `(dashboard)/` untuk semua halaman yang butuh sesi login dan dibungkus `DashboardShell`.
