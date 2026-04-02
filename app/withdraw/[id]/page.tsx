"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWallet } from "@/components/WalletContext";
import { getPiggyBanks, withdrawFromPiggy } from "@/lib/piggybank";
import { PiggyBank } from "@/types";

export default function WithdrawPage() {
  const router = useRouter();
  const params = useParams();
  const { walletInstance, walletState } = useWallet();
  const [bank, setBank] = useState<PiggyBank | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const all = getPiggyBanks();
    const found = all.find(b => b.id === params.id);
    if (found) setBank(found);
    else router.push("/dashboard");
  }, [params.id]);

  if (!bank) return null;

  const isUnlocked = new Date() >= bank.lockUntil;
  const daysLeft = Math.ceil((bank.lockUntil.getTime() - Date.now()) / 86400000);
  const progress = Math.min((parseFloat(bank.currentAmount) / parseFloat(bank.targetAmount)) * 100, 100);

  async function handleWithdraw() {
    if (!walletInstance || !bank) return;
    setIsWithdrawing(true);
    setError(null);
    try {
      await withdrawFromPiggy(walletInstance, bank);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--card-bg)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-muted)" }}
        >
          ←
        </button>
        <span style={{ fontWeight: 600 }}>Kumbara Detayı</span>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
        {success ? (
          <div className="fade-up" style={{ textAlign: "center", paddingTop: "3rem" }}>
            <div style={{ fontSize: 64, marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Tebrikler!
            </h2>
            <p style={{ color: "var(--text-muted)" }}>
              {bank.currentAmount} {bank.token} başarıyla çekildi.
            </p>
          </div>
        ) : (
          <>
            {/* Bank info card */}
            <div className="fade-up" style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "1.5rem",
              marginBottom: "1.25rem",
            }}>
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: 52, marginBottom: "0.5rem" }}>{bank.emoji}</div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{bank.name}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{bank.goalLabel}</p>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.4rem",
                }}>
                  <span>{bank.currentAmount} {bank.token} birikti</span>
                  <span>Hedef: {bank.targetAmount} {bank.token}</span>
                </div>
                <div style={{ height: 10, background: "var(--progress-bg)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: isUnlocked
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : "linear-gradient(90deg, var(--accent), #f59e0b)",
                    borderRadius: 99,
                    transition: "width 0.6s",
                  }} />
                </div>
                <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  %{progress.toFixed(1)}
                </div>
              </div>

              {/* Details */}
              {[
                ["Token", bank.token],
                ["Kilit Tarihi", bank.lockUntil.toLocaleDateString("tr-TR")],
                ["Durum", isUnlocked ? "✅ Açık" : `🔒 ${daysLeft} gün kaldı`],
                ["Mod", bank.isKidsMode ? "👶 Çocuk" : "🎯 Yetişkin"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderTop: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}>
                  <span style={{ color: "var(--text-muted)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Lock warning */}
            {!isUnlocked && (
              <div className="fade-up stagger-2" style={{
                padding: "1rem",
                background: "var(--warn-bg)",
                borderRadius: 14,
                fontSize: "0.82rem",
                color: "var(--warn-text)",
                marginBottom: "1.25rem",
                display: "flex",
                gap: "0.5rem",
              }}>
                <span>🔒</span>
                <span>
                  Bu kumbara hâlâ kilitli. <strong>{daysLeft} gün</strong> sonra,
                  {" "}{bank.lockUntil.toLocaleDateString("tr-TR")} tarihinde çekebilirsin.
                </span>
              </div>
            )}

            {error && (
              <div style={{
                padding: "0.75rem",
                background: "var(--error-bg)",
                borderRadius: 10,
                fontSize: "0.82rem",
                color: "var(--error-text)",
                marginBottom: "1rem",
              }}>
                ⛔ {error}
              </div>
            )}

            {/* Withdraw button */}
            <button
              onClick={handleWithdraw}
              disabled={!isUnlocked || isWithdrawing}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: isUnlocked ? "var(--accent)" : "var(--border)",
                color: isUnlocked ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: 12,
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: isUnlocked ? "pointer" : "not-allowed",
                fontFamily: "inherit",
              }}
            >
              {isWithdrawing
                ? "İşlem yapılıyor..."
                : isUnlocked
                ? `💰 ${bank.currentAmount} ${bank.token} Çek`
                : `🔒 ${daysLeft} gün sonra açılır`}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
