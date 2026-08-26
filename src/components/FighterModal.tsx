import React, { useEffect, useRef, useState } from 'react';
import { Fighter } from '../types';
import { DIVISION_COLOR } from '../constants';
import { DivisionBadge } from './DivisionBadge';
import allFighters from '../data/fighters.json';

const FIGHTERS = allFighters as Fighter[];

function getRankNum(rank?: string): number {
  if (!rank || rank === 'Unranked') return 999;
  if (rank === 'Champion' || rank === 'C') return 0;
  const num = parseInt(rank.replace('#', ''), 10);
  return isNaN(num) ? 999 : num;
}

function search(
  query: string,
  lockedDiv: string | null,
  selectedFighters: string[] = [],
  fightId: string
): Fighter[] {
  const isMainEvent = fightId === 'm1' || fightId === 'm2';
  const q = query.toLowerCase().trim();

  return FIGHTERS.filter((f) => {
    if (selectedFighters.includes(f.name)) return false;

    const rNum = getRankNum(f.rank);
    if (isMainEvent) {
      // Main/Co-main: ONLY top 5 or champion
      if (rNum > 5) return false;
    } else {
      // Prelims/others: NO champions allowed
      if (rNum === 0) return false;
    }

    const matchName = !q || f.name.toLowerCase().includes(q);
    const matchDiv = !q || (f.division?.toLowerCase().includes(q) ?? false);
    const matchQuery = matchName || matchDiv;
    const matchLocked = !lockedDiv || f.division === lockedDiv;
    return matchQuery && matchLocked;
  }).slice(0, 8);
}

interface Props {
  fightId: string;
  lockedDiv: string | null;
  noRestrictions: boolean;
  onSelect: (fighter: Fighter) => void;
  onClose: () => void;
  selectedFighters?: string[];
}

export const FighterModal: React.FC<Props> = ({
  fightId,
  lockedDiv,
  noRestrictions,
  onSelect,
  onClose,
  selectedFighters = [],
}) => {
  const effectiveLock = noRestrictions ? null : lockedDiv;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fighter[]>(() =>
    search('', effectiveLock, selectedFighters, fightId)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Custom fighter form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDiv, setCustomDiv] = useState(effectiveLock || 'Lightweight');
  const [customRecord, setCustomRecord] = useState('0-0-0');
  const [customRank, setCustomRank] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    setResults(search(val, effectiveLock, selectedFighters, fightId));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const rankVal = customRank.trim() || 'Unranked';
    const rNum = getRankNum(rankVal);
    const isMainEvent = fightId === 'm1' || fightId === 'm2';

    if (isMainEvent && rNum > 5) {
      alert(
        'Only Champions and top 5 ranked fighters are allowed in Main Event and Co-Main Event!'
      );
      return;
    }
    if (!isMainEvent && rNum === 0) {
      alert('Only Champions and top 5 ranked fighters are allowed in Main Event and Co-Main Event!');
      return;
    }

    onSelect({
      name: customName.trim(),
      division: customDiv,
      record: customRecord.trim() || '0-0-0',
      rank: rankVal,
    });
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="fade-up flex flex-col overflow-hidden"
        style={{
          width: 'min(480px, 96vw)',
          maxHeight: '78vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '1px solid var(--border-card)' }}
        >
          <span
            className="flex-1 tracking-widest"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 900,
              fontSize: 14,
              color: 'var(--text-primary)',
            }}
          >
            {showCustomForm ? 'NEW FIGHTER' : 'PICK FIGHTER'}
          </span>
          {effectiveLock && !showCustomForm && (
            <DivisionBadge division={effectiveLock} size="md" />
          )}
          {noRestrictions && !showCustomForm && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-sm tracking-widest"
              style={{
                fontWeight: 800,
                border: '1px solid var(--border-main)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-main)',
              }}
            >
              ALL DIVISIONS
            </span>
          )}
          <button
            onClick={onClose}
            className="transition-colors ml-1 rounded p-0.5"
            style={{
              fontSize: 15,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--text-primary)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--text-muted)')
            }
          >
            ✕
          </button>
        </div>

        {showCustomForm ? (
          /* ── Custom Fighter Form ────────────────── */
          <form
            onSubmit={handleCustomSubmit}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-condensed)',
                  color: 'var(--text-secondary)',
                }}
              >
                Name
              </label>
              <input
                autoFocus
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded border outline-none"
                style={{
                  background: 'var(--bg-main)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            {!effectiveLock && (
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-condensed)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Weightclass
                </label>
                <select
                  value={customDiv}
                  onChange={(e) => setCustomDiv(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded border outline-none"
                  style={{
                    background: 'var(--bg-main)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {Object.keys(DIVISION_COLOR).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-condensed)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Record (W-L-D)
                </label>
                <input
                  value={customRecord}
                  onChange={(e) => setCustomRecord(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded border outline-none"
                  style={{
                    background: 'var(--bg-main)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="flex-1">
                <label
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-condensed)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Ranking (optional)
                </label>
                <input
                  placeholder="#1, Champion, etc."
                  value={customRank}
                  onChange={(e) => setCustomRank(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded border outline-none"
                  style={{
                    background: 'var(--bg-main)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="flex-1 py-2 rounded font-bold transition-colors"
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-condensed)',
                }}
              >
                BACK
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded font-bold transition-colors"
                style={{
                  background: 'var(--accent-color)',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'var(--font-condensed)',
                }}
              >
                ADD TO CARD
              </button>
            </div>
          </form>
        ) : (
          /* ── Search & Results ───────────────────── */
          <>
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-card)' }}
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Søk på fighternavn eller vektklasse..."
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'var(--accent-color)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'var(--border-card)')
                }
              />
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col">
              {results.length === 0 && (
                <p
                  className="text-center py-8 text-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text-muted)',
                  }}
                >
                  No fighters found.
                </p>
              )}
              {results.map((f, i) => {
                const colors = DIVISION_COLOR[f.division ?? ''] ?? {
                  text: '#374151',
                  bg: '#f9fafb',
                  border: '#e5e7eb',
                };
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border-main)' }}
                    onClick={() => onSelect(f)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        'var(--bg-card-hover)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full text-sm"
                      style={{
                        width: 38,
                        height: 38,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                        fontFamily: 'var(--font-condensed)',
                        fontWeight: 900,
                        fontSize: 13,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {initials(f.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="mb-0.5"
                        style={{
                          fontFamily: 'var(--font-condensed)',
                          fontWeight: 800,
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {f.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <DivisionBadge division={f.division} />
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {f.record}
                        </span>
                        {f.rank && f.rank !== 'Unranked' && (
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: 10,
                              color: 'var(--text-secondary)',
                              fontStyle: 'italic',
                            }}
                          >
                            {f.rank}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      style={{ color: 'var(--text-muted)' }}
                      className="text-base"
                    >
                      ›
                    </span>
                  </div>
                );
              })}

              <div className="p-4 mt-auto">
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed transition-colors"
                  style={{
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-condensed)',
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.color = 'var(--accent-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  + CREATE CUSTOM FIGHTER
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
