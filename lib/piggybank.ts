import { PiggyBank } from "../types";

export function savePiggyBank(piggy: PiggyBank) {
  const existing = getPiggyBanks(piggy.walletAddress);
  const updated = [...existing.filter((p) => p.id !== piggy.id), piggy];
  localStorage.setItem(`piggies_${piggy.walletAddress}`, JSON.stringify(updated));
}

export function getPiggyBanks(walletAddress: string): PiggyBank[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(`piggies_${walletAddress}`);
  return raw ? JSON.parse(raw) : [];
}

export function deletePiggyBank(walletAddress: string, id: string) {
  const existing = getPiggyBanks(walletAddress);
  const updated = existing.filter((p) => p.id !== id);
  localStorage.setItem(`piggies_${walletAddress}`, JSON.stringify(updated));
}