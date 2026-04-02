"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GOAL_OPTIONS, LOCK_DURATIONS, PiggyBank, GoalType, TokenSymbol } from "../../types";
import { TOKEN_CONFIG } from "../../lib/tokens";

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep]                     = useState(1);
  const [mode, setMode]                     = useState<"kids" | "goal">("goal");
  const [goalType, setGoalType]             = useState<GoalType>("house");
  const [name, setName]                     = useState("");
  const [token, setToken]                   = useState<TokenSymbol>("STRK");
  const [target, setTarget]                 = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [lockDays, setLockDays]             = useState(30);
  const [loading, setLoading]               = useState(false);

  const selectedGoal  = GOAL_OPTIONS.find((g) => g.type === goalType)!;
  const selectedToken = TOKEN_CONFIG[token];

  async function handleCreate() {
    if (!target || parseFloat(target) <= 0) return;
    if (!initialDeposit || parseFloat(initialDeposit) <= 0) {
      alert("Please enter an initial deposit amount.");
      return;
    }
    setLoading(true);
    try {
      const walletAddress = localStorage.getItem("wallet_address") || "";
      const starknet = (window as any).starknet;
      if (!starknet?.account) {
        alert("Please connect your wallet first.");
        setLoading(false);
        return;
      }

      let poolAddress = "";

      if (token === "STRK") {
        const poolContract = "0x07d695337550e96e1372dd03274965cca0284ded266efc1774d001d37fbca104";
        const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
        const amountBig = BigInt(Math.floor(parseFloat(initialDeposit) * 1e18));
        const amountHex = "0x" + amountBig.toString(16);

        console.log("Pool:", poolContract);
        console.log("Amount:", amountHex);

        // Approve + Stake tek TX'te
        const tx = await starknet.account.execute([
          {
            contractAddress: STRK_ADDRESS,
            entrypoint: "approve",
            calldata: [poolContract, amountHex, "0x0"],
          },
          {
            contractAddress: poolContract,
            entrypoint: "add_to_delegation_pool",
            calldata: [amountHex, "0x0"],
          },
        ]);
        console.log("TX:", tx.transaction_hash);
        poolAddress = poolContract;
      }

      const piggy: PiggyBank = {
        id: `piggy_${Date.now()}`,
        name: name || selectedGoal.label,
        mode,
        goalType,
        token,
        targetAmount: target,
        currentAmount: initialDeposit,
        stakedAmount: token === "STRK" ? initialDeposit : "0",
        rewardsEarned: "0",
        lockUntil: Date.now() + lockDays * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        walletAddress,
        poolAddress,
        isLocked: true,
      };

      const key = `piggies_${walletAddress}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      localStorage.setItem(key, JSON.stringify([...existing, piggy]));
      router.push("/dashboard");

    } catch (e: any) {
      console.error(e);
      alert("❌ " + (e.message || "Transaction failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "24px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push("/dashboard")} style={{
            background: "transparent", border: "1.5px solid var(--border)",
            borderRadius: 10, padding: "8px 14px", cursor: "pointer",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 13, color: "var(--ink)",
          }}>← Back</button>
          <div>
            <h1 style={{ fontSize: 24, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>New Piggy Bank</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Step {step} / 3</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3].map((s) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 100, background: s <= step ? "var(--ink)" : "rgba(26,26,46,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Choose piggy bank type</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Saving for yourself or for your child?</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {[
                { id: "goal", label: "Goal Savings", emoji: "🎯", desc: "Your personal goals" },
                { id: "kids", label: "Kids Piggy Bank", emoji: "👶", desc: "Parent controlled" },
              ].map((m) => (
                <button key={m.id} onClick={() => setMode(m.id as any)} style={{
                  padding: "20px 16px", border: `2px solid ${mode === m.id ? "var(--ink)" : "var(--border)"}`,
                  borderRadius: 16, background: mode === m.id ? "var(--ink)" : "white",
                  color: mode === m.id ? "white" : "var(--ink)", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{m.emoji}</div>
                  <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{m.desc}</div>
                </button>
              ))}
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 16, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Goal category</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 32 }}>
              {GOAL_OPTIONS.map((g) => (
                <button key={g.type} onClick={() => setGoalType(g.type)} style={{
                  padding: "14px 10px", border: `1.5px solid ${goalType === g.type ? "var(--ink)" : "var(--border)"}`,
                  borderRadius: 12, background: goalType === g.type ? "rgba(26,26,46,0.05)" : "white",
                  cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 22 }}>{g.emoji}</div>
                  <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: 13, marginTop: 6, color: goalType === g.type ? "var(--ink)" : "var(--muted)" }}>{g.label}</div>
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setStep(2)} style={{ width: "100%", justifyContent: "center" }}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{selectedGoal.emoji} {selectedGoal.label} Piggy Bank</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Set your goal and how much you're starting with.</p>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 8, display: "block" }}>Piggy bank name</span>
              <input type="text" placeholder={`My ${selectedGoal.label} Fund`} value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 15, fontFamily: "Plus Jakarta Sans, sans-serif", outline: "none", color: "var(--ink)", background: "white" }} />
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 8, display: "block" }}>Choose token</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["STRK", "USDC"] as TokenSymbol[]).map((t) => {
                  const tc = TOKEN_CONFIG[t];
                  return (
                    <button key={t} onClick={() => setToken(t)} style={{ padding: "16px", border: `2px solid ${token === t ? tc.color : "var(--border)"}`, borderRadius: 14, background: token === t ? tc.bgColor : "white", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                      <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 18, color: tc.color }}>{t}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>APY: <strong style={{ color: tc.color }}>{tc.apy}</strong></div>
                      {tc.supportsStaking && <div style={{ fontSize: 11, color: tc.color, marginTop: 4, fontWeight: 600 }}>✓ Staking active</div>}
                    </button>
                  );
                })}
              </div>
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 8, display: "block" }}>🎯 Savings goal ({token})</span>
              <div style={{ position: "relative" }}>
                <input type="number" placeholder="e.g. 100" value={target} onChange={(e) => setTarget(e.target.value)}
                  style={{ width: "100%", padding: "14px 70px 14px 16px", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 18, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, outline: "none", color: "var(--ink)", background: "white" }} />
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: selectedToken.color, fontSize: 14 }}>{token}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>How much do you want to save in total?</p>
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 8, display: "block" }}>💰 Starting deposit ({token})</span>
              <div style={{ position: "relative" }}>
                <input type="number" placeholder="e.g. 1" value={initialDeposit} onChange={(e) => setInitialDeposit(e.target.value)}
                  style={{ width: "100%", padding: "14px 70px 14px 16px", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 18, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, outline: "none", color: "var(--ink)", background: "white" }} />
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: selectedToken.color, fontSize: 14 }}>{token}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>How much are you depositing today?</p>
            </label>

            {target && initialDeposit && parseFloat(target) > 0 && parseFloat(initialDeposit) > 0 && (
              <div style={{ padding: "14px 16px", background: "rgba(26,26,46,0.03)", borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--muted)" }}>Starting progress</span>
                  <span style={{ fontWeight: 700, color: selectedToken.color }}>
                    {Math.min(100, parseFloat(initialDeposit) / parseFloat(target) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 8, background: "rgba(26,26,46,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, parseFloat(initialDeposit) / parseFloat(target) * 100)}%`, background: selectedToken.color, borderRadius: 100 }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>
                  {Math.max(0, parseFloat(target) - parseFloat(initialDeposit)).toFixed(2)} {token} more needed
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={!target || !initialDeposit} style={{ flex: 2, justifyContent: "center" }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Choose lock period</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Funds stay locked for this period. The longer, the more disciplined!</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 28 }}>
              {LOCK_DURATIONS.map((d) => (
                <button key={d.days} onClick={() => setLockDays(d.days)} style={{
                  padding: "14px", border: `2px solid ${lockDays === d.days ? "var(--ink)" : "var(--border)"}`,
                  borderRadius: 12, background: lockDays === d.days ? "var(--ink)" : "white",
                  color: lockDays === d.days ? "white" : "var(--ink)", cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                }}>{d.label}</button>
              ))}
            </div>

            <div style={{ background: "rgba(26,26,46,0.03)", border: "1.5px solid var(--border)", borderRadius: 16, marginBottom: 24, padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 14, fontFamily: "Plus Jakarta Sans, sans-serif" }}>📋 Summary</h3>
              {[
                ["Name",          name || selectedGoal.label],
                ["Mode",          mode === "kids" ? "👶 Kids" : "🎯 Goal"],
                ["Token",         token],
                ["Savings goal",  `${parseFloat(target || "0").toLocaleString()} ${token}`],
                ["Starting with", `${parseFloat(initialDeposit || "0").toLocaleString()} ${token}`],
                ["Still needed",  `${Math.max(0, parseFloat(target || "0") - parseFloat(initialDeposit || "0")).toFixed(2)} ${token}`],
                ["Lock period",   LOCK_DURATIONS.find(d => d.days === lockDays)?.label],
                ["APY",           selectedToken.supportsStaking ? selectedToken.apy : "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ flex: 2, justifyContent: "center" }}>
                {loading ? "Creating..." : "🐑 Create Piggy Bank"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}