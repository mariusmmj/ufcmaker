import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { toPng, toBlob } from 'html-to-image';
import { FightPick, FightSlot } from '../types';

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

export const PickemSlipModal: React.FC = () => {
  const { eventName, fights, slots, picks, setPickemSlipModalOpen } = useStore();
  const slipRef = useRef<HTMLDivElement>(null);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isExportingCurrent, setIsExportingCurrent] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
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

  const getPickInfo = useCallback(
    (slotId: string) => {
      const fight = fights[slotId];
      const rawPick = picks[slotId];
      const pick: FightPick | null =
        typeof rawPick === 'string' ? { winner: rawPick } : rawPick || null;

      if (!pick?.winner || !fight) return null;
      const winner = pick.winner === 'f1' ? fight.f1 : pick.winner === 'f2' ? fight.f2 : null;
      const opponent = pick.winner === 'f1' ? fight.f2 : pick.winner === 'f2' ? fight.f1 : null;

      if (!winner?.name) return null;

      return {
        winner,
        opponent,
        method: pick.method,
        round: pick.round,
      };
    },
    [fights, picks]
  );

  // Only keep bouts where picks were made
  const getPicksForSection = useCallback(
    (sectionId: 'main' | 'prelims') => {
      const sectionSlots = getSectionSlots(sectionId);
      return sectionSlots
        .map((slot) => {
          const fight = fights[slot.id];
          const info = getPickInfo(slot.id);
          return { slot, fight, info };
        })
        .filter((item) => !!item.info);
    },
    [fights, getPickInfo, getSectionSlots]
  );

  const mainPicks = getPicksForSection('main');
  const prelimPicks = getPicksForSection('prelims');

  const sectionPicksMap = {
    main: mainPicks,
    prelims: prelimPicks,
  };

  const currentSection = SECTIONS[activeSectionIndex];
  const currentPicks = sectionPicksMap[currentSection.id];

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
    if (!slipRef.current || isExportingCurrent || isExportingAll) return;
    setIsExportingCurrent(true);

    try {
      const dataUrl = await toPng(slipRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0c0c0e',
      });
      const link = document.createElement('a');
      link.download = `${eventName.replace(/\s+/g, '_')}_${currentSection.fileSuffix}_picks.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export prediction slip image:', err);
    } finally {
      setIsExportingCurrent(false);
    }
  };

  // Download all 3 pictures sequentially
  const handleDownloadAll = async () => {
    if (!slipRef.current || isExportingAll || isExportingCurrent) return;
    setIsExportingAll(true);
    const initialIndex = activeSectionIndex;

    try {
      for (let i = 0; i < SECTIONS.length; i++) {
        setExportProgress(`Exporting ${SECTIONS[i].title} (${i + 1}/${SECTIONS.length})...`);
        setActiveSectionIndex(i);
        // Wait for React to re-render the slip DOM
        await new Promise((r) => setTimeout(r, 220));

        if (slipRef.current) {
          const dataUrl = await toPng(slipRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#0c0c0e',
          });
          const link = document.createElement('a');
          link.download = `${eventName.replace(/\s+/g, '_')}_${SECTIONS[i].fileSuffix}_picks.png`;
          link.href = dataUrl;
          link.click();
          // Small pause between file downloads so the browser doesn't throttle
          await new Promise((r) => setTimeout(r, 450));
        }
      }
    } catch (err) {
      console.error('Failed to export all pictures:', err);
    } finally {
      setActiveSectionIndex(initialIndex);
      setExportProgress(null);
      setIsExportingAll(false);
    }
  };

  // Copy current image to clipboard
  const handleCopyImage = async () => {
    if (!slipRef.current || isCopyingImage) return;
    setIsCopyingImage(true);

    try {
      const blob = await toBlob(slipRef.current, {
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
      console.error('Failed to copy prediction slip to clipboard:', err);
      handleDownloadCurrent();
    } finally {
      setIsCopyingImage(false);
    }
  };

  // Copy clean text summary
  const handleCopyText = () => {
    const lines: string[] = [];
    lines.push(`${eventName.toUpperCase()} - PREDICTIONS`);
    lines.push('='.repeat(40));

    SECTIONS.forEach((sec) => {
      const picksList = sectionPicksMap[sec.id];
      if (picksList.length > 0) {
        lines.push(`\n${sec.title.toUpperCase()}:`);
        picksList.forEach(({ fight, info }) => {
          if (!info || !fight) return;
          const titleBadge = fight.isTitleFight
            ? ` [${fight.titleType?.toUpperCase() || 'TITLE'} BOUT]`
            : '';
          const detail = [
            info.method,
            info.round && info.round !== 'DEC' ? info.round : null,
          ]
            .filter(Boolean)
            .join(' ');
          const methodStr = detail ? ` (${detail})` : '';
          lines.push(`• ${info.winner.name} def. ${info.opponent?.name || 'Opponent'}${methodStr}${titleBadge}`);
        });
      }
    });

    lines.push('\nGenerated with UFC Card Maker');
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setPickemSlipModalOpen(false)}
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
                style={{ background: '#22c55e', fontFamily: 'var(--font-condensed)' }}
              >
                Pick'em
              </span>
              <h2
                className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-none"
                style={{
                  fontFamily: 'var(--font-condensed)',
                  color: 'var(--text-primary)',
                }}
              >
                Prediction Slip
              </h2>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              Picture {activeSectionIndex + 1} of 2: {currentSection.title} ({currentPicks.length} picks)
            </p>
          </div>

          <button
            onClick={() => setPickemSlipModalOpen(false)}
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
          {/* Arrow Left */}
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
              const count = sectionPicksMap[sec.id].length;
              const isActive = idx === activeSectionIndex;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  type="button"
                  className="px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  style={{
                    background: isActive ? '#22c55e' : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? '1px solid #16a34a' : '1px solid var(--border-card)',
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

          {/* Arrow Right */}
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
                background: '#22c55e',
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
                background: '#15803d',
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

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border"
              style={{
                background: 'var(--bg-main)',
                color: copiedText ? '#22c55e' : 'var(--text-primary)',
                borderColor: copiedText ? '#22c55e' : 'var(--border-card)',
                fontFamily: 'var(--font-condensed)',
              }}
            >
              {copiedText ? 'Text Copied' : 'Copy Text'}
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
          {/* THE PREDICTION SLIP EXPORT CONTAINER */}
          <div
            ref={slipRef}
            className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: '#0c0c0e',
              border: '1px solid #27272a',
              color: '#ffffff',
            }}
          >
            {/* Slip Header */}
            <div
              className="p-5 sm:p-6 border-b text-center relative overflow-hidden"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(225, 29, 72, 0.22), transparent 70%), #121215',
                borderColor: '#27272a',
              }}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                UFC Prediction Slip
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

              {/* Current Section Banner */}
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
                  • {currentPicks.length} {currentPicks.length === 1 ? 'Pick' : 'Picks'}
                </span>
              </div>
            </div>

            {/* Slip Content: ONLY PICKS MADE */}
            <div className="p-4 sm:p-5 flex flex-col gap-2.5 min-h-[160px] justify-center">
              {currentPicks.length > 0 ? (
                currentPicks.map(({ slot, fight, info }) => {
                  if (!info || !fight) return null;
                  const isTitle = fight.isTitleFight;

                  return (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors"
                      style={{
                        background: 'rgba(34, 197, 94, 0.06)',
                        borderColor: isTitle
                          ? 'rgba(218, 165, 32, 0.45)'
                          : 'rgba(34, 197, 94, 0.35)',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {info.winner.image ? (
                          <img
                            src={info.winner.image}
                            alt={info.winner.name}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 border border-neutral-700 shadow-sm"
                          />
                        ) : (
                          <div
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-sm text-neutral-300 flex-shrink-0 border border-neutral-700"
                            style={{ background: '#222226' }}
                          >
                            {info.winner.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider block"
                            style={{
                              fontFamily: 'var(--font-condensed)',
                              color: isTitle ? '#daa520' : '#a1a1aa',
                            }}
                          >
                            {isTitle
                              ? fight.titleType === 'bmf'
                                ? 'BMF Title Fight • 5 Rounds'
                                : fight.titleType === 'interim'
                                ? 'Interim Title Fight • 5 Rounds'
                                : 'Undisputed Title Fight • 5 Rounds'
                              : slot.label}
                          </span>

                          <div className="leading-tight mt-0.5">
                            <span
                              className="text-sm sm:text-base font-black uppercase text-white truncate block"
                              style={{ fontFamily: 'var(--font-condensed)' }}
                            >
                              {info.winner.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-medium">
                              def. {info.opponent?.name || 'Opponent'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Prediction Badge */}
                      <div className="flex-shrink-0 flex flex-col items-end">
                        <span
                          className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-sm"
                          style={{
                            background: '#22c55e',
                            fontFamily: 'var(--font-condensed)',
                          }}
                        >
                          Pick
                        </span>
                        {(info.method || info.round) && (
                          <span
                            className="text-[10px] font-bold uppercase text-green-400 mt-1"
                            style={{ fontFamily: 'var(--font-condensed)' }}
                          >
                            {[
                              info.method,
                              info.round && info.round !== 'DEC' ? info.round : null,
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        )}
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
                    No predictions made for {currentSection.title}
                  </p>
                  <p className="text-xs mt-1 text-neutral-500">
                    Use arrow buttons to view other sections, or click fighters to make picks.
                  </p>
                </div>
              )}
            </div>

            {/* Slip Footer */}
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
