import { TokenSymbol } from "../types";

export const TOKEN_CONFIG: Record<TokenSymbol, {
  address: string;
  symbol: TokenSymbol;
  decimals: number;
  supportsStaking: boolean;
  apy: string;
  color: string;
  bgColor: string;
}> = {
  STRK: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    symbol: "STRK",
    decimals: 18,
    supportsStaking: true,
    apy: "~10-15%",
    color: "#FF6B35",
    bgColor: "#FFF3EE",
  },
  USDC: {
    address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    symbol: "USDC",
    decimals: 6,
    supportsStaking: false,
    apy: "Yakında",
    color: "#2775CA",
    bgColor: "#EEF4FF",
  },
};

export const STRK_MAINNET_VALIDATOR = {
  // Starknet Foundation validator — production
  stakerAddress: "0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7",
  name: "Starknet Foundation",
};
