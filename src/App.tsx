import { useEffect, useRef, useState } from 'react';
import { FighterSlotKey } from './types';
import { FightRow } from './components/FightRow';
import { FighterModal } from './components/FighterModal';
import { CardStats } from './components/CardStats';
import { useStore } from './store/useStore';
import { encodeStateToUrl } from './utils/storage';
import { toPng } from 'html-to-image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// ── Section divider ────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div
        className="flex-1 h-px"
        style={{ background: 'var(--border-main)' }}
      />
      <span
        style={{
          fontFamily: 'var(--font-condensed)',
          fontWeight: 900,
          fontSize: 10,
          letterSpacing: '0.25em',
          color: 'var(--accent-color)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: 'var(--border-main)' }}
      />
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    fights,
    slots,
    noRestrictions,
    modal,
    eventName,
    isDark,
    setEventName,
    setIsDark,
    setNoRestrictions,
    setModal,
    handleDragEnd,
    handleSelect,
    handleClear,
    toggleTitleFight,
    surpriseMe,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const nameRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const handleShare = () => {
    encodeStateToUrl({ fights, eventName, noRestrictions, slots });
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    if (mainRef.current === null) return;
    const node = mainRef.current;
    const exportWidth = 800;
    toPng(node, { 
      cacheBust: true, 
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      width: exportWidth,
      height: node.scrollHeight,
      style: { 
        margin: '0',
        width: `${exportWidth}px`,
        minWidth: `${exportWidth}px`,
        maxWidth: `${exportWidth}px`
      }
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${eventName.replace(/\s+/g, '_')}_card.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Oops, something went wrong with the export!', err);
      });
  };

  // Focus input when editing name
  useEffect(() => {
    if (editingName) nameRef.current?.focus();
  }, [editingName]);

  // Apply dark mode
  useEffect(() => {
    document.body.className = isDark ? 'dark' : '';
  }, [isDark]);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const openPick = (fightId: string, slot: FighterSlotKey) =>
    setModal({ fightId, slot });

  const getLockedDiv = (fightId: string) =>
    noRestrictions ? null : (fights[fightId]?.lockedDiv ?? null);

  const mainSlots = slots.filter((s) => s.section === 'main');
  const prelimSlots = slots.filter((s) => s.section === 'prelim');

  // Exclude m1 and m2 from sortable context so they cannot be dragged
  const sortableMainSlots = mainSlots.filter(
    (s) => s.id !== 'm1' && s.id !== 'm2'
  );

  // Get list of already selected fighters to prevent duplicates
  const selectedFighterNames = Object.values(fights)
    .flatMap((f) => [f.f1.name, f.f2.name])
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen">
      {/* ── Top bar ─────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-6 py-3"
        style={{
          background: 'var(--bg-header)',
          borderBottom: '1px solid var(--border-main)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* UFC Logo */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'var(--accent-color)',
            color: '#fff',
            fontFamily: 'var(--font-condensed)',
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: '0.15em',
            padding: '3px 12px 3px 10px',
            clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
          }}
        >
          UFC
        </div>

        {/* Event name */}
        {editingName ? (
          <input
            ref={nameRef}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="outline-none"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              background: 'transparent',
              border: 'none',
              borderBottom: '1.5px solid var(--accent-color)',
              width: 200,
              padding: '0 0 1px',
            }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-2 group"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
              }}
            >
              {eventName}
            </span>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-xs">
              ✏
            </span>
          </button>
        )}

        <span
          className="hidden sm:block mr-auto"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          CUSTOM CARD MAKER
        </span>

        {/* Templates and Theme Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={surpriseMe}
            className="text-sm px-3 py-1 rounded transition-colors font-bold"
            style={{
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-main)',
            }}
          >
            Random Card
          </button>
          <button
            onClick={handleExport}
            className="text-sm px-3 py-1 rounded transition-colors font-bold"
            style={{
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-main)',
            }}
          >
            Image Export
          </button>
          <button
            onClick={handleShare}
            className="text-sm px-3 py-1 rounded transition-colors font-bold relative"
            style={{
              background: 'var(--accent-color)',
              color: '#fff',
              border: '1px solid var(--accent-color)',
            }}
          >
            {copied ? 'Copied!' : 'Share Link'}
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="text-sm px-2 py-1 rounded transition-colors"
            style={{
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-main)',
            }}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* No-restrictions toggle */}
        <div className="flex items-center gap-3">
          <span
            className="hidden md:block text-right"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.1em',
              color: noRestrictions
                ? 'var(--accent-color)'
                : 'var(--text-secondary)',
              textTransform: 'uppercase',
              lineHeight: 1.3,
              transition: 'color 0.2s',
            }}
          >
            No Weight Class -
            <br />
            Restrictions
          </span>
          <button
            onClick={() => setNoRestrictions(!noRestrictions)}
            className="relative flex-shrink-0 rounded-full transition-all duration-200"
            style={{
              width: 44,
              height: 24,
              background: noRestrictions
                ? 'var(--accent-color)'
                : 'var(--border-main)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Toggle weight class restrictions"
          >
            <div
              className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
              style={{
                width: 20,
                height: 20,
                left: noRestrictions ? 22 : 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────── */}
      <main ref={mainRef} className="max-w-3xl mx-auto px-4 pb-16 pt-4">
        <CardStats fights={fights} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SectionDivider label="Main Card" />

          {/* Static rendering of m1 and m2 so they cannot be sorted/dragged */}
          {mainSlots
            .filter((s) => s.id === 'm1' || s.id === 'm2')
            .map((slot) => (
              <FightRow
                key={slot.id}
                fightId={slot.id}
                slot={slot}
                fight={fights[slot.id]}
                isMain={true}
                noRestrictions={noRestrictions}
                onPick={openPick}
                onClear={handleClear}
                onToggleTitle={toggleTitleFight}
                disableDrag={true}
              />
            ))}

          <SortableContext
            items={sortableMainSlots}
            strategy={verticalListSortingStrategy}
          >
            {sortableMainSlots.map((slot) => (
              <FightRow
                key={slot.id}
                fightId={slot.id}
                slot={slot}
                fight={fights[slot.id]}
                isMain={true}
                noRestrictions={noRestrictions}
                onPick={openPick}
                onClear={handleClear}
                onToggleTitle={toggleTitleFight}
              />
            ))}
          </SortableContext>

          <SectionDivider label="Prelims" />
          <SortableContext
            items={prelimSlots}
            strategy={verticalListSortingStrategy}
          >
            {prelimSlots.map((slot) => (
              <FightRow
                key={slot.id}
                fightId={slot.id}
                slot={slot}
                fight={fights[slot.id]}
                isMain={false}
                noRestrictions={noRestrictions}
                onPick={openPick}
                onClear={handleClear}
                onToggleTitle={toggleTitleFight}
              />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      {/* ── Modal ────────────────────────────────── */}
      {modal && (
        <FighterModal
          fightId={modal.fightId}
          lockedDiv={getLockedDiv(modal.fightId)}
          noRestrictions={noRestrictions}
          onSelect={handleSelect}
          onClose={() => setModal(null)}
          selectedFighters={selectedFighterNames}
        />
      )}
    </div>
  );
}
