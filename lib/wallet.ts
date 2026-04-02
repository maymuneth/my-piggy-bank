import {
  StarkSigner,
  ArgentXV050Preset,
  ArgentPreset,
  BraavosPreset,
} from "starkzap";
import { getSDK } from "./starkzap";

export type AccountType = "argent" | "argentv050" | "braavos";

// ── ArgentX / Braavos extension ile Starkzap wallet oluştur ──────────────────
export async function connectWithBrowserWallet() {
  const sdk = getSDK();
  const starknet = (window as any).starknet;
  if (!starknet?.account) throw new Error("Wallet not connected");

  // ArgentX account objesini CustomSigner olarak kullan
  const account = starknet.account;

  const signer = {
    getPubKey: async () => {
      return account.signer?.getPubKey?.() || "0x0";
    },
    signRaw: async (hash: string) => {
      const sig = await account.signer?.signRaw?.(hash);
      return sig || ["0x0", "0x0"];
    },
  };

  const wallet = await sdk.connectWallet({
    account: {
      signer: signer as any,
      accountClass: ArgentXV050Preset,
      address: starknet.selectedAddress,
    },
  });

  return wallet;
}

// ── Private Key ile bağlan ───────────────────────────────────────────────────
export async function connectWithPrivateKey(
  privateKey: string,
  accountType: AccountType = "argentv050"
) {
  const sdk = getSDK();
  const signer = new StarkSigner(privateKey);

  const presetMap = {
    argent: ArgentPreset,
    argentv050: ArgentXV050Preset,
    braavos: BraavosPreset,
  };

  const wallet = await sdk.connectWallet({
    account: {
      signer,
      accountClass: presetMap[accountType],
    },
  });

  return wallet;
}