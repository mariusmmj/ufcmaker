import React from 'react';
import { Fight, Fighter, FightSlot, FighterSlotKey } from '../types';
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
  isPicked?: boolean;
  isNotPicked?: boolean;
  pick?: import('../types').FightPick | null;
  pickemMode?: boolean;
  rounds?: 3 | 5;
  onClick: () => void;
  onClear: () => void;
  onInfoClick?: () => void;
  onUpdatePickDetails?: (method?: import('../types').PickMethod, round?: import('../types').PickRound) => void;
}

const FighterCell: React.FC<CellProps> = ({
  fighter,
  isMain,
  isTitleFight,
  isPicked,
  isNotPicked,
  pick,
  pickemMode,
  rounds = 3,
  onClick,
  onClear,
  onInfoClick,
  onUpdatePickDetails,
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

  const isChampion = fighter.rank?.includes('Champion');
  const defaultBg = isPicked
    ? 'rgba(34, 197, 94, 0.15)'
    : isChampion 
      ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.25), rgba(218, 165, 32, 0.1))' 
      : 'var(--bg-card)';
  const hoverBg = isPicked
    ? 'rgba(34, 197, 94, 0.25)'
    : isChampion 
      ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.35), rgba(218, 165, 32, 0.2))' 
      : 'var(--bg-card-hover)';

  const borderColor = isPicked ? '2px solid rgb(34, 197, 94)' : isChampion ? '1px solid rgba(218, 165, 32, 0.4)' : '1px solid var(--border-card)';

  const isExpandedForPick = isPicked && pickemMode;
  const computedMinHeight = isExpandedForPick
    ? (isTitleFight ? 116 : isMain ? 94 : 84)
    : (isTitleFight ? 96 : isMain ? 64 : 52);

  return (
    <div
      onClick={onClick}
      className={`flex-1 min-w-0 w-full flex flex-col justify-center ${align} px-4 py-2 rounded-xl cursor-pointer transition-all relative group`}
      style={{
        minHeight: computedMinHeight,
        background: defaultBg,
        border: borderColor,
        opacity: isNotPicked ? 0.3 : 1,
        transform: isNotPicked ? 'scale(0.98)' : 'scale(1)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = hoverBg)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = defaultBg)
      }
    >
      {/* Clear button */}
      {!isPicked && !isNotPicked && !useStore.getState().pickemMode && (
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
      )}

      {/* Pick'em winner badge */}
      {isPicked && (
        <div
          className={`absolute right-3 ${isExpandedForPick ? 'top-2.5' : 'top-1/2 -translate-y-1/2'} z-20 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5`}
          style={{
            background: '#22c55e',
            color: '#fff',
            fontFamily: 'var(--font-condensed)',
          }}
        >
          <span>✓ PICK</span>
          {pick?.method && (
            <span className="opacity-90">• {pick.method}</span>
          )}
          {pick?.round && pick.round !== 'DEC' && (
            <span className="opacity-90">{pick.round}</span>
          )}
        </div>
      )}

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
                background: isChampion 
                  ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.25), rgba(218, 165, 32, 0.1))' 
                  : 'var(--bg-card-hover)',
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
              color: isChampion ? '#daa520' : 'var(--text-secondary)',
              fontWeight: isChampion ? 800 : 400,
              fontStyle: isChampion ? 'normal' : 'italic',
              textTransform: isChampion ? 'uppercase' : 'none',
            }}
          >
            {fighter.rank}
          </span>
        )}
      </div>

      {/* Pick'em prediction detail selectors */}
      {isPicked && pickemMode && (
        <div
          className="relative z-30 mt-2 pt-2 border-t flex flex-wrap items-center gap-2 w-full"
          style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Method:</span>
            {(['KO/TKO', 'SUB', 'DEC'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePickDetails?.(
                    pick?.method === m ? undefined : m,
                    m === 'DEC' ? 'DEC' : pick?.round === 'DEC' ? undefined : pick?.round
                  );
                }}
                className="px-2 py-0.5 rounded text-[9px] font-black uppercase transition-colors"
                style={{
                  background: pick?.method === m ? 'rgb(34, 197, 94)' : 'var(--bg-main)',
                  color: pick?.method === m ? '#fff' : 'var(--text-secondary)',
                  border: pick?.method === m ? '1px solid rgb(34, 197, 94)' : '1px solid var(--border-card)',
                  fontFamily: 'var(--font-condensed)',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {pick?.method !== 'DEC' && (
            <div className="flex items-center gap-1 flex-wrap sm:ml-auto">
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Round:</span>
              {(rounds === 5 ? ['R1', 'R2', 'R3', 'R4', 'R5'] : ['R1', 'R2', 'R3']).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePickDetails?.(pick?.method, pick?.round === r ? undefined : (r as import('../types').PickRound));
                  }}
                  className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-colors"
                  style={{
                    background: pick?.round === r ? 'rgb(34, 197, 94)' : 'var(--bg-main)',
                    color: pick?.round === r ? '#fff' : 'var(--text-secondary)',
                    border: pick?.round === r ? '1px solid rgb(34, 197, 94)' : '1px solid var(--border-card)',
                    fontFamily: 'var(--font-condensed)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
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

  const { pickemMode, picks, setPick, setPickDetails } = useStore();
  const rawPick = picks[fightId];
  const currentPickObj = typeof rawPick === 'string' ? { winner: rawPick } : rawPick;
  const currentWinner = currentPickObj?.winner;
  const titleType = fight.titleType || (isTitleFight ? 'undisputed' : null);

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
      className="rounded-2xl mb-2 overflow-hidden shadow-sm"
    >
      {/* Title Banner */}
      {isTitleFight && (
        <div
          className="w-full py-1 px-3 text-center tracking-widest uppercase font-black text-[10px] md:text-xs flex items-center justify-center gap-2 shadow-sm"
          style={
            titleType === 'bmf'
              ? {
                  background: 'linear-gradient(90deg, #09090b, #52525b, #09090b)',
                  borderBottom: '1px solid #71717a',
                  color: '#f4f4f5',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  fontFamily: 'var(--font-condensed)',
                }
              : titleType === 'interim'
              ? {
                  background: 'linear-gradient(90deg, #6b7280, #daa520, #6b7280)',
                  borderBottom: '1px solid rgba(218, 165, 32, 0.5)',
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                  fontFamily: 'var(--font-condensed)',
                }
              : {
                  background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.4), rgba(218, 165, 32, 0.85), rgba(218, 165, 32, 0.4))',
                  borderBottom: '1px solid rgba(218, 165, 32, 0.6)',
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  fontFamily: 'var(--font-condensed)',
                }
          }
        >
          {titleType === 'bmf'
            ? 'BMF TITLEFIGHT (5 ROUNDS)'
            : titleType === 'interim'
            ? 'INTERIM TITLEFIGHT (5 ROUNDS)'
            : 'TITLEFIGHT (5 ROUNDS)'}
        </div>
      )}

      {/* Row header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        {!disableDrag && !pickemMode && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-stone-400 hover:text-stone-600 px-1"
            title="Drag to reorder fights"
          >
            ⋮⋮
          </div>
        )}
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
            className="ml-2 px-2.5 py-0.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer"
            style={
              !isTitleFight
                ? {
                    fontFamily: 'var(--font-condensed)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-card)',
                  }
                : titleType === 'bmf'
                ? {
                    fontFamily: 'var(--font-condensed)',
                    background: 'linear-gradient(90deg, #18181b, #3f3f46)',
                    color: '#f4f4f5',
                    border: '1px solid #71717a',
                  }
                : titleType === 'interim'
                ? {
                    fontFamily: 'var(--font-condensed)',
                    background: 'linear-gradient(90deg, rgba(107, 114, 128, 0.4), rgba(218, 165, 32, 0.4))',
                    color: '#ffffff',
                    border: '1px solid #daa520',
                  }
                : {
                    fontFamily: 'var(--font-condensed)',
                    background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.3), rgba(218, 165, 32, 0.15))',
                    color: '#daa520',
                    border: '1px solid #daa520',
                  }
            }
          >
            {!isTitleFight
              ? '+ Make Title'
              : titleType === 'bmf'
              ? 'BMF Title'
              : titleType === 'interim'
              ? 'Interim Title'
              : 'Undisputed Title'}
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
          isPicked={pickemMode && currentWinner === 'f1'}
          isNotPicked={pickemMode && currentWinner === 'f2'}
          pick={currentWinner === 'f1' ? currentPickObj : null}
          pickemMode={pickemMode}
          rounds={fight.rounds || (fight.isTitleFight ? 5 : 3)}
          onClick={() => {
            if (pickemMode) {
              if (f1.name) setPick(fightId, currentWinner === 'f1' ? null : 'f1');
            } else {
              onPick(fightId, 'f1');
            }
          }}
          onClear={() => onClear(fightId, 'f1')}
          onInfoClick={() => {
            if (f1.name) {
              const freshData = allFighters.find((f) => f.name === f1.name) as Fighter | undefined;
              useStore.getState().setInfoModal(freshData || f1);
            }
          }}
          onUpdatePickDetails={(method, round) => setPickDetails(fightId, method, round)}
        />

        {/* VS divider */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 40 }}
        >
          <button
            onClick={() => {
              if (f1.name && f2.name) {
                const freshF1 = (allFighters.find((f) => f.name === f1.name) || f1) as Fighter;
                const freshF2 = (allFighters.find((f) => f.name === f2.name) || f2) as Fighter;
                useStore.getState().setTaleModal({ ...fight, f1: freshF1, f2: freshF2 });
              }
            }}
            className="flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 bg-transparent border-none p-0 cursor-pointer"
            title="View Tale of the Tape"
            disabled={!f1.name || !f2.name}
            style={{ opacity: f1.name && f2.name ? 1 : 0.5 }}
          >
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: '0.2em',
                color: '#ef4444',
              }}
            >
              VS
            </span>
            {f1.name && f2.name && (
              <span className="text-[8px] uppercase tracking-widest text-stone-400 mt-0.5">Stats</span>
            )}
          </button>
        </div>
        <FighterCell
          fighter={f2}
          isMain={isMain}
          isTitleFight={isTitleFight}
          isPicked={pickemMode && currentWinner === 'f2'}
          isNotPicked={pickemMode && currentWinner === 'f1'}
          pick={currentWinner === 'f2' ? currentPickObj : null}
          pickemMode={pickemMode}
          rounds={fight.rounds || (fight.isTitleFight ? 5 : 3)}
          onClick={() => {
            if (pickemMode) {
              if (f2.name) setPick(fightId, currentWinner === 'f2' ? null : 'f2');
            } else {
              onPick(fightId, 'f2');
            }
          }}
          onClear={() => onClear(fightId, 'f2')}
          onInfoClick={() => {
            if (f2.name) {
              const freshData = allFighters.find((f) => f.name === f2.name) as Fighter | undefined;
              useStore.getState().setInfoModal(freshData || f2);
            }
          }}
          onUpdatePickDetails={(method, round) => setPickDetails(fightId, method, round)}
        />
      </div>
    </div>
  );
};
