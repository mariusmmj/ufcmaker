import React from "react";
import { Fight, FightSlot, FighterSlotKey } from "../types";
import { DIVISION_COLOR } from "../constants";
import { DivisionBadge } from "./DivisionBadge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
          border: "1.5px dashed var(--border-main)",
          background: "var(--bg-card-empty)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-color)";
          e.currentTarget.style.background = "var(--accent-bg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-main)";
          e.currentTarget.style.background = "var(--bg-card-empty)";
        }}
      >
        <span
          className="transition-colors"
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
          }}
        >
          + LEGG TIL FIGHTER
        </span>
      </div>
    );
  }

  const metaDir = side === "right" ? "flex-row-reverse" : "flex-row";

  return (
    <div
      onClick={onClick}
      className={`flex-1 flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all relative group overflow-hidden`}
      style={{
        minHeight: isMain ? 64 : 52,
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
    >
      {/* Clear button */}
      <button
        className={`absolute ${clearPos} opacity-0 group-hover:opacity-100 transition-opacity z-10`}
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: 11,
          lineHeight: 1,
          padding: "2px 3px",
          borderRadius: 3,
          fontFamily: "var(--font-condensed)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-color)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        ✕
      </button>

      {/* Name */}
      <div className="relative z-10 flex items-center gap-2">
        <p
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 900,
            fontSize: isMain ? 16 : 14,
            letterSpacing: "0.05em",
            color: "var(--text-primary)",
            lineHeight: 1.1,
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          {fighter.name}
        </p>
      </div>

      {/* Meta */}
      <div className={`flex ${metaDir} items-center gap-2 flex-wrap relative z-10`}>
        <DivisionBadge division={fighter.division} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>
          {fighter.record}
        </span>
        {fighter.rank && fighter.rank !== "Unranked" && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", fontStyle: "italic" }}>
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
  onToggleTitle?: (fightId: string) => void;
  disableDrag?: boolean;
}

export const FightRow: React.FC<Props> = ({
  fightId, slot, fight, isMain, noRestrictions, onPick, onClear, onToggleTitle, disableDrag
}) => {
  const { f1, f2, lockedDiv, isTitleFight } = fight;
  const mismatch = !noRestrictions && !!f1.division && !!f2.division && f1.division !== f2.division;
  const divColors = lockedDiv ? DIVISION_COLOR[lockedDiv] : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fightId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: mismatch ? "1px solid var(--border-mismatch)" : "1px solid var(--border-card)",
    background: mismatch ? "var(--bg-mismatch)" : "var(--bg-main)",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as any,
  };

  return (
    <div
      ref={disableDrag ? undefined : setNodeRef}
      style={style}
      className="rounded-2xl mb-2 overflow-hidden"
    >
      {/* Row header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        {!disableDrag && (
          <div {...attributes} {...listeners} className="cursor-grab text-stone-400 hover:text-stone-600 px-1" title="Dra for å flytte">
            ⋮⋮
          </div>
        )}
        {(isMain && slot.id === "m1") || isTitleFight ? (
          <span style={{ fontSize: 13 }}>🏆</span>
        ) : null}
        <span
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 800,
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "var(--text-secondary)",
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
        
        {/* Toggle Title Fight button */}
        {(f1.name || f2.name) && (
          <button
            onClick={() => onToggleTitle?.(fightId)}
            className="ml-2 px-2 py-0.5 rounded border text-[10px] transition-colors"
            style={{ 
              fontFamily: "var(--font-condensed)", 
              background: "var(--bg-card)",
              color: isTitleFight ? "var(--accent-color)" : "var(--text-muted)",
              borderColor: isTitleFight ? "var(--accent-color)" : "var(--border-card)"
            }}
          >
            {isTitleFight ? "TITTELKAMP (5 RUNDER)" : "Gjør til tittelkamp"}
          </button>
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
              color: divColors?.text ?? "var(--text-muted)",
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
