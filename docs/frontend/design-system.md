# Design System

## Basis komponen: shadcn/ui

`frontend/components.json`:

| Setting | Nilai |
|---|---|
| `style` | `radix-nova` |
| `baseColor` | `neutral` |
| `cssVariables` | `true` (semua token warna lewat CSS variable, bukan hardcode Tailwind class) |
| `iconLibrary` | `lucide` |
| `rsc` | `true` (React Server Components) |

Komponen dasar hasil generate shadcn ada di `frontend/src/components/ui/` (satu file per komponen: `button.tsx`, `dialog.tsx`, `table.tsx`, `form.tsx`, dst.) — **jangan edit langsung struktur intinya**, perlakukan seperti kode vendor; kustomisasi lewat props/className atau lewat token tema di `globals.css`.

## Ikon: dua sumber, dipakai untuk konteks berbeda

- **`lucide-react`** — dipakai di dalam komponen shadcn/ui hasil generate (`components/ui/dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `sheet.tsx`, `sonner.tsx`). Ini bagian dari template shadcn, bukan pilihan manual.
- **`react-icons`** (khususnya set `react-icons/fi` — Feather Icons) — dipakai di semua kode aplikasi custom: navigasi sidebar (`lib/navigation.ts`), komponen fitur, komponen layout. Ini konvensi proyek (lihat `CLAUDE.md`) untuk kode di luar `components/ui/`.

Saat menambah komponen baru di luar `components/ui/`, pakai `react-icons`, bukan `lucide-react`.

## Tema warna ("Jamaica" — hijau & kuning)

Token warna didefinisikan sebagai CSS variable `oklch()` di `frontend/src/app/globals.css`, dipetakan lewat `@theme inline` ala Tailwind 4. Palet inti:

| Token | Peran | Nuansa |
|---|---|---|
| `--primary` | Aksi utama, tombol primer | Hijau (`oklch(0.623 0.169 149.18)`) |
| `--secondary` | Aksen sekunder | Kuning/emas (`oklch(0.861 0.173 91.96)`) |
| `--sidebar` | Background sidebar | Hijau tua |
| `--destructive` | Aksi berbahaya (hapus) | Merah |

Variabel dark mode didefinisikan lengkap di selector `.dark` (background hijau sangat gelap, foreground terang) — **tapi tidak ada `ThemeProvider`/toggle tema yang aktif di `app/layout.tsx` saat ini**, jadi UI berjalan mode terang secara default; `next-themes` ada di `package.json` tapi hanya dipakai lewat komponen `Toaster` (`components/ui/sonner.tsx`) untuk menyesuaikan warna toast, bukan untuk theming seluruh app.

## Font

- **Sans** (`--font-sans`) — [Outfit](https://fonts.google.com/specimen/Outfit), dimuat lewat `next/font/google` di `app/layout.tsx`.
- **Mono** (`--font-mono`) — [JetBrains Mono](https://www.jetbrains.com/lp/mono/), juga lewat `next/font/google`.

## Radius & shadow

`--radius: 1.25rem` sebagai basis; turunan `--radius-sm` s.d. `--radius-4xl` dihitung proporsional lewat `calc()`. Shadow dihitung dari `--shadow-color` (hijau gelap) dengan opacity rendah — konsisten dengan tema hijau di seluruh permukaan card/dialog/dropdown.

## Aturan pemakaian

- Selalu pakai token warna semantik (`bg-primary`, `text-muted-foreground`, `border-sidebar-border`, dst.) — jangan hardcode warna Tailwind default (`bg-green-600`) supaya tema tetap konsisten dan bisa diubah dari satu tempat.
- Satu komponen satu file, diorganisasi per fitur di `features/<nama-fitur>/components/`, bukan per tipe — lihat [components.md](./components.md).
