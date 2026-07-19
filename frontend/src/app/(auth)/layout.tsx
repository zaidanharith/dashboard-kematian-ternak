import { GoogleAuthProvider } from "@/features/auth/components/google-auth-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      {children}
    </GoogleAuthProvider>
  );
}
