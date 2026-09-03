import React from 'react';
import { FightsMap } from '../types';

interface Props {
  fights: FightsMap;
}

export const CardStats: React.FC<Props> = ({ fights }) => {
  let totalFights = 0;
  let titleFights = 0;
  let totalWins = 0;
  let totalLosses = 0;
  const divisionsCount: Record<string, number> = {};

  Object.values(fights).forEach((fight) => {
    if (fight.f1.name && fight.f2.name) {
      totalFights++;
      if (fight.isTitleFight) titleFights++;

      // Divisions
      if (fight.lockedDiv) {
        divisionsCount[fight.lockedDiv] =
          (divisionsCount[fight.lockedDiv] || 0) + 1;
      }

      // Records
      const parseRecord = (record?: string) => {
        if (!record) return;
        const match = record.match(/^(\d+)-(\d+)/);
        if (match) {
          totalWins += parseInt(match[1], 10);
          totalLosses += parseInt(match[2], 10);
        }
      };
      parseRecord(fight.f1.record);
      parseRecord(fight.f2.record);
    }
  });

  if (totalFights === 0) return null;

  // Find most prominent division
  let topDiv = '-';
  let topDivCount = 0;
  Object.entries(divisionsCount).forEach(([div, count]) => {
    if (count > topDivCount) {
      topDivCount = count;
      topDiv = div;
    }
  });

  return (
    <div
      className="my-6 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      }}
    >
      {/* Stats Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        <div className="flex flex-col">
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: 2,
            }}
          >
            Total Fights
          </span>
          <span
            style={{
              fontSize: 18,
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontFamily: 'var(--font-condensed)',
            }}
          >
            {totalFights}
          </span>
        </div>
        <div className="flex flex-col">
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: 2,
            }}
          >
            Titlefights
          </span>
          <span
            style={{
              fontSize: 18,
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontFamily: 'var(--font-condensed)',
            }}
          >
            {titleFights}
          </span>
        </div>
        <div className="flex flex-col">
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: 2,
            }}
          >
            Dominating Weight Class
          </span>
          <span
            style={{
              fontSize: 14,
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontFamily: 'var(--font-condensed)',
              marginTop: 2,
            }}
          >
            {topDiv}
          </span>
        </div>
        <div className="flex flex-col">
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: 2,
            }}
          >
            Combined W-L
          </span>
          <span
            style={{
              fontSize: 18,
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontFamily: 'var(--font-condensed)',
            }}
          >
            {totalWins}-{totalLosses}
          </span>
        </div>
      </div>
    </div>
  );
};
