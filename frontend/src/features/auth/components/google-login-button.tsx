"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { googleLoginAction } from "../actions";

interface GoogleLoginButtonProps {
  disabled?: boolean;
}

export function GoogleLoginButton({ disabled }: GoogleLoginButtonProps) {
  const router = useRouter();

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Login Google belum dikonfigurasi.
      </p>
    );
  }

  return (
    <div
      className="flex justify-center [&>div]:w-full"
      aria-disabled={disabled}
      style={disabled ? { pointerEvents: "none", opacity: 0.6 } : undefined}
    >
      <GoogleLogin
        theme="outline"
        size="large"
        width="320"
        text="signin_with"
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) {
            toast.error("Gagal memperoleh kredensial Google.");
            return;
          }
          const result = await googleLoginAction(credentialResponse.credential);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          router.replace("/dashboard");
          router.refresh();
        }}
        onError={() => {
          toast.error("Login Google dibatalkan atau gagal.");
        }}
      />
    </div>
  );
}
