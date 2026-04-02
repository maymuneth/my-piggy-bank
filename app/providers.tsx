"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/components/WalletContext";
import { LanguageProvider } from "@/components/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "google", "twitter"],
        appearance: {
          theme: "light",
          accentColor: "#e85d2f",
        },
        embeddedWallets: {
          createOnLogin: "off",
        },
      }}
    >
      <LanguageProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
      </LanguageProvider>
    </PrivyProvider>
  );
}