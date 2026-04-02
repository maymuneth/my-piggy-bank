"use client";

import { useLang } from "./LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "rgba(26,26,46,0.05)",
      border: "1px solid var(--border)",
      borderRadius: 99,
      padding: "2px",
      gap: "2px",
    }}>
      {([
        { code: "en", flag: "🇬🇧" },
        { code: "tr", flag: "🇹🇷" },
      ] as const).map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          style={{
            padding: "4px 10px",
            borderRadius: 99,
            border: "none",
            background: lang === l.code ? "white" : "transparent",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.15s",
            boxShadow: lang === l.code ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
          }}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}