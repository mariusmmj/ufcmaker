import React from 'react';
import { DIVISION_COLOR } from '../constants';

interface Props {
  division: string | null;
  size?: 'sm' | 'md';
}

export const DivisionBadge: React.FC<Props> = ({ division, size = 'sm' }) => {
  if (!division) return null;
  const colors = DIVISION_COLOR[division] ?? {
    text: '#374151',
    bg: '#f9fafb',
    border: '#e5e7eb',
  };

  return (
    <span
      className={
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
      }
      style={{
        fontFamily: 'var(--font-condensed)',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: colors.text,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {division}
    </span>
  );
};
