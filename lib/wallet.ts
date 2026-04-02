import { StarkSigner, ArgentXV050Preset, ArgentPreset, BraavosPreset } from "starkzap";
import { getSDK } from "./starkzap";

export type AccountType = "argent" | "argentv050" | "braavos";

export async function connectWithPrivateKey(privateKey: string, accountType: AccountType = "argentv050") {
  const sdk = getSDK();
  const signer = new StarkSigner(privateKey);
  const presetMap = {
    argent: ArgentPreset,
    argentv050: ArgentXV050Preset,
    braavos: BraavosPreset,
  };
  const wallet = await sdk.connectWallet({
    account: { signer, accountClass: presetMap[accountType] },
  });
  return wallet;
}

export async function getBalances(wallet: any) {
  try {
    const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
    const USDC = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
    const [strk, usdc] = await Promise.all([
      wallet.getBalance(STRK),
      wallet.getBalance(USDC),
    ]);
    return { strk: strk.toFormatted(), usdc: usdc.toFormatted() };
  } catch {
    return { strk: "0", usdc: "0" };
  }
}