import React from "react";
import { Fight, FightSlot, FighterSlotKey } from "../types";
import { DIVISION_COLOR } from "../constants";
import { DivisionBadge } from "./DivisionBadge";

// ── FighterCell ────────────────────────────────────────────────────────────

interface CellProps {
  fighter: Fight["f1"];
  side: "left" | "right";
  isMain: boolean;
  onClick: () => void;
  onClear: () => void;
}

const FighterCell: React.FC<CellProps> = ({ fighter, side, isMain, onClick, onClear }) => {
  const align = side === "right" ? "items-end text-right" : "items-start text-left";
  const clearPos = side === "right" ? "right-2 top-2" : "left-2 top-2";

  if (!fighter.name) {
    return (
      <div
        onClick={onClick}
        className={`flex-1 flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all group`}
        style={{
          minHeight: isMain ? 64 : 52,
          border: "1.5px dashed #e2e0da",
          background: "#fafaf9",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#dc2626";
          e.currentTarget.style.background = "#fef2f2";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e2e0da";
          e.currentTarget.style.background = "#fafaf9";
        }}
      >
        <span
          className="text-stone-300 group-hover:text-red-400 transition-colors"
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.12em",
          }}
        >
          + LEGG TIL FIGHTER
        </span>
      </div>
    );
  }

  const colors = DIVISION_COLOR[fighter.division ?? ""] ?? { text: "#374151", bg: "#f9fafb", border: "#e5e7eb" };
  const metaDir = side === "right" ? "flex-row-reverse" : "flex-row";

  return (
    <div
      onClick={onClick}
      className={`flex-1 flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all relative group`}
      style={{
        minHeight: isMain ? 64 : 52,
        background: "#ffffff",
        border: "1px solid #e8e6e1",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf9")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
    >
      {/* Clear button */}
      <button
        className={`absolute ${clearPos} opacity-0 group-hover:opacity-100 transition-opacity`}
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#d1d5db",
          fontSize: 11,
          lineHeight: 1,
          padding: "2px 3px",
          borderRadius: 3,
          fontFamily: "var(--font-condensed)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
      >
        ✕
      </button>

      {/* Name */}
      <p
        style={{
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: isMain ? 16 : 14,
          letterSpacing: "0.05em",
          color: "#111827",
          lineHeight: 1.1,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        {fighter.name}
      </p>

      {/* Meta */}
      <div className={`flex ${metaDir} items-center gap-2 flex-wrap`}>
        <DivisionBadge division={fighter.division} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#9ca3af" }}>
          {fighter.record}
        </span>
        {fighter.rank && fighter.rank !== "Unranked" && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#a8a29e", fontStyle: "italic" }}>
            {fighter.rank}
          </span>
        )}
      </div>
    </div>
  );
};

// ── FightRow ───────────────────────────────────────────────────────────────

interface Props {
  fightId: string;
  slot: FightSlot;
  fight: Fight;
  isMain: boolean;
  noRestrictions: boolean;
  onPick: (fightId: string, slot: FighterSlotKey) => void;
  onClear: (fightId: string, slot: FighterSlotKey) => void;
}

export const FightRow: React.FC<Props> = ({
  fightId, slot, fight, isMain, noRestrictions, onPick, onClear,
}) => {
  const { f1, f2, lockedDiv } = fight;
  const mismatch = !noRestrictions && !!f1.division && !!f2.division && f1.division !== f2.division;
  const divColors = lockedDiv ? DIVISION_COLOR[lockedDiv] : null;

  return (
    <div
      className="rounded-2xl mb-2 overflow-hidden"
      style={{
        border: mismatch ? "1px solid #fcd34d" : "1px solid #e8e6e1",
        background: mismatch ? "#fffbeb" : "#f8f7f4",
      }}
    >
      {/* Row header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        {isMain && slot.id === "m1" && (
          <span style={{ fontSize: 13 }}>🏆</span>
        )}
        <span
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 800,
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "#a8a29e",
            textTransform: "uppercase",
          }}
        >
          {slot.label}
        </span>
        {lockedDiv && !noRestrictions && (
          <span
            className="ml-1"
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 800,
              fontSize: 8,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: divColors?.text,
              background: divColors?.bg,
              border: `1px solid ${divColors?.border}`,
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            {lockedDiv}
          </span>
        )}
        {mismatch && (
          <span
            className="ml-auto"
            style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "#d97706", fontStyle: "italic" }}
          >
            ⚠ divisjon mismatch
          </span>
        )}
      </div>

      {/* Fight cells */}
      <div className="flex items-stretch gap-2 px-2 pb-2">
        <FighterCell
          fighter={f1}
          side="right"
          isMain={isMain}
          onClick={() => onPick(fightId, "f1")}
          onClear={() => onClear(fightId, "f1")}
        />

        {/* VS divider */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 36 }}
        >
          <span
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.2em",
              color: divColors?.text ?? "#d1cfc9",
            }}
          >
            VS
          </span>
        </div>

        <FighterCell
          fighter={f2}
          side="left"
          isMain={isMain}
          onClick={() => onPick(fightId, "f2")}
          onClear={() => onClear(fightId, "f2")}
        />
      </div>
    </div>
  );
};
