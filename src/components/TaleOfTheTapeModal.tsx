import React from 'react';
import { Fight, Fighter } from '../types';

interface Props {
  fight: Fight;
  onClose: () => void;
}

const StatRow = ({ label, val1, val2 }: { label: string, val1: React.ReactNode, val2: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-main)' }}>
    <div className="w-1/3 text-center text-xl md:text-2xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-condensed)', fontWeight: 900 }}>{val1 || '-'}</div>
    <div className="w-1/3 text-center text-xs md:text-sm uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>{label}</div>
    <div className="w-1/3 text-center text-xl md:text-2xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-condensed)', fontWeight: 900 }}>{val2 || '-'}</div>
  </div>
);

export const TaleOfTheTapeModal: React.FC<Props> = ({ fight, onClose }) => {
  const { f1, f2 } = fight;

  const f1Img = f1.fullBodyImage || f1.image;
  const f2Img = f2.fullBodyImage || f2.image;
  const isF1Full = !!f1.fullBodyImage;
  const isF2Full = !!f2.fullBodyImage;

  const getFighterBg = (fighter: Fighter) => {
    return fighter.rank?.includes('Champion')
      ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.25), rgba(218, 165, 32, 0.1))'
      : 'var(--bg-main)';
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-main)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-[110] flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          style={{ border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
        >
          ✕
        </button>

        <div className="w-full h-full overflow-y-auto">
          {/* Title Fight Banner */}
          {fight.isTitleFight && (
            <div
              className="w-full py-1.5 px-4 text-center tracking-widest uppercase font-black text-xs md:text-sm shadow-sm"
              style={
                fight.titleType === 'bmf'
                  ? {
                      background: 'linear-gradient(90deg, #09090b, #52525b, #09090b)',
                      color: '#f4f4f5',
                      borderBottom: '1px solid #71717a',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      fontFamily: 'var(--font-condensed)',
                    }
                  : fight.titleType === 'interim'
                  ? {
                      background: 'linear-gradient(90deg, #6b7280, #daa520, #6b7280)',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(218, 165, 32, 0.5)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                      fontFamily: 'var(--font-condensed)',
                    }
                  : {
                      background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.4), rgba(218, 165, 32, 0.85), rgba(218, 165, 32, 0.4))',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(218, 165, 32, 0.6)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      fontFamily: 'var(--font-condensed)',
                    }
              }
            >
              {fight.titleType === 'bmf'
                ? 'BMF TITLEFIGHT (5 ROUNDS)'
                : fight.titleType === 'interim'
                ? 'INTERIM TITLEFIGHT (5 ROUNDS)'
                : 'TITLEFIGHT (5 ROUNDS)'}
            </div>
          )}

          {/* Header images */}
          <div className="relative flex w-full min-h-[160px] md:min-h-[320px]">
            {/* Fighter 1 Image */}
            <div
              className="w-1/2 relative flex items-end justify-center overflow-hidden"
              style={{ background: getFighterBg(f1), borderRight: '1px solid var(--border-main)' }}
            >
              {f1Img ? (
                <img
                  src={f1Img}
                  alt={f1.name}
                  className={`block object-bottom ${isF1Full ? 'object-contain h-full max-h-[180px] md:max-h-[320px] pt-2 px-2 pb-0 md:pt-4 md:px-4 md:pb-0 self-end' : 'object-cover w-24 h-24 md:w-44 md:h-44 rounded-full my-auto shadow-xl'}`}
                  style={{ filter: isF1Full ? 'drop-shadow(0px 8px 12px rgba(0,0,0,0.35))' : 'none', marginBottom: 0 }}
                />
              ) : (
                <div className="w-20 h-20 md:w-36 md:h-36 rounded-full my-auto flex items-center justify-center text-3xl md:text-5xl shadow-xl bg-stone-200 text-stone-600 font-bold" style={{ fontFamily: 'var(--font-condensed)' }}>
                  {f1.name?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Fighter 2 Image */}
            <div
              className="w-1/2 relative flex items-end justify-center overflow-hidden"
              style={{ background: getFighterBg(f2) }}
            >
              {f2Img ? (
                <img
                  src={f2Img}
                  alt={f2.name}
                  className={`block object-bottom ${isF2Full ? 'object-contain h-full max-h-[180px] md:max-h-[320px] pt-2 px-2 pb-0 md:pt-4 md:px-4 md:pb-0 self-end' : 'object-cover w-24 h-24 md:w-44 md:h-44 rounded-full my-auto shadow-xl'}`}
                  style={{ filter: isF2Full ? 'drop-shadow(0px 8px 12px rgba(0,0,0,0.35))' : 'none', marginBottom: 0 }}
                />
              ) : (
                <div className="w-20 h-20 md:w-36 md:h-36 rounded-full my-auto flex items-center justify-center text-3xl md:text-5xl shadow-xl bg-stone-200 text-stone-600 font-bold" style={{ fontFamily: 'var(--font-condensed)' }}>
                  {f2.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            {/* Center VS Badge */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-2xl z-10"
              style={{
                background: '#ef4444',
                color: '#fff',
                border: '3px solid var(--bg-card)',
                fontFamily: 'var(--font-condensed)',
                fontWeight: 900,
                fontSize: '0.9rem',
                letterSpacing: '1px',
              }}
            >
              VS
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-4 md:p-8 flex flex-col">
            {/* Division label if present */}
            {(f1.division || f2.division) && (
              <div className="text-center mb-3">
                <span
                  className="px-3 py-1 rounded text-xs font-black uppercase tracking-wider"
                  style={{
                    background: 'var(--bg-main)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-main)',
                    fontFamily: 'var(--font-condensed)',
                  }}
                >
                  {f1.division || f2.division}
                </span>
              </div>
            )}

            {/* Names & Ranks */}
            <div className="flex justify-between items-start mb-6 border-b pb-4" style={{ borderColor: 'var(--border-main)' }}>
              <div className="w-1/2 pr-3 text-left">
                <h2
                  className="text-xl sm:text-2xl md:text-4xl uppercase leading-tight"
                  style={{ fontFamily: 'var(--font-condensed)', fontWeight: 900, color: 'var(--text-primary)' }}
                >
                  {f1.name}
                </h2>
                <div
                  className="text-xs sm:text-sm md:text-base mt-1 font-bold uppercase tracking-wider"
                  style={{
                    color: f1.rank?.includes('Champion') ? '#daa520' : 'var(--text-muted)',
                  }}
                >
                  {f1.rank || 'Unranked'}
                </div>
              </div>
              <div className="w-1/2 pl-3 text-right">
                <h2
                  className="text-xl sm:text-2xl md:text-4xl uppercase leading-tight"
                  style={{ fontFamily: 'var(--font-condensed)', fontWeight: 900, color: 'var(--text-primary)' }}
                >
                  {f2.name}
                </h2>
                <div
                  className="text-xs sm:text-sm md:text-base mt-1 font-bold uppercase tracking-wider"
                  style={{
                    color: f2.rank?.includes('Champion') ? '#daa520' : 'var(--text-muted)',
                  }}
                >
                  {f2.rank || 'Unranked'}
                </div>
              </div>
            </div>

            {/* Tale of the Tape */}
            <h3
              className="text-center text-sm md:text-base font-black tracking-widest uppercase mb-2"
              style={{ color: '#ef4444', fontFamily: 'var(--font-condensed)' }}
            >
              Tale of the Tape
            </h3>
            
            <StatRow label="Record" val1={f1.record} val2={f2.record} />
            <StatRow label="Age" val1={f1.age} val2={f2.age} />
            
            {/* Win Methods */}
            {(f1.winMethods || f2.winMethods) && (
              <>
                <h3
                  className="text-center text-sm md:text-base font-black tracking-widest uppercase mb-2 mt-6"
                  style={{ color: '#ef4444', fontFamily: 'var(--font-condensed)' }}
                >
                  Win Methods
                </h3>
                <StatRow label="KO / TKO" val1={f1.winMethods?.ko ?? '-'} val2={f2.winMethods?.ko ?? '-'} />
                <StatRow label="Submission" val1={f1.winMethods?.sub ?? '-'} val2={f2.winMethods?.sub ?? '-'} />
                <StatRow label="Decision" val1={f1.winMethods?.dec ?? '-'} val2={f2.winMethods?.dec ?? '-'} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
