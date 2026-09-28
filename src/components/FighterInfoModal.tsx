import React from 'react';
import { Fighter } from '../types';
import { DivisionBadge } from './DivisionBadge';
import { DIVISION_COLOR } from '../constants';

interface Props {
  fighter: Fighter;
  onClose: () => void;
}

export const FighterInfoModal: React.FC<Props> = ({ fighter, onClose }) => {
  const imageToUse = fighter.fullBodyImage || fighter.image;
  const isFullBody = !!fighter.fullBodyImage;
  const divColors = DIVISION_COLOR[fighter.division || ''] || { bg: '#eee', text: '#333', border: '#ccc' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
        <div
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-main)',
            minHeight: '400px',
          }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: 'var(--bg-card-hover)',
            color: 'var(--text-primary)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        {/* Left Side: Image */}
        <div
          className="w-full md:w-1/2 relative flex items-end justify-center overflow-hidden"
          style={{
            background: fighter.rank?.includes('Champion') 
              ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.25), rgba(218, 165, 32, 0.1))' 
              : 'var(--bg-main)',
            minHeight: '300px',
          }}
        >
          {imageToUse ? (
            <img
              src={imageToUse}
              alt={fighter.name}
              className={`object-cover object-bottom ${isFullBody ? 'h-full max-h-[500px]' : 'w-48 h-48 rounded-full mb-8 shadow-xl'}`}
              style={{
                filter: isFullBody ? 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' : 'none',
              }}
            />
          ) : (
            <div
              className="w-48 h-48 rounded-full mb-8 flex items-center justify-center text-4xl shadow-xl"
              style={{
                background: divColors.bg,
                color: divColors.text,
                border: `2px solid ${divColors.border}`,
                fontFamily: 'var(--font-condensed)',
                fontWeight: 900,
              }}
            >
              {fighter.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Right Side: Stats */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2
              style={{
                fontFamily: 'var(--font-condensed)',
                fontWeight: 900,
                fontSize: '2.5rem',
                lineHeight: 1,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              {fighter.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <DivisionBadge division={fighter.division} />
              {fighter.rank && fighter.rank !== 'Unranked' && (
                <span
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--accent-color)',
                    background: 'var(--accent-bg)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {fighter.rank}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Record</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-condensed)' }}>
                {fighter.record}
              </div>
            </div>
            {fighter.age && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Age</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-condensed)' }}>
                  {fighter.age}
                </div>
              </div>
            )}
          </div>

          {fighter.winMethods && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
                Win Methods
              </div>
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'var(--bg-card-hover)' }}>
                  <div style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-condensed)' }}>
                    {fighter.winMethods.ko}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>KO/TKO</div>
                </div>
                <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'var(--bg-card-hover)' }}>
                  <div style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-condensed)' }}>
                    {fighter.winMethods.sub}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>SUB</div>
                </div>
                <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'var(--bg-card-hover)' }}>
                  <div style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-condensed)' }}>
                    {fighter.winMethods.dec}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>DEC</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
