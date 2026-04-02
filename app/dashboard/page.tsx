"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PiggyCard from "../../components/PiggyCard";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLang } from "../../components/LanguageContext";
import { PiggyBank } from "../../types";
import { getPiggyBanks, savePiggyBank } from "../../lib/piggybank";

const MOCK_WALLET = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState(MOCK_WALLET);
  const [piggies, setPiggies] = useState<PiggyBank[]>([]);
  const [filter, setFilter] = useState<"all" | "kids" | "goal">("all");
  const [depositPiggy, setDepositPiggy] = useState<PiggyBank | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("wallet_address");
    const address = saved || MOCK_WALLET;
    setWalletAddress(address);
    const data = getPiggyBanks(address);
    setPiggies(data);
  }, []);

  function reload() {
    const address = localStorage.getItem("wallet_address") || MOCK_WALLET;
    setPiggies(getPiggyBanks(address));
  }

  async function handleDeposit() {
    if (!depositPiggy || !depositAmount || parseFloat(depositAmount) <= 0) return;
    setDepositing(true);
    try {
      const starknet = (window as any).starknet;
      if (!starknet?.account) throw new Error("Wallet not connected");

      if (depositPiggy.token === "STRK") {
        const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
        const poolContract = depositPiggy.poolAddress;
        if (!poolContract) throw new Error("Pool address not found");

        const amountBig = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
        const amountHex = "0x" + amountBig.toString(16);

        // Önce approve
await starknet.account.execute([{
  contractAddress: STRK_ADDRESS,
  entrypoint: "approve",
  calldata: [poolContract, amountHex, "0"],
}]);

await new Promise(r => setTimeout(r, 5000));

// Pool member kontrolü — direkt add dene
const stakeEntrypoint = "add_to_delegation_pool";
const stakeCalldata: string[] = [amountHex, "0x0"];

await starknet.account.execute([{
  contractAddress: poolContract,
  entrypoint: stakeEntrypoint,
  calldata: stakeCalldata,
}]);
      }

      // LocalStorage güncelle
      const updated = {
        ...depositPiggy,
        currentAmount: (parseFloat(depositPiggy.currentAmount) + parseFloat(depositAmount)).toString(),
        stakedAmount: (parseFloat(depositPiggy.stakedAmount) + parseFloat(depositAmount)).toString(),
      };
      savePiggyBank(updated);
      reload();
      setDepositPiggy(null);
      setDepositAmount("");
      alert(`✅ ${depositAmount} ${depositPiggy.token} deposited!`);
    } catch (e: any) {
      alert("❌ " + (e.message || "Transaction failed"));
    } finally {
      setDepositing(false);
    }
  }

  const filtered = piggies.filter((p) => filter === "all" || p.mode === filter);
  const totalSTRK = piggies.filter((p) => p.token === "STRK").reduce((s, p) => s + parseFloat(p.currentAmount), 0);
  const totalUSDC = piggies.filter((p) => p.token === "USDC").reduce((s, p) => s + parseFloat(p.currentAmount), 0);
  const totalRewards = piggies.reduce((s, p) => s + parseFloat(p.rewardsEarned), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* Deposit Modal */}
      {depositPiggy && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "white", borderRadius: 24, padding: 32,
            width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <h2 style={{ fontSize: 20, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, marginBottom: 6 }}>
              + Deposit to {depositPiggy.name}
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
              Current: {parseFloat(depositPiggy.currentAmount).toFixed(2)} / {depositPiggy.targetAmount} {depositPiggy.token}
            </p>

            {/* Progress */}
            <div style={{ height: 8, background: "rgba(26,26,46,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 20 }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, (parseFloat(depositPiggy.currentAmount) / parseFloat(depositPiggy.targetAmount)) * 100)}%`,
                background: "var(--strk-color, #e85d2f)", borderRadius: 100,
              }} />
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 8, display: "block" }}>
                Amount ({depositPiggy.token})
              </span>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%", padding: "14px 70px 14px 16px",
                    border: "1.5px solid var(--border)", borderRadius: 12,
                    fontSize: 18, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700,
                    outline: "none", color: "var(--ink)", background: "white",
                  }}
                />
                <span style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  fontWeight: 700, color: "#e85d2f", fontSize: 14,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}>
                  {depositPiggy.token}
                </span>
              </div>
            </label>

            {/* Need info */}
            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div style={{
                padding: "10px 14px", background: "#F0FFF4", borderRadius: 10,
                fontSize: 13, color: "#1A8C3A", marginBottom: 16,
              }}>
                After deposit: {(parseFloat(depositPiggy.currentAmount) + parseFloat(depositAmount)).toFixed(2)} / {depositPiggy.targetAmount} {depositPiggy.token}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setDepositPiggy(null); setDepositAmount(""); }}
                style={{
                  flex: 1, padding: "12px",
                  border: "1.5px solid var(--border)", borderRadius: 12,
                  background: "transparent", cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: 14,
                  color: "var(--ink)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                style={{
                  flex: 2, padding: "12px",
                  background: "var(--ink)", color: "white",
                  border: "none", borderRadius: 12,
                  cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600, fontSize: 14,
                }}
              >
                {depositing ? "Processing..." : `Deposit ${depositAmount || "0"} ${depositPiggy.token}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "white", borderBottom: "1px solid var(--border)",
        padding: "16px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🐑</span>
          <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 18 }}>
            My Piggy Bank
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSwitcher />
          <span style={{
            fontFamily: "monospace", fontSize: 12, color: "var(--muted)",
            background: "rgba(26,26,46,0.05)", padding: "6px 10px", borderRadius: 8,
          }}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <button onClick={() => router.push("/")} style={{
            background: "transparent", border: "1.5px solid var(--border)",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer",
            fontSize: 12, fontFamily: "Plus Jakarta Sans, sans-serif",
          }}>
            Exit
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { label: t("strkBalance"), value: `${totalSTRK.toLocaleString()}`, unit: "STRK", color: "var(--strk-color)" },
            { label: t("usdcBalance"), value: `${totalUSDC.toLocaleString()}`, unit: "USDC", color: "var(--usdc-color)" },
            { label: t("totalSaved"),  value: `+${totalRewards.toFixed(2)}`,   unit: "STRK", color: "#1A8C3A" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "white", border: "1px solid var(--border)",
              borderRadius: 18, padding: "18px 20px",
            }}>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 22, color: s.color }}>
                {s.value}
                <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 6 }}>{s.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Filter + Add */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "all",  label: "All" },
              { id: "goal", label: "🎯 Goal" },
              { id: "kids", label: "👶 Kids" },
            ].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id as any)} style={{
                padding: "7px 14px",
                border: `1.5px solid ${filter === f.id ? "var(--ink)" : "var(--border)"}`,
                borderRadius: 100,
                background: filter === f.id ? "var(--ink)" : "transparent",
                color: filter === f.id ? "white" : "var(--muted)",
                cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: 13,
                transition: "all 0.2s",
              }}>
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => router.push("/create")} style={{ gap: 6 }}>
            {t("newPiggyBank")}
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "white", borderRadius: 24,
            border: "1px dashed var(--border)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🐑</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{t("noBanksTitle")}</h3>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>{t("noBanksDesc")}</p>
            <button className="btn-primary" onClick={() => router.push("/create")}>
              {t("createFirst")}
            </button>
          </div>
        )}

        {/* Piggy cards */}
        {filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map((p) => (
              <PiggyCard
                key={p.id} piggy={p}
                onDeposit={(id) => {
                  const found = piggies.find(x => x.id === id);
                  if (found) setDepositPiggy(found);
                }}
                onWithdraw={(id) => router.push(`/withdraw/${id}`)}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 40, fontSize: 12, color: "var(--muted)" }}>
          Powered by{" "}
          <a href="https://docs.starknet.io/build/starkzap/overview" target="_blank" rel="noopener"
            style={{ color: "var(--ink)", fontWeight: 600, textDecoration: "none" }}>
            Starkzap SDK
          </a>{" "}
          · Starknet Mainnet
        </div>
      </div>
    </div>
  );
}