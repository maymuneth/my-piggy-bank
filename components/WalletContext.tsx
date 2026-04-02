"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { WalletState } from "@/types";

interface WalletContextType {
  walletState: WalletState;
  walletInstance: any | null;
  connectPrivy: (accessToken: string) => Promise<void>;
  connectPrivateKey: (privateKey: string, accountType?: string) => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletInstance, setWalletInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    method: null,
    strkBalance: "0",
    usdcBalance: "0",
  });

  const connectPrivy = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Privy connect", accessToken);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectPrivateKey = useCallback(async (privateKey: string, accountType?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("PK connect", privateKey, accountType);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletInstance(null);
    setWalletState({ address: null, connected: false, method: null, strkBalance: "0", usdcBalance: "0" });
  }, []);

  const refreshBalances = useCallback(async () => {}, []);

  return (
    <WalletContext.Provider value={{
      walletState, walletInstance, connectPrivy, connectPrivateKey,
      disconnect, refreshBalances, isLoading, error,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}