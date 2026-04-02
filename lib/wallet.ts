export type AccountType = "argent" | "argentv050" | "braavos";

export async function connectWithPrivateKey(privateKey: string, accountType: AccountType = "argentv050") {
  // Private key bağlantısı - sadece local test için
  console.log("connectWithPrivateKey called", accountType);
  return null;
}

export async function getBalances(wallet: any) {
  return { strk: "0", usdc: "0" };
}