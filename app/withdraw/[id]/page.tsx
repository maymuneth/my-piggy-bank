"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPiggyBanks, savePiggyBank } from "@/lib/piggybank";
import { PiggyBank } from "@/types";

export default function WithdrawPage() {
  const router = useRouter();
  const params = useParams();
  const [bank, setBank] = useState<PiggyBank | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const address = localStorage.getItem("wallet_address") || "";
    const all = getPiggyBanks(address);
    const found = all.find((b) => b.id === params.id);
    if (found) setBank(found);
    else router.push("/dashboard");
  }, [params.id]);

  if (!bank) return null;

  const isUnlocked = Date.now() >= bank.lockUntil;
  const daysLeft = Math.ceil((bank.lockUntil - Date.now()) / 86400000);
  const progress = Math.min(100, (parseFloat(bank.currentAmount) / parseFloat(bank.targetAmount)) * 100);

  async function handleWithdraw() {
    if (!bank) return;
    if (!isUnlocked) {
      setError(`Still locked for ${daysLeft} more days.`);
      return;
    }
    setIsWithdrawing(true);
    setError("");
    try {
      const starknet = (window as any).starknet;
      if (!starknet?.account) throw new Error("Wallet not connected");

      if (bank.token === "STRK" && bank.poolAddress) {
        const amountBig = BigInt(Math.floor(parseFloat(bank.currentAmount) * 1e18));
        const amountHex = "0x" + amountBig.toString(16);

        await starknet.account.execute([{
          contractAddress: bank.poolAddress,
          entrypoint: "exit_delegation_pool_intent",
          calldata: [amountHex, "0x0"],
        }]);
      }

      // LocalStorage'dan sil
      const address = localStorage.getItem("wallet_address") || "";
      const all = getPiggyBanks(address);
      const updated = all.filter((b) => b.id !== bank.id);
      localStorage.setItem(`piggies_${address}`, JSON.stringify(updated));

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div style={{
        background: "white", borderBottom: "1px solid var(--border)",
        padding: "16px 24px", display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={() => router.push("/dashboard")} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: 20, color: "var(--muted)",
        }}>←</button>
        <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 18 }}>
          Piggy Bank Detail
        </span>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {success ? (
          <div style={{ textAlign: "center", paddingTop: "3rem" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>
              Congratulations!
            </h2>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>
              {bank.currentAmount} {bank.token} successfully withdrawn.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              background: "white", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, marginBottom: 16,
            }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>
                  {bank.mode === "kids" ? "👶" : "🎯"}
                </div>
                <h2 style={{ fontSize: 20, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>
                  {bank.name}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>{bank.token} · {bank.mode === "kids" ? "Kids" : "Goal"}</p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Saved</span>
                  <span style={{ fontWeight: 700 }}>{parseFloat(bank.currentAmount).toFixed(2)} / {bank.targetAmount} {bank.token}</span>
                </div>
                <div style={{ height: 8, background: "rgba(26,26,46,0.06)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "#e85d2f", borderRadius: 100 }} />
                </div>
              </div>

              {[
                ["Lock Date", new Date(bank.lockUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
                ["Status", isUnlocked ? "✅ Unlocked" : `🔒 ${daysLeft} days left`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: 14 }}>
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {!isUnlocked && (
              <div style={{
                padding: "12px 16px", background: "#FFFBEE",
                border: "1px solid rgba(255,217,61,0.4)", borderRadius: 12,
                fontSize: 13, color: "#7A6200", marginBottom: 16,
              }}>
                🔒 This piggy bank is locked for {daysLeft} more days.
              </div>
            )}

            {error && (
              <div style={{ padding: "12px 16px", background: "#FFF0F0", borderRadius: 12, fontSize: 13, color: "#CC2A2A", marginBottom: 16 }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={!isUnlocked || isWithdrawing}
              style={{
                width: "100%", padding: "14px",
                background: isUnlocked ? "#e85d2f" : "rgba(26,26,46,0.1)",
                color: isUnlocked ? "white" : "var(--muted)",
                border: "none", borderRadius: 12,
                fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15,
                cursor: isUnlocked ? "pointer" : "not-allowed",
              }}
            >
              {isWithdrawing ? "Processing..." : isUnlocked ? `💰 Withdraw ${bank.currentAmount} ${bank.token}` : `🔒 Locked for ${daysLeft} more days`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}