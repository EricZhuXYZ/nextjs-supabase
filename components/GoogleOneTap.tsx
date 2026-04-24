"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useRef, useState } from "react";

type CredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: CredentialResponse) => void | Promise<void>;
    nonce?: string;
    use_fedcm_for_prompt?: boolean;
    itp_support?: boolean;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      type?: "standard" | "icon";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

async function generateNonce() {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return { nonce, hashedNonce };
}

export function GoogleOneTap({
  className,
  redirectTo = "/protected",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const initializeGoogleOneTap = useCallback(async () => {
    if (initializedRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleId = window.google?.accounts.id;

    if (!clientId || !googleId) return;

    initializedRef.current = true;
    setError(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.replace(redirectTo);
      return;
    }

    const { nonce, hashedNonce } = await generateNonce();

    googleId.initialize({
      client_id: clientId,
      nonce: hashedNonce,
      auto_select: true,
      cancel_on_tap_outside: false,
      callback: async (response) => {
        if (!response.credential) {
          setError("Google did not return a credential.");
          return;
        }

        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
          nonce,
        });

        if (error) {
          setError(error.message);
          return;
        }

        router.replace(redirectTo);
        router.refresh();
      },
    });

    if (buttonRef.current) {
      const buttonWidth = Math.min(
        320,
        Math.max(240, Math.floor(buttonRef.current.getBoundingClientRect().width)),
      );

      googleId.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        width: buttonWidth,
      });
    }

  }, [redirectTo, router]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => {
          void initializeGoogleOneTap();
        }}
      />
      <div ref={buttonRef} className="flex w-full justify-center" />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
