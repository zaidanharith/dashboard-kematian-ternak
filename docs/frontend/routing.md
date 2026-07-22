# Routing

Next.js **App Router** murni (`src/app/`) — tidak ada `pages/` di proyek ini.

## Route groups

| Group | Layout | Isi |
|---|---|---|
| `(auth)/` | `layout.tsx` minimal, tanpa shell dashboard | `/login` |
| `(dashboard)/` | `layout.tsx` memanggil `getCurrentUser()`, redirect ke `/login` jika tidak ada sesi, lalu bungkus `DashboardShell` | Semua halaman utama aplikasi |

Route groups (`(nama)`) tidak muncul di URL — hanya untuk mengelompokkan layout.

## Peta halaman (`(dashboard)/`)

| Route | Halaman | Akses (lihat `lib/navigation.ts`) |
|---|---|---|
| `/dashboard` | Ringkasan dashboard | Semua role |
| `/laporan` , `/laporan/baru`, `/laporan/[id]`, `/laporan/[id]/edit` | CRUD laporan kematian | Semua role (hapus dibatasi di UI lewat `lib/permissions.ts`) |
| `/kelahiran`, `/kelahiran/baru`, `/kelahiran/[id]`, `/kelahiran/[id]/edit` | CRUD laporan kelahiran | Semua role |
| `/analisis` | Analisis penyebab kematian | Semua role |
| `/populasi` | Analisis populasi per wilayah | Semua role |
| `/peternak`, `/peternak/[id]` | Data peternak | Semua role |
| `/ternak` | Data ternak | Semua role |
| `/master/jenis-ternak` | Master data jenis ternak | `ADMIN`, `SUPERADMIN` |
| `/master/penyebab-kematian` | Master data penyebab kematian | `ADMIN`, `SUPERADMIN` |
| `/pengguna` | Manajemen akun | `SUPERADMIN` |
| `/profil` | Profil user login | Semua role |

Filter akses di atas terjadi di dua tempat: `lib/navigation.ts` (`navGroupsForRole`) menyembunyikan item menu yang tidak relevan, dan `lib/permissions.ts` menyembunyikan tombol aksi (hapus, kelola master data, kelola user) di dalam halaman. **Ini hanya UX** — enforcement sebenarnya tetap di backend (`role.middleware.js`); halaman/tombol yang disembunyikan di frontend tidak menggantikan proteksi API.

## Route Handlers (bukan halaman)

| Route | File | Fungsi |
|---|---|---|
| `/berita-acara/[id]` | `app/berita-acara/[id]/route.ts` | Proxy download DOCX/PDF berita acara kematian (menyisipkan token session, streaming buffer) |
| `/akta-kelahiran/[id]` | `app/akta-kelahiran/[id]/route.ts` | Proxy download DOCX/PDF akta kelahiran |

## `proxy.ts` — session guard (middleware)

`frontend/src/proxy.ts` adalah Next.js Middleware (nama file `proxy.ts` menggantikan `middleware.ts` konvensional, mengikuti penamaan baru Next.js 16). Logikanya:

```text
tidak ada cookie session_token DAN bukan /login  →  redirect ke /login
ada cookie session_token DAN sedang di /login    →  redirect ke /dashboard
selain itu                                        →  lanjut normal
```

`matcher` mengecualikan asset statis (`_next/static`, `_next/image`, `favicon.ico`, file dengan ekstensi) — jadi berlaku untuk semua route halaman termasuk Route Handler di atas.

## Path alias

Semua import lintas folder memakai alias `@/*` → `src/*` (`tsconfig.json`), bukan relative import (`../../../`).
