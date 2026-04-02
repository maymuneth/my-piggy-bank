export type PiggyMode = "kids" | "goal";

export type GoalType =
  | "house"
  | "car"
  | "vacation"
  | "education"
  | "emergency"
  | "custom";

export type TokenSymbol = "STRK" | "USDC";

export interface GoalMeta {
  type: GoalType;
  label: string;
  emoji: string;
  description: string;
}

export interface PiggyBank {
  id: string;
  name: string;
  mode: PiggyMode;
  goalType: GoalType;
  token: TokenSymbol;
  targetAmount: string;
  currentAmount: string;
  stakedAmount: string;
  rewardsEarned: string;
  lockUntil: number;
  createdAt: number;
  walletAddress: string;
  poolAddress?: string;
  isLocked: boolean;
  parentWallet?: string;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  method: "privy" | "private_key" | null;
  strkBalance: string;
  usdcBalance: string;
}

export const GOAL_OPTIONS: GoalMeta[] = [
  { type: "house",     label: "Ev",       emoji: "🏠", description: "İlk evim" },
  { type: "car",       label: "Araba",    emoji: "🚗", description: "Yeni araç" },
  { type: "vacation",  label: "Tatil",    emoji: "✈️", description: "Hayal tatil" },
  { type: "education", label: "Eğitim",   emoji: "🎓", description: "Okul / kurs" },
  { type: "emergency", label: "Acil",     emoji: "🛡️", description: "Acil fon" },
  { type: "custom",    label: "Özel",     emoji: "⭐", description: "Kendi hedefim" },
];

export const LOCK_DURATIONS = [
  { label: "1 Hafta",   days: 7 },
  { label: "1 Ay",      days: 30 },
  { label: "3 Ay",      days: 90 },
  { label: "6 Ay",      days: 180 },
  { label: "1 Yıl",     days: 365 },
  { label: "2 Yıl",     days: 730 },
  { label: "5 Yıl",     days: 1825 },
];
