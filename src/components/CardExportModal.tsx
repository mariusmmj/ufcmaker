import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { toPng, toBlob } from 'html-to-image';
import { FightSlot, Fight } from '../types';
import { DIVISION_COLOR } from '../constants';

interface SectionDef {
  id: 'main' | 'prelims';
  title: string;
  badgeLabel: string;
  fileSuffix: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'main', title: 'Main Card', badgeLabel: 'Main Card', fileSuffix: 'Main_Card' },
  { id: 'prelims', title: 'Preliminary Card', badgeLabel: 'Prelims', fileSuffix: 'Prelims' },
];

export const CardExportModal: React.FC = () => {
  const { eventName, fights, slots, setCardExportModalOpen } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isExportingCurrent, setIsExportingCurrent] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  // Partition slots into 2 sections: Main Card (main) and Prelims (prelim)
  const getSectionSlots = useCallback(
    (sectionId: 'main' | 'prelims'): FightSlot[] => {
      if (sectionId === 'main') {
        return slots.filter((s) => s.section === 'main');
      }
      return slots.filter((s) => s.section === 'prelim');
    },
    [slots]
  );

  const getFightsForSection = useCallback(
    (sectionId: 'main' | 'prelims') => {
      const sectionSlots = getSectionSlots(sectionId);
      return sectionSlots
        .map((slot) => {
          const fight = fights[slot.id];
          return { slot, fight };
        })
        .filter((item) => item.fight && (item.fight.f1.name || item.fight.f2.name));
    },
    [fights, getSectionSlots]
  );

  const mainFights = getFightsForSection('main');
  const prelimFights = getFightsForSection('prelims');

  const sectionFightsMap = {
    main: mainFights,
    prelims: prelimFights,
  };

  const currentSection = SECTIONS[activeSectionIndex];
  const currentFights = sectionFightsMap[currentSection.id];

  const handlePrev = useCallback(() => {
    setActiveSectionIndex((prev) => (prev === 0 ? SECTIONS.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveSectionIndex((prev) => (prev === SECTIONS.length - 1 ? 0 : prev + 1));
  }, []);

  // Keyboard arrow navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  // Download single active picture
  const handleDownloadCurrent = async () => {
    if (!cardRef.current || isExportingCurrent || isExportingAll) return;
    setIsExportingCurrent(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0c0c0e',
      });
      const link = document.createElement('a');
      link.download = `${eventName.replace(/\s+/g, '_')}_${currentSection.fileSuffix}_card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsExportingCurrent(false);
    }
  };

  // Download all 3 pictures sequentially
  const handleDownloadAll = async () => {
    if (!cardRef.current || isExportingAll || isExportingCurrent) return;
    setIsExportingAll(true);
    const initialIndex = activeSectionIndex;

    try {
      for (let i = 0; i < SECTIONS.length; i++) {
        setExportProgress(`Exporting ${SECTIONS[i].title} (${i + 1}/${SECTIONS.length})...`);
        setActiveSectionIndex(i);
        await new Promise((r) => setTimeout(r, 220));

        if (cardRef.current) {
          const dataUrl = await toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#0c0c0e',
          });
          const link = document.createElement('a');
          link.download = `${eventName.replace(/\s+/g, '_')}_${SECTIONS[i].fileSuffix}_card.png`;
          link.href = dataUrl;
          link.click();
          await new Promise((r) => setTimeout(r, 450));
        }
      }
    } catch (err) {
      console.error('Failed to export all card pictures:', err);
    } finally {
      setActiveSectionIndex(initialIndex);
      setExportProgress(null);
      setIsExportingAll(false);
    }
  };

  // Copy current image to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current || isCopyingImage) return;
    setIsCopyingImage(true);

    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0c0c0e',
      });

      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        handleDownloadCurrent();
      }
    } catch (err) {
      console.error('Failed to copy card to clipboard:', err);
      handleDownloadCurrent();
    } finally {
      setIsCopyingImage(false);
    }
  };

  const renderFighterCell = (fighter: Fight['f1'], isChampFight?: boolean) => {
    if (!fighter.name) {
      return (
        <div className="flex-1 py-3 px-2 text-center text-xs text-neutral-500 font-bold uppercase">
          TBD
        </div>
      );
    }

    const isChampion = fighter.rank?.includes('Champion');
    const divColors = DIVISION_COLOR[fighter.division || ''] || { text: '#aaa', bg: '#222', border: '#444' };

    return (
      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        {fighter.image ? (
          <img
            src={fighter.image}
            alt={fighter.name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 border border-neutral-700 shadow-sm"
          />
        ) : (
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-sm text-neutral-300 flex-shrink-0 border border-neutral-700"
            style={{ background: '#222226' }}
          >
            {fighter.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1 text-left">
          <p
            className="text-xs sm:text-sm font-black uppercase text-white truncate leading-tight"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {fighter.name}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            {fighter.division && (
              <span
                className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded"
                style={{
                  color: divColors.text,
                  background: divColors.bg,
                  border: `1px solid ${divColors.border}`,
                  fontFamily: 'var(--font-condensed)',
                }}
              >
                {fighter.division}
              </span>
            )}
            <span className="text-[10px] text-neutral-400 font-medium">{fighter.record}</span>
            {fighter.rank && fighter.rank !== 'Unranked' && (
              <span
                className="text-[9px] font-bold"
                style={{
                  color: isChampion || isChampFight ? '#daa520' : '#a1a1aa',
                  fontFamily: 'var(--font-condensed)',
                }}
              >
                {fighter.rank}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setCardExportModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl max-h-[94vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-main)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="p-4 sm:p-5 flex items-center justify-between border-b flex-wrap gap-3"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white"
                style={{ background: '#e11d48', fontFamily: 'var(--font-condensed)' }}
              >
                Export
              </span>
              <h2
                className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-none"
                style={{
                  fontFamily: 'var(--font-condensed)',
                  color: 'var(--text-primary)',
                }}
              >
                Fight Card Pictures
              </h2>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              Picture {activeSectionIndex + 1} of 2: {currentSection.title} ({currentFights.length} fights)
            </p>
          </div>

          <button
            onClick={() => setCardExportModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            style={{
              background: 'var(--bg-main)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-card)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Carousel Navigation Bar */}
        <div
          className="px-4 py-2.5 sm:px-5 flex items-center justify-between gap-3 border-b"
          style={{
            background: 'var(--bg-card-hover)',
            borderColor: 'var(--border-card)',
          }}
        >
          <button
            onClick={handlePrev}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg transition-colors cursor-pointer border shadow-sm"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-card)',
            }}
            title="Previous picture (Left Arrow)"
          >
            ‹
          </button>

          {/* Section Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center flex-1">
            {SECTIONS.map((sec, idx) => {
              const count = sectionFightsMap[sec.id].length;
              const isActive = idx === activeSectionIndex;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  type="button"
                  className="px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  style={{
                    background: isActive ? '#e11d48' : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? '1px solid #be123c' : '1px solid var(--border-card)',
                    fontFamily: 'var(--font-condensed)',
                  }}
                >
                  <span>{sec.badgeLabel}</span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[10px] font-black"
                    style={{
                      background: isActive ? 'rgba(0,0,0,0.25)' : 'var(--bg-main)',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg transition-colors cursor-pointer border shadow-sm"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-card)',
            }}
            title="Next picture (Right Arrow)"
          >
            ›
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          className="px-4 py-2 sm:px-5 flex items-center justify-between flex-wrap gap-2 border-b"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadCurrent}
              disabled={isExportingCurrent || isExportingAll}
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              style={{
                background: '#e11d48',
                fontFamily: 'var(--font-condensed)',
              }}
            >
              {isExportingCurrent ? 'Generating...' : `Download ${currentSection.badgeLabel} (.PNG)`}
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={isExportingAll || isExportingCurrent}
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              style={{
                background: '#9f1239',
                fontFamily: 'var(--font-condensed)',
              }}
            >
              {isExportingAll ? exportProgress || 'Exporting Both...' : 'Download Both (2 Pictures)'}
            </button>

            <button
              onClick={handleCopyImage}
              disabled={isCopyingImage}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border"
              style={{
                background: 'var(--bg-main)',
                color: copiedImage ? '#22c55e' : 'var(--text-primary)',
                borderColor: copiedImage ? '#22c55e' : 'var(--border-card)',
                fontFamily: 'var(--font-condensed)',
              }}
            >
              {copiedImage ? 'Image Copied' : 'Copy Image'}
            </button>
          </div>

          <span
            className="text-[11px] font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            Picture {activeSectionIndex + 1} of 2
          </span>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/40 flex justify-center items-center">
          {/* THE CARD EXPORT CONTAINER */}
          <div
            ref={cardRef}
            className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: '#0c0c0e',
              border: '1px solid #27272a',
              color: '#ffffff',
            }}
          >
            {/* Header */}
            <div
              className="p-5 sm:p-6 border-b text-center relative overflow-hidden"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(225, 29, 72, 0.25), transparent 70%), #121215',
                borderColor: '#27272a',
              }}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                Official Fight Card
              </div>

              <h1
                className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white"
                style={{
                  fontFamily: 'var(--font-condensed)',
                  letterSpacing: '0.06em',
                  lineHeight: 1.1,
                }}
              >
                {eventName}
              </h1>

              {/* Section Banner */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <span
                  className="px-3 py-0.5 rounded text-xs font-black uppercase tracking-widest text-white"
                  style={{
                    background: '#e11d48',
                    fontFamily: 'var(--font-condensed)',
                  }}
                >
                  {currentSection.title}
                </span>
                <span
                  className="text-xs font-bold uppercase text-neutral-400"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  • {currentFights.length} {currentFights.length === 1 ? 'Bout' : 'Bouts'}
                </span>
              </div>
            </div>

            {/* Bouts List */}
            <div className="p-4 sm:p-5 flex flex-col gap-2.5 min-h-[160px] justify-center">
              {currentFights.length > 0 ? (
                currentFights.map(({ slot, fight }) => {
                  const isTitle = fight.isTitleFight;

                  return (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl border flex flex-col gap-2 transition-colors"
                      style={{
                        background: '#151518',
                        borderColor: isTitle
                          ? fight.titleType === 'bmf'
                            ? '#71717a'
                            : '#daa520'
                          : '#27272a',
                      }}
                    >
                      {/* Bout Title / Stakes Header */}
                      <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider text-neutral-400"
                          style={{ fontFamily: 'var(--font-condensed)' }}
                        >
                          {slot.label}
                        </span>

                        {isTitle && (
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                            style={
                              fight.titleType === 'bmf'
                                ? {
                                    background: 'linear-gradient(90deg, #27272a, #3f3f46)',
                                    color: '#f4f4f5',
                                    border: '1px solid #71717a',
                                    fontFamily: 'var(--font-condensed)',
                                  }
                                : fight.titleType === 'interim'
                                ? {
                                    background: 'linear-gradient(90deg, rgba(107, 114, 128, 0.4), rgba(218, 165, 32, 0.4))',
                                    color: '#ffffff',
                                    border: '1px solid #daa520',
                                    fontFamily: 'var(--font-condensed)',
                                  }
                                : {
                                    background: 'rgba(218, 165, 32, 0.2)',
                                    color: '#daa520',
                                    border: '1px solid #daa520',
                                    fontFamily: 'var(--font-condensed)',
                                  }
                            }
                          >
                            {fight.titleType === 'bmf'
                              ? 'BMF Title'
                              : fight.titleType === 'interim'
                              ? 'Interim Title'
                              : 'Undisputed Title'}
                          </span>
                        )}
                      </div>

                      {/* Fighters Matchup Row */}
                      <div className="flex items-center justify-between gap-2">
                        {renderFighterCell(fight.f1, isTitle)}

                        <div className="flex-shrink-0 flex items-center justify-center">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/30"
                            style={{ fontFamily: 'var(--font-condensed)' }}
                          >
                            VS
                          </span>
                        </div>

                        {renderFighterCell(fight.f2, isTitle)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-neutral-400">
                  <p
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    No bouts scheduled for {currentSection.title}
                  </p>
                  <p className="text-xs mt-1 text-neutral-500">
                    Add fighters to this card on the main board to see them here.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-3.5 border-t text-center flex items-center justify-between text-[11px] text-neutral-500 uppercase tracking-widest font-bold"
              style={{
                background: '#101013',
                borderColor: '#27272a',
                fontFamily: 'var(--font-condensed)',
              }}
            >
              <span>UFC Card Maker</span>
              <span>{currentSection.badgeLabel} • Picture {activeSectionIndex + 1} of 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
