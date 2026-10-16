import React from 'react';
import { useStore } from '../store/useStore';

interface GuideSection {
  badge: string;
  title: string;
  description: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    badge: 'Fighters',
    title: 'Adding Fighters',
    description:
      'Click on any empty slot labeled "+ ADD FIGHTER". Search by name or weight class, or use the quick-filter chips ([Champions], [Top 5], [Undefeated], [KO Artists], [Sub Experts]) to find contenders quickly. You can also create and add custom fighters.',
  },
  {
    badge: 'Fighters',
    title: 'Removing Fighters',
    description:
      'Hover over or tap any placed fighter and click the red "✕" button to remove them and clear the slot.',
  },
  {
    badge: 'Stats',
    title: 'Viewing Fighter Stats',
    description:
      'Click directly on any fighter\'s portrait image to view their complete profile, full-body photo, official UFC record, age, ranking, and win methods breakdown (KO/TKO, Submissions, Decisions).',
  },
  {
    badge: 'Stats',
    title: 'Tale of the Tape (Side-by-Side VS Stats)',
    description:
      'Once both fighters are placed in a matchup, click the red "VS" button between them to open the Tale of the Tape modal, comparing their records, ages, win method distributions, and championship stakes side-by-side.',
  },
  {
    badge: 'Championship',
    title: 'Making Title Fights (Undisputed, Interim, BMF)',
    description:
      'Click the "+ Make Title" button in the fight row header to cycle through championship belts: Undisputed Title (Gold Banner), Interim Title (Gold & Silver Banner), BMF Title (Silver & Black Banner), or standard 3-round bout.',
  },
  {
    badge: 'Matchmaking',
    title: 'Dragging & Reordering Fights',
    description:
      'Click and drag the handle (⋮⋮) on the left side of any fight row to rearrange the card order. The Main Event and Co-Main Event are reserved for Champions and Top 5 contenders by default.',
  },
  {
    badge: 'Matchmaking',
    title: 'Weight Class Restrictions',
    description:
      'Toggle the "No Weight Class Restrictions" switch in the top header to bypass division limits and create fantasy cross-division or open-weight matchups.',
  },
  {
    badge: 'Controls',
    title: 'Randomize Card',
    description:
      'Click "Random Card" in the navigation bar to instantly generate a complete, realistic fight card with randomized bouts from UFC divisions.',
  },
  {
    badge: 'Controls',
    title: 'Clear Card',
    description:
      'Click "Clear Card" to wipe all placed fighters and reset the entire event card back to clean, empty slots.',
  },
  {
    badge: 'Predictions',
    title: 'Interactive Pick\'em Mode',
    description:
      'Toggle "Pick\'em Mode" in the navbar, then click on your predicted winner in each matchup to highlight them. You can optionally pick the Method (KO/TKO, SUB, DEC) and Round (R1 to R5 or Decision).',
  },
  {
    badge: 'Export',
    title: 'Saving, Sharing & Image Export',
    description:
      'Use "Save Card" to store cards locally in your "History". Use "Share Link" to compress your entire card and predictions into a link you can send to friends. Click "Image Export" to download a high-resolution PNG image of the fight card.',
  },
];

export const HowToUseModal: React.FC = () => {
  const { setHelpModalOpen } = useStore();

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setHelpModalOpen(false)}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-main)',
          maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div>
            <h2
              className="text-2xl md:text-3xl uppercase leading-none"
              style={{
                fontFamily: 'var(--font-condensed)',
                fontWeight: 900,
                color: 'var(--text-primary)',
              }}
            >
              How to Use UFC Card Maker
            </h2>
            <p
              className="text-xs md:text-sm mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              Quick guide to building, customizing, and sharing your fight cards
            </p>
          </div>

          <button
            onClick={() => setHelpModalOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer"
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-main)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Close guide"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3.5">
          {GUIDE_SECTIONS.map((section, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border transition-all"
              style={{
                background: 'var(--bg-main)',
                borderColor: 'var(--border-main)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background: 'var(--accent-bg)',
                    color: 'var(--accent-color)',
                    fontFamily: 'var(--font-condensed)',
                  }}
                >
                  {section.badge}
                </span>
                <h3
                  className="text-sm md:text-base font-bold uppercase tracking-wide"
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {section.title}
                </h3>
              </div>
              <p
                className="text-xs md:text-sm leading-relaxed"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {section.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex justify-end"
          style={{ borderColor: 'var(--border-main)', background: 'var(--bg-main)' }}
        >
          <button
            onClick={() => setHelpModalOpen(false)}
            className="px-5 py-1.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
            style={{
              background: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              fontFamily: 'var(--font-condensed)',
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
