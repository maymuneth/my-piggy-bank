"use client";

import { useRouter } from "next/navigation";
import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
  const router = useRouter();

  function handleConnected(w: any, method: "privy" | "private_key" | "argent" | "braavos") {
    // Gerçek cüzdan adresini kaydet
    if (w?.address) {
      localStorage.setItem("wallet_address", w.address);
      localStorage.setItem("wallet_method", method);
    }
    router.push("/dashboard");
  }

  return <ConnectWallet onConnected={handleConnected} />;
}