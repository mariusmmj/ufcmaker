import React, { useEffect, useRef, useState } from "react";
import { Fighter } from "../types";
import { DIVISION_COLOR } from "../constants";
import { DivisionBadge } from "./DivisionBadge";
import allFighters from "../data/fighters.json";

const FIGHTERS = allFighters as Fighter[];

function search(query: string, lockedDiv: string | null): Fighter[] {
  const q = query.toLowerCase().trim();
  return FIGHTERS.filter((f) => {
    const matchName = !q || f.name.toLowerCase().includes(q);
    const matchDiv  = !lockedDiv || f.division === lockedDiv;
    return matchName && matchDiv;
  }).slice(0, 8);
}

interface Props {
  lockedDiv: string | null;
  noRestrictions: boolean;
  onSelect: (fighter: Fighter) => void;
  onClose: () => void;
}

export const FighterModal: React.FC<Props> = ({ lockedDiv, noRestrictions, onSelect, onClose }) => {
  const effectiveLock = noRestrictions ? null : lockedDiv;
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<Fighter[]>(() => search("", effectiveLock));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    setResults(search(val, effectiveLock));
  };

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,15,15,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="fade-up flex flex-col overflow-hidden"
        style={{
          width: "min(480px, 96vw)",
          maxHeight: "78vh",
          background: "#ffffff",
          border: "1px solid #e5e3de",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #f0ede8" }}>
          <span
            className="flex-1 tracking-widest"
            style={{ fontFamily: "var(--font-condensed)", fontWeight: 900, fontSize: 14, color: "#1a1a1a" }}
          >
            VELG FIGHTER
          </span>
          {effectiveLock && <DivisionBadge division={effectiveLock} size="md" />}
          {noRestrictions && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-sm tracking-widest"
              style={{ fontWeight: 800, border: "1px solid #d1cfc9", color: "#9ca3af", background: "#fafaf9" }}
            >
              ALLE DIVISJONER
            </span>
          )}
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors ml-1 rounded p-0.5"
            style={{ fontSize: 15, background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* ── Search ─────────────────────────────── */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid #f0ede8" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Søk på fighternavn..."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
            style={{
              fontFamily: "var(--font-body)",
              background: "#f8f7f4",
              border: "1px solid #e5e3de",
              color: "#1a1a1a",
              fontSize: 14,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e3de")}
          />
        </div>

        {/* ── Results ────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {results.length === 0 && (
            <p
              className="text-center py-8 text-stone-400 text-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ingen fighters funnet.
            </p>
          )}
          {results.map((f, i) => {
            const colors = DIVISION_COLOR[f.division ?? ""] ?? { text: "#374151", bg: "#f9fafb", border: "#e5e7eb" };
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{ borderBottom: "1px solid #f8f7f4" }}
                onClick={() => onSelect(f)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full text-sm"
                  style={{
                    width: 38, height: 38,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontFamily: "var(--font-condensed)",
                    fontWeight: 900,
                    fontSize: 13,
                    letterSpacing: "0.05em",
                  }}
                >
                  {initials(f.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="mb-0.5"
                    style={{
                      fontFamily: "var(--font-condensed)",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "#1a1a1a",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {f.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DivisionBadge division={f.division} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#9ca3af" }}>
                      {f.record}
                    </span>
                    {f.rank && f.rank !== "Unranked" && (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#a8a29e", fontStyle: "italic" }}>
                        {f.rank}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-stone-300 text-base">›</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
