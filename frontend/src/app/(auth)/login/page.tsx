import type { Metadata } from "next";
import Image from "next/image";
import { FiCheckCircle } from "react-icons/fi";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

const SOROTAN = [
  "Pencatatan laporan kematian ternak",
  "Berita acara otomatis siap unduh",
  "Analisis penyebab kematian dominan",
];

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sidebar-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm">
            <Image
              src="/logo-bumdes.png"
              alt="Logo BUMDes Sumber Abadi"
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">BUMDes Sumber Abadi</p>
            <p className="text-xs text-sidebar-foreground/70">Desa Besuki</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Catat kematian ternak desa dengan rapi dan resmi.
          </h1>
          <ul className="space-y-3">
            {SOROTAN.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sidebar-foreground/85">
                <FiCheckCircle className="h-5 w-5 shrink-0 text-secondary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/60">
          BUMDes Sumber Abadi · Desa Besuki
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-border">
              <Image
                src="/logo-bumdes.png"
                alt="Logo BUMDes Sumber Abadi"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">BUMDes Sumber Abadi</p>
              <p className="text-xs text-muted-foreground">Desa Besuki</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Selamat datang kembali</h2>
            <p className="text-sm text-muted-foreground">
              Masuk untuk mengelola data kematian ternak desa.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
