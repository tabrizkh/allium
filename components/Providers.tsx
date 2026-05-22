"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            marginTop: '80px',
          },
        }}
      />
      {children}
    </SessionProvider>
  );
}
