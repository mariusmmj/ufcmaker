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
          {/* Header images */}
          <div className="flex w-full min-h-[200px] md:min-h-[350px]">
            {/* Fighter 1 Image */}
            <div
              className="w-1/2 relative flex items-end justify-center overflow-hidden"
              style={{ background: getFighterBg(f1), borderRight: '2px solid #ef4444' }}
            >
              {f1Img ? (
                <img
                  src={f1Img}
                  alt={f1.name}
                  className={`object-bottom ${isF1Full ? 'object-contain h-full max-h-[350px] p-4' : 'object-cover w-32 h-32 md:w-48 md:h-48 rounded-full mb-8 shadow-xl'}`}
                  style={{ filter: isF1Full ? 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' : 'none' }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full mb-8 flex items-center justify-center text-4xl shadow-xl bg-stone-200 text-stone-600">
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
                  className={`object-bottom ${isF2Full ? 'object-contain h-full max-h-[350px] p-4' : 'object-cover w-32 h-32 md:w-48 md:h-48 rounded-full mb-8 shadow-xl'}`}
                  style={{ filter: isF2Full ? 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' : 'none' }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full mb-8 flex items-center justify-center text-4xl shadow-xl bg-stone-200 text-stone-600">
                  {f2.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            {/* Center VS Logo */}
            <div className="absolute left-1/2 top-[100px] md:top-[175px] -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-xl z-10 border-4 border-[var(--bg-card)]" style={{ fontFamily: 'var(--font-condensed)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '2px' }}>
              VS
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-4 md:p-8 flex flex-col">
            {/* Names */}
            <div className="flex justify-between items-end mb-6 border-b-2 pb-4 border-[var(--accent-color)]">
              <div className="w-1/2 pr-4 text-left">
                <h2 className="text-2xl md:text-5xl uppercase leading-none" style={{ fontFamily: 'var(--font-condensed)', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {f1.name}
                </h2>
                <div className="text-sm md:text-lg mt-1 text-stone-400 font-bold uppercase">{f1.rank}</div>
              </div>
              <div className="w-1/2 pl-4 text-right">
                <h2 className="text-2xl md:text-5xl uppercase leading-none" style={{ fontFamily: 'var(--font-condensed)', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {f2.name}
                </h2>
                <div className="text-sm md:text-lg mt-1 text-stone-400 font-bold uppercase">{f2.rank}</div>
              </div>
            </div>

            {/* Tale of the Tape */}
            <h3 className="text-center text-xl font-black tracking-widest text-red-500 uppercase mb-4 mt-2" style={{ fontFamily: 'var(--font-condensed)' }}>Tale of the Tape</h3>
            
            <StatRow label="Record" val1={f1.record} val2={f2.record} />
            <StatRow label="Age" val1={f1.age} val2={f2.age} />
            
            <h3 className="text-center text-xl font-black tracking-widest text-red-500 uppercase mb-4 mt-8" style={{ fontFamily: 'var(--font-condensed)' }}>Win Methods</h3>
            <StatRow label="KO / TKO" val1={f1.winMethods?.ko} val2={f2.winMethods?.ko} />
            <StatRow label="Submission" val1={f1.winMethods?.sub} val2={f2.winMethods?.sub} />
            <StatRow label="Decision" val1={f1.winMethods?.dec} val2={f2.winMethods?.dec} />
          </div>
        </div>
      </div>
    </div>
  );
};
