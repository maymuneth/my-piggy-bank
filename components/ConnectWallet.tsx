"use client";

import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLang } from "./LanguageContext";

interface Props {
  onConnected: (wallet: any, method: "privy" | "private_key" | "argent" | "braavos") => void;
}

export default function ConnectWallet({ onConnected }: Props) {
  const { t } = useLang();
  const [tab, setTab] = useState<"privy" | "pk">("privy");
  const [email, setEmail] = useState("");
  const [pk, setPk] = useState("");
  const [accountType, setAccountType] = useState<"argent" | "braavos">("argent");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState<"argent" | "braavos" | null>(null);
  const [error, setError] = useState("");

  async function connectBrowserWallet(type: "argent" | "braavos") {
    setLoadingWallet(type);
    setError("");
    try {
      const starknet = (window as any).starknet;
      if (!starknet) {
        setError("ArgentX or Braavos extension not found. Please install it.");
        return;
      }
      await starknet.enable();
      const address = starknet.selectedAddress;
      if (!address) throw new Error("Wallet connection rejected.");
      const mockWallet = {
        address,
        getBalance: async () => ({ toFormatted: () => "—" }),
        isDeployed: async () => true,
        _starknetObj: starknet,
      };
      onConnected(mockWallet, type);
    } catch (e: any) {
      setError(e.message || "Connection failed.");
    } finally {
      setLoadingWallet(null);
    }
  }

  async function handlePrivy() {
    setLoading(true);
    setError("");
    try {
      const mockWallet = {
        address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        getBalance: async () => ({ toFormatted: () => "150.00" }),
        isDeployed: async () => true,
      };
      onConnected(mockWallet, "privy");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePrivateKey() {
    if (!pk.startsWith("0x") || pk.length < 10) {
      setError("Please enter a valid private key (must start with 0x)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { connectWithPrivateKey } = await import("../lib/wallet");
      const wallet = await connectWithPrivateKey(pk, accountType);
      onConnected(wallet, "private_key");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--cream)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,61,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,150,255,0.08) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <LanguageSwitcher />
        </div>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🐑💰</div>
          <h1 style={{ fontSize: 32, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: "var(--ink)" }}>
            My Piggy Bank
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15 }}>
            {t("appSubtitle")}
          </p>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border)" }}>
            {[
              { id: "privy", label: t("emailTab") },
              { id: "pk",    label: t("walletTab") },
            ].map((tb) => (
              <button key={tb.id} onClick={() => { setTab(tb.id as any); setError(""); }} style={{
                padding: "18px 16px", background: tab === tb.id ? "var(--card-bg)" : "rgba(26,26,46,0.02)",
                border: "none", borderBottom: tab === tb.id ? "2px solid var(--ink)" : "2px solid transparent",
                cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: tab === tb.id ? 700 : 500, fontSize: 14,
                color: tab === tb.id ? "var(--ink)" : "var(--muted)", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {tb.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            {tab === "privy" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
                  {t("emailDesc")}
                </p>
                <input
                  type="email" placeholder="example@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 16px", border: "1.5px solid var(--border)",
                    borderRadius: 12, fontSize: 15, fontFamily: "Plus Jakarta Sans, sans-serif",
                    outline: "none", marginBottom: 12, background: "rgba(26,26,46,0.02)",
                    color: "var(--ink)", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {["Google", "Twitter", "Discord"].map((p) => (
                    <button key={p} onClick={handlePrivy} style={{
                      flex: 1, padding: "10px 8px", border: "1.5px solid var(--border)",
                      borderRadius: 10, background: "transparent", cursor: "pointer",
                      fontSize: 13, fontFamily: "Plus Jakarta Sans, sans-serif",
                      color: "var(--ink-light)", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    >{p}</button>
                  ))}
                </div>
                <button className="btn-primary" onClick={handlePrivy} disabled={loading}
                  style={{ width: "100%", justifyContent: "center" }}>
                  {loading ? t("connecting") : t("continueWithEmail")}
                </button>
              </div>
            )}

            {tab === "pk" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
                  {t("walletDesc")}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {[
                    { type: "argent" as const, name: "ArgentX", icon: "🟠", desc: "Connect with ArgentX extension" },
                    { type: "braavos" as const, name: "Braavos", icon: "🔵", desc: "Connect with Braavos extension" },
                  ].map((w) => (
                    <button key={w.type} onClick={() => connectBrowserWallet(w.type)}
                      disabled={loadingWallet !== null}
                      style={{
                        width: "100%", padding: "14px 18px",
                        border: "1.5px solid var(--border)", borderRadius: 12,
                        background: "white", cursor: "pointer",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontSize: 15, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 12,
                        transition: "all 0.2s", color: "var(--ink)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--ink)";
                        e.currentTarget.style.background = "rgba(26,26,46,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{w.icon}</span>
                      <div style={{ textAlign: "left" }}>
                        <div>{loadingWallet === w.type ? "Connecting..." : w.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>{w.desc}</div>
                      </div>
                      <span style={{ marginLeft: "auto", color: "var(--muted)" }}>→</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>or use private key</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {(["argent", "braavos"] as const).map((type) => (
                    <button key={type} onClick={() => setAccountType(type)} style={{
                      flex: 1, padding: "10px",
                      border: `1.5px solid ${accountType === type ? "var(--ink)" : "var(--border)"}`,
                      borderRadius: 10,
                      background: accountType === type ? "var(--ink)" : "transparent",
                      color: accountType === type ? "white" : "var(--ink-light)",
                      cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                    }}>
                      {type === "argent" ? "ArgentX" : "Braavos"}
                    </button>
                  ))}
                </div>
                <input
                  type="password" placeholder="0x private key..." value={pk}
                  onChange={(e) => setPk(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 16px", border: "1.5px solid var(--border)",
                    borderRadius: 12, fontSize: 15, fontFamily: "monospace",
                    outline: "none", marginBottom: 12, background: "rgba(26,26,46,0.02)",
                    color: "var(--ink)", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <div style={{
                  background: "#FFFBEE", border: "1px solid rgba(255,217,61,0.4)",
                  borderRadius: 10, padding: "10px 14px", fontSize: 12,
                  color: "#7A6200", marginBottom: 14, lineHeight: 1.5,
                }}>
                  ⚠️ {t("privacyNote")}
                </div>
                <button className="btn-primary" onClick={handlePrivateKey} disabled={loading}
                  style={{ width: "100%", justifyContent: "center" }}>
                  {loading ? t("connecting") : t("connectWallet")}
                </button>
              </div>
            )}

            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px", background: "#FFF0F0",
                borderRadius: 10, fontSize: 13, color: "#CC2A2A",
              }}>
                ❌ {error}
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
          Starknet Mainnet · Powered by Starkzap SDK
        </p>
      </div>
    </div>
  );
}