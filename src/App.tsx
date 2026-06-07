import React, { useCallback, useEffect, useRef, useState } from "react";
import { FightsMap, Fighter, FighterSlotKey } from "./types";
import { FIGHT_SLOTS, emptyFighter, initFights } from "./constants";
import { FightRow } from "./components/FightRow";
import { FighterModal } from "./components/FighterModal";

interface ModalState {
  fightId: string;
  slot: FighterSlotKey;
}

// ── Section divider ────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "#e2e0da" }} />
      <span
        style={{
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: 10,
          letterSpacing: "0.25em",
          color: "#dc2626",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e0da" }} />
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [fights, setFights]               = useState<FightsMap>(initFights);
  const [noRestrictions, setNoRestrictions] = useState(false);
  const [modal, setModal]                 = useState<ModalState | null>(null);
  const [eventName, setEventName]         = useState("UFC 000");
  const [editingName, setEditingName]     = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingName) nameRef.current?.focus(); }, [editingName]);

  const openPick = (fightId: string, slot: FighterSlotKey) => setModal({ fightId, slot });

  const handleSelect = useCallback((fighter: Fighter) => {
    if (!modal) return;
    const { fightId, slot } = modal;
    setFights((prev) => {
      const fight = { ...prev[fightId], f1: { ...prev[fightId].f1 }, f2: { ...prev[fightId].f2 } };
      fight[slot] = { name: fighter.name, division: fighter.division, record: fighter.record, rank: fighter.rank ?? "" };
      if (!noRestrictions) {
        const other = slot === "f1" ? fight.f2 : fight.f1;
        if (!other.name) fight.lockedDiv = fighter.division;
      }
      return { ...prev, [fightId]: fight };
    });
    setModal(null);
  }, [modal, noRestrictions]);

  const handleClear = (fightId: string, slot: FighterSlotKey) => {
    setFights((prev) => {
      const fight = { ...prev[fightId], f1: { ...prev[fightId].f1 }, f2: { ...prev[fightId].f2 } };
      fight[slot] = emptyFighter();
      if (!fight.f1.name && !fight.f2.name) fight.lockedDiv = null;
      return { ...prev, [fightId]: fight };
    });
  };

  const getLockedDiv = (fightId: string) =>
    noRestrictions ? null : (fights[fightId]?.lockedDiv ?? null);

  const mainSlots   = FIGHT_SLOTS.filter((s) => s.section === "main");
  const prelimSlots = FIGHT_SLOTS.filter((s) => s.section === "prelim");

  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4" }}>
      {/* ── Top bar ─────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-6 py-3"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ede9e3",
          boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* UFC Logo */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            background: "#dc2626",
            color: "#fff",
            fontFamily: "var(--font-condensed)",
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "0.15em",
            padding: "3px 12px 3px 10px",
            clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)",
          }}
        >
          UFC
        </div>

        {/* Event name */}
        {editingName ? (
          <input
            ref={nameRef}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            className="outline-none"
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: "0.08em",
              color: "#111827",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              borderBottom: "1.5px solid #dc2626",
              width: 200,
              padding: "0 0 1px",
            }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-2 group"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: "0.08em",
                color: "#111827",
                textTransform: "uppercase",
              }}
            >
              {eventName}
            </span>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-xs">✏</span>
          </button>
        )}

        <span
          className="hidden sm:block"
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "#c4c0b8",
            textTransform: "uppercase",
          }}
        >
          CUSTOM CARD MAKER
        </span>

        {/* No-restrictions toggle */}
        <div className="ml-auto flex items-center gap-3">
          <span
            className="hidden md:block text-right"
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.1em",
              color: noRestrictions ? "#dc2626" : "#a8a29e",
              textTransform: "uppercase",
              lineHeight: 1.3,
              transition: "color 0.2s",
            }}
          >
            Ingen vektklasse-
            <br />restriksjoner
          </span>
          <button
            onClick={() => setNoRestrictions((v) => !v)}
            className="relative flex-shrink-0 rounded-full transition-all duration-200"
            style={{
              width: 44,
              height: 24,
              background: noRestrictions ? "#dc2626" : "#e2e0da",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Toggle vektklasse-restriksjoner"
          >
            <div
              className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
              style={{
                width: 20,
                height: 20,
                left: noRestrictions ? 22 : 2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            />
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 pb-16">
        <SectionDivider label="Main Card" />
        {mainSlots.map((slot) => (
          <FightRow
            key={slot.id}
            fightId={slot.id}
            slot={slot}
            fight={fights[slot.id]}
            isMain={true}
            noRestrictions={noRestrictions}
            onPick={openPick}
            onClear={handleClear}
          />
        ))}

        <SectionDivider label="Prelims" />
        {prelimSlots.map((slot) => (
          <FightRow
            key={slot.id}
            fightId={slot.id}
            slot={slot}
            fight={fights[slot.id]}
            isMain={false}
            noRestrictions={noRestrictions}
            onPick={openPick}
            onClear={handleClear}
          />
        ))}
      </main>

      {/* ── Modal ────────────────────────────────── */}
      {modal && (
        <FighterModal
          lockedDiv={getLockedDiv(modal.fightId)}
          noRestrictions={noRestrictions}
          onSelect={handleSelect}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
