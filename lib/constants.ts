import { TokenSymbol } from "@/types";

export const TOKENS: Record<
  TokenSymbol,
  { address: string; symbol: string; decimals: number; supportsStaking: boolean }
> = {
  STRK: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    symbol: "STRK",
    decimals: 18,
    supportsStaking: true,
  },
  USDC: {
    address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    symbol: "USDC",
    decimals: 6,
    supportsStaking: false,
  },
};

// Default STRK staking pool on mainnet (Ekubo validator)
export const DEFAULT_STAKING_POOL =
  "0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7";

export const GOAL_EMOJIS: Record<string, string> = {
  house: "🏠",
  car: "🚗",
  vacation: "✈️",
  education: "🎓",
  emergency: "🛡️",
  kids: "🐷",
  custom: "⭐",
};

export const GOAL_LABELS: Record<string, string> = {
  house: "Ev",
  car: "Araba",
  vacation: "Tatil",
  education: "Eğitim",
  emergency: "Acil Fon",
  kids: "Çocuk Kumbarası",
  custom: "Özel Hedef",
};
