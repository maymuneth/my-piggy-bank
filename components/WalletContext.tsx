"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { WalletState } from "@/types";
import { connectWithPrivy, connectWithPrivateKey, getBalances, AccountType } from "@/lib/wallet";

interface WalletContextType {
  walletState: WalletState;
  walletInstance: any | null;
  connectPrivy: (accessToken: string) => Promise<void>;
  connectPrivateKey: (privateKey: string, accountType?: AccountType) => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletInstance, setWalletInstance] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    connectionType: null,
    strkBalance: "0",
    usdcBalance: "0",
  });

  const handleConnect = useCallback(async (wallet: any, type: "privy" | "privatekey") => {
    const balances = await getBalances(wallet);
    setWalletInstance(wallet);
    setWalletState({
      address: wallet.address,
      isConnected: true,
      connectionType: type,
      strkBalance: balances.strk,
      usdcBalance: balances.usdc,
    });
  }, []);

  const connectPrivy = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = await connectWithPrivy(accessToken);
      await handleConnect(wallet, "privy");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [handleConnect]);

  const connectPrivateKeyFn = useCallback(async (privateKey: string, accountType?: AccountType) => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = await connectWithPrivateKey(privateKey, accountType);
      await handleConnect(wallet, "privatekey");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [handleConnect]);

  const disconnect = useCallback(() => {
    setWalletInstance(null);
    setWalletState({
      address: null,
      isConnected: false,
      connectionType: null,
      strkBalance: "0",
      usdcBalance: "0",
    });
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!walletInstance) return;
    const balances = await getBalances(walletInstance);
    setWalletState((prev) => ({
      ...prev,
      strkBalance: balances.strk,
      usdcBalance: balances.usdc,
    }));
  }, [walletInstance]);

  return (
    <WalletContext.Provider
      value={{
        walletState,
        walletInstance,
        connectPrivy,
        connectPrivateKey: connectPrivateKeyFn,
        disconnect,
        refreshBalances,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
