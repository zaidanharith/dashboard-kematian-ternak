# Folder Structure

Tree beranotasi berdasarkan struktur repo saat ini (di luar `node_modules/`, `.next/`, `.git/`).

```text
backend/
  prisma/
    schema.prisma              # User, Peternak, JenisTernak, Ternak, PenyebabKematian, LaporanKematian, LaporanKelahiran
    seed.js                    # seed data referensi (jenis ternak, penyebab kematian) + bootstrap akun SUPERADMIN
  prisma.config.js             # konfigurasi koneksi Prisma 7 CLI (DIRECT_URL) — lihat docs/database/prisma.md
  src/
    controllers/                 # 1 file per resource, akses Prisma langsung untuk CRUD sederhana
      analisis.controller.js
      auth.controller.js
      dashboard.controller.js
      jenis-ternak.controller.js
      laporan-kelahiran.controller.js
      laporan-kematian.controller.js
      penyebab-kematian.controller.js
      peternak.controller.js
      ternak.controller.js
      user.controller.js
    database/connections/
      prisma_client.js          # singleton Prisma Client, driver adapter @prisma/adapter-pg
    lib/
      recording-client.js       # fetch wrapper ke backend recording-ternak (x-internal-key)
    middlewares/
      auth.middleware.js        # verifikasi JWT dari header Authorization
      role.middleware.js        # role gate (SUPERADMIN/ADMIN/VIEWER)
      internal-key.middleware.js # cek header x-internal-key untuk endpoint /internal/*
    routes/                     # 1 file per resource + api.js sebagai aggregator/self-doc endpoint
      internal.routes.js        # /internal/peternak/* — dipanggil recording-ternak
    services/                   # HANYA logic non-trivial (bukan wajib per resource)
      akta-kelahiran.service.js # generate docx & pdf akta kelahiran
      berita-acara.service.js   # generate docx & pdf berita acara kematian
      recording-sync.service.js # push perubahan Peternak ke recording-ternak
    templates/
      berita-acara-kematian.docx  # template docxtemplater (akta-kelahiran.docx BELUM ada, lihat setup/troubleshooting.md)
    __tests__/                  # Jest, mirroring src/ (controllers, middlewares, services, integration)
    app.js                      # Express app (tanpa .listen(), dipakai Supertest)
    server.js                   # entrypoint, load .env lalu app.listen()

frontend/
  src/
    app/
      (auth)/login/page.tsx           # halaman login (route group, tanpa shell dashboard)
      (dashboard)/                    # semua halaman yang butuh sesi login, dibungkus DashboardShell
        dashboard/page.tsx            # ringkasan dashboard
        laporan/                      # laporan kematian (list, detail, buat, edit)
        kelahiran/                    # laporan kelahiran (list, detail, buat, edit)
        peternak/                     # data peternak
        ternak/page.tsx               # data ternak
        analisis/page.tsx             # analisis penyebab kematian
        populasi/page.tsx             # analisis populasi per wilayah
        master/jenis-ternak/page.tsx  # master data jenis ternak (ADMIN ke atas)
        master/penyebab-kematian/page.tsx
        pengguna/page.tsx             # manajemen akun (SUPERADMIN)
        profil/page.tsx               # profil user login
      berita-acara/[id]/route.ts      # Route Handler: proxy download DOCX/PDF berita acara
      akta-kelahiran/[id]/route.ts    # Route Handler: proxy download DOCX/PDF akta kelahiran
      layout.tsx                      # root layout (font, Toaster)
      page.tsx                        # root ("/") — redirect via proxy.ts ke /login atau /dashboard
    components/
      ui/          # shadcn/ui primitives (button, dialog, table, form, dst.)
      common/       # komponen reusable lintas fitur (page-header, stat-card, empty-state, dst.)
      layout/       # dashboard-shell, sidebar-nav, user-menu
    features/       # organisasi per fitur — actions.ts (Server Actions) + components/
      auth/
      dashboard/
      kelahiran/
      laporan/
      master/
      pengguna/
      peternak/
      populasi/
      profil/
      ternak/
    services/       # *.service.ts per domain — satu-satunya lapisan yang boleh memanggil Axios
    types/          # tipe TypeScript per domain, cermin dari response backend
    lib/
      axios.ts       # instance Axios sisi client (tanpa token — dipakai untuk auth.service login/google)
      api-server.ts  # instance Axios sisi server, menyisipkan Bearer token dari cookie (server-only)
      constants.ts   # nama cookie sesi & masa berlakunya
      navigation.ts  # struktur menu sidebar per role
      permissions.ts # helper cek izin berdasarkan role
      utils.ts
    utils/format.ts  # formatter tanggal/angka
    proxy.ts         # Next.js middleware (nama baru untuk middleware.ts di Next 16) — session guard

docs/                          # dokumentasi proyek (folder ini)
```

## Catatan

- `frontend/src/hooks/`, `frontend/src/stores/`, `frontend/src/styles/` yang disebut di `CLAUDE.md` sebagai folder yang "disiapkan" **tidak ada isinya / tidak dipakai** di kode saat ini — state management berjalan lewat Server Components + Server Actions, bukan Zustand/TanStack Query. Lihat [frontend/state-management.md](../frontend/state-management.md).
- `docs/` sebelumnya kosong; struktur di atas dan file-file di bawahnya melengkapi folder ini sesuai kondisi kode saat dokumen ini dibuat.
