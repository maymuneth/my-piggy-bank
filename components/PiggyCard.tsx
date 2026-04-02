"use client";

import { PiggyBank, GOAL_OPTIONS } from "../types";
import { TOKEN_CONFIG } from "../lib/tokens";

interface Props {
  piggy: PiggyBank;
  onDeposit?: (id: string) => void;
  onWithdraw?: (id: string) => void;
}

export default function PiggyCard({ piggy, onDeposit, onWithdraw }: Props) {
  const now = Date.now();
  const isUnlocked = !piggy.isLocked || now >= piggy.lockUntil;
  const goal = GOAL_OPTIONS.find((g) => g.type === piggy.goalType);
  const token = TOKEN_CONFIG[piggy.token];

  const current = parseFloat(piggy.currentAmount);
  const target = parseFloat(piggy.targetAmount);
  const remaining = Math.max(0, target - current);
  const progress = Math.min(100, (current / target) * 100);

  const daysLeft = isUnlocked
    ? 0
    : Math.ceil((piggy.lockUntil - now) / (1000 * 60 * 60 * 24));

  const lockDate = new Date(piggy.lockUntil).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const isKids = piggy.mode === "kids";

  // Kids mode için özel emojiler
  const kidsEmojis: Record<string, string> = {
    house: "🏠", car: "🚲", vacation: "🎡", education: "📚",
    emergency: "🐷", custom: "⭐",
  };

  const displayEmoji = isKids
    ? (kidsEmojis[piggy.goalType] || "🐷")
    : (goal?.emoji ?? "🐑");

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(26,26,46,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: isKids ? "#FFF3E0" : token.bgColor,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>
            {displayEmoji}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {piggy.name}
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {goal?.label} · {isKids ? "👶 Kids" : "🎯 Goal"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
            background: token.bgColor, color: token.color,
          }}>
            {piggy.token}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
            background: isUnlocked ? "#F0FFF4" : "rgba(26,26,46,0.05)",
            color: isUnlocked ? "#1A8C3A" : "var(--muted)",
          }}>
            {isUnlocked ? "✓ Unlocked" : `🔒 ${daysLeft}d`}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>

        {/* Amounts row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Saved</p>
            <p style={{ fontSize: 18, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", color: token.color }}>
              {current.toFixed(2)}
              <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 4 }}>{piggy.token}</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Goal</p>
            <p style={{ fontSize: 18, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--ink)" }}>
              {target.toLocaleString()}
              <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 4 }}>{piggy.token}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 10, background: "rgba(26,26,46,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: progress >= 100 ? "#1A8C3A" : token.color,
            borderRadius: 100, transition: "width 0.8s ease",
          }} />
        </div>

        {/* Progress text */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: token.color, fontWeight: 700 }}>
            {progress.toFixed(1)}%
          </span>
          {remaining > 0 ? (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              <strong style={{ color: "var(--ink)" }}>{remaining.toFixed(2)} {piggy.token}</strong> more needed
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#1A8C3A", fontWeight: 600 }}>
              🎉 Goal reached!
            </span>
          )}
        </div>
      </div>

      {/* Staking rewards */}
      {piggy.token === "STRK" && parseFloat(piggy.rewardsEarned) > 0 && (
        <div style={{
          margin: "14px 24px 0",
          padding: "10px 14px", background: "#F0FFF4", borderRadius: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: "#1A8C3A" }}>⚡ Staking rewards</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1A8C3A" }}>
            +{parseFloat(piggy.rewardsEarned).toFixed(4)} STRK
          </span>
        </div>
      )}

      {/* Kids mode info */}
      {isKids && (
        <div style={{
          margin: "14px 24px 0",
          padding: "10px 14px", background: "#FFF3E0", borderRadius: 10,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>👶</span>
          <span style={{ fontSize: 12, color: "#E65100" }}>
            Kids piggy bank — locked until {lockDate}
          </span>
        </div>
      )}

      {/* Lock date */}
      <div style={{ padding: "12px 24px 0" }}>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          {isUnlocked
            ? "✅ Unlocked — you can withdraw"
            : `🔐 Locked until ${lockDate}`}
        </p>
      </div>

      {/* Actions */}
      <div style={{ padding: "14px 24px 20px", display: "flex", gap: 8 }}>
        <button
          onClick={() => onDeposit?.(piggy.id)}
          style={{
            flex: 1, padding: "10px",
            background: "var(--ink)", color: "white",
            border: "none", borderRadius: 10,
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: 13,
            cursor: "pointer", transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + Deposit
        </button>

        <button
          onClick={() => onWithdraw?.(piggy.id)}
          disabled={!isUnlocked}
          style={{
            flex: 1, padding: "10px",
            background: isUnlocked ? "#F0FFF4" : "rgba(26,26,46,0.04)",
            color: isUnlocked ? "#1A8C3A" : "var(--muted)",
            border: `1.5px solid ${isUnlocked ? "rgba(26,140,58,0.2)" : "var(--border)"}`,
            borderRadius: 10,
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: 13,
            cursor: isUnlocked ? "pointer" : "not-allowed", transition: "all 0.2s",
          }}
        >
          {isUnlocked ? "Withdraw ↗" : `🔒 ${daysLeft}d left`}
        </button>
      </div>
    </div>
  );
}