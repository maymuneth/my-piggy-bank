import { Amount, mainnetValidators } from "starkzap";
import { TOKEN_CONFIG } from "./tokens";
import { PiggyBank } from "../types";

// Starknet Foundation validator pool adresi
const STRK_POOL = "0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7";

// ── STRK Stake et ────────────────────────────────────────────────────────────
export async function stakeSTRK(starkzapWallet: any, amountStr: string) {
  const amount = Amount.parse(amountStr, {
    symbol: "STRK",
    decimals: 18,
    address: TOKEN_CONFIG.STRK.address,
  });

  const tx = await starkzapWallet.stake(STRK_POOL, amount);
  await tx.wait();
  return STRK_POOL;
}

// ── Staking rewards sorgula ──────────────────────────────────────────────────
export async function getStakingRewards(starkzapWallet: any) {
  try {
    const position = await starkzapWallet.getPoolPosition(STRK_POOL);
    if (!position) return { staked: "0", rewards: "0" };
    return {
      staked: position.amount?.toFormatted() ?? "0",
      rewards: position.rewards?.toFormatted() ?? "0",
    };
  } catch {
    return { staked: "0", rewards: "0" };
  }
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────
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