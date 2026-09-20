import React from 'react';
import { Fight, FightSlot, FighterSlotKey } from '../types';
import { DIVISION_COLOR } from '../constants';
import { DivisionBadge } from './DivisionBadge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store/useStore';
import allFighters from '../data/fighters.json';

// ── FighterCell ────────────────────────────────────────────────────────────

interface CellProps {
  fighter: Fight['f1'];
  isMain: boolean;
  isTitleFight?: boolean;
  onClick: () => void;
  onClear: () => void;
  onInfoClick?: () => void;
}

const FighterCell: React.FC<CellProps> = ({
  fighter,
  isMain,
  isTitleFight,
  onClick,
  onClear,
  onInfoClick,
}) => {
  // Always left align the text to make better use of space, and put X on the right.
  const align = 'items-start text-left';
  const clearPos = 'right-3';

  if (!fighter.name) {
    return (
      <div
        onClick={onClick}
        className={`flex-1 min-w-0 w-full flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all group`}
        style={{
          minHeight: isTitleFight ? 96 : isMain ? 64 : 52,
          border: '1.5px dashed var(--border-main)',
          background: 'var(--bg-card-empty)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-color)';
          e.currentTarget.style.background = 'var(--accent-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-main)';
          e.currentTarget.style.background = 'var(--bg-card-empty)';
        }}
      >
        <span
          className="transition-colors"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
          }}
        >
          + ADD FIGHTER
        </span>
      </div>
    );
  }

  const metaDir = 'flex-row';

  return (
    <div
      onClick={onClick}
      className={`flex-1 min-w-0 w-full flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all relative group`}
      style={{
        minHeight: isTitleFight ? 96 : isMain ? 64 : 52,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = 'var(--bg-card-hover)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = 'var(--bg-card)')
      }
    >
      {/* Clear button */}
      <button
        className={`absolute ${clearPos} opacity-50 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center`}
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        title="Remove fighter"
        style={{
          background: '#ef4444',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          width: 28,
          height: 28,
          fontSize: 14,
          lineHeight: 1,
          borderRadius: '50%',
          fontFamily: 'var(--font-condensed)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
      >
        ✕
      </button>

      {/* Name & Image */}
      <div className="relative z-20 flex items-center gap-2 sm:gap-4 mb-1">
        {fighter.image && (
          <button 
            type="button"
            className="relative z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 border-none bg-transparent p-0"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick?.();
            }}
          >
            <img
              src={fighter.image}
              alt={fighter.name}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover rounded-md"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'var(--bg-card-hover)',
              }}
            />
          </button>
        )}
        <p
          className={`uppercase leading-tight ${
            isTitleFight ? 'text-lg sm:text-xl lg:text-2xl' : isMain ? 'text-sm sm:text-base lg:text-lg' : 'text-xs sm:text-sm lg:text-base'
          }`}
          style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            color: 'var(--text-primary)',
          }}
        >
          {fighter.name}
        </p>
      </div>

      {/* Meta */}
      <div
        className={`flex ${metaDir} items-center gap-2 flex-wrap relative z-10 pr-8`}
      >
        <DivisionBadge division={fighter.division} />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}
        >
          {fighter.record}
        </span>
        {fighter.rank && fighter.rank !== 'Unranked' && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
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
  fightId,
  slot,
  fight,
  isMain,
  noRestrictions,
  onPick,
  onClear,
  onToggleTitle,
  disableDrag,
}) => {
  const { f1, f2, lockedDiv, isTitleFight } = fight;
  const mismatch =
    !noRestrictions &&
    !!f1.division &&
    !!f2.division &&
    f1.division !== f2.division;
  const divColors = lockedDiv ? DIVISION_COLOR[lockedDiv] : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fightId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: mismatch
      ? '1px solid var(--border-mismatch)'
      : '1px solid var(--border-card)',
    background: mismatch ? 'var(--bg-mismatch)' : 'var(--bg-main)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative',
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
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-stone-400 hover:text-stone-600 px-1"
            title="Drag to reorder fights"
          >
            ⋮⋮
          </div>
        )}
        {(isMain && slot.id === 'm1') || isTitleFight ? (
          <span style={{ fontSize: 13 }}>🏆</span>
        ) : null}
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 800,
            fontSize: 9,
            letterSpacing: '0.15em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          {slot.label}
        </span>

        {lockedDiv && !noRestrictions && (
          <span
            className="ml-1"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 800,
              fontSize: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: divColors?.text,
              background: divColors?.bg,
              border: `1px solid ${divColors?.border}`,
              padding: '1px 5px',
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
              fontFamily: 'var(--font-condensed)',
              background: 'var(--bg-card)',
              color: isTitleFight ? 'var(--accent-color)' : 'var(--text-muted)',
              borderColor: isTitleFight
                ? 'var(--accent-color)'
                : 'var(--border-card)',
            }}
          >
            {isTitleFight ? 'TITLEFIGHT (5 ROUNDS)' : 'Make Title Fight'}
          </button>
        )}

        {mismatch && (
          <span
            className="ml-auto"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 9,
              color: '#d97706',
              fontStyle: 'italic',
            }}
          >
            ⚠ division mismatch
          </span>
        )}
      </div>

      {/* Fight cells */}
      <div className="flex items-stretch gap-2 px-2 pb-2">
        <FighterCell
          fighter={f1}
          isMain={isMain}
          isTitleFight={isTitleFight}
          onClick={() => onPick(fightId, 'f1')}
          onClear={() => onClear(fightId, 'f1')}
          onInfoClick={() => {
            if (f1.name) {
              const freshData = allFighters.find((f) => f.name === f1.name) as any;
              useStore.getState().setInfoModal(freshData || f1);
            }
          }}
        />
        {/* VS divider */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 36 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#ef4444',
            }}
          >
            VS
          </span>
        </div>
        <FighterCell
          fighter={f2}
          isMain={isMain}
          isTitleFight={isTitleFight}
          onClick={() => onPick(fightId, 'f2')}
          onClear={() => onClear(fightId, 'f2')}
          onInfoClick={() => {
            if (f2.name) {
              const freshData = allFighters.find((f) => f.name === f2.name) as any;
              useStore.getState().setInfoModal(freshData || f2);
            }
          }}
        />
      </div>
    </div>
  );
};
