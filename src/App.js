import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { FIGHT_SLOTS, emptyFighter, initFights } from "./constants";
import { FightRow } from "./components/FightRow";
import { FighterModal } from "./components/FighterModal";
import { CardStats } from "./components/CardStats";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, } from "@dnd-kit/sortable";
// ── Section divider ────────────────────────────────────────────────────────
function SectionDivider({ label }) {
    return (_jsxs("div", { className: "flex items-center gap-3 my-5", children: [_jsx("div", { className: "flex-1 h-px", style: { background: "var(--border-main)" } }), _jsx("span", { style: {
                    fontFamily: "var(--font-condensed)",
                    fontWeight: 900,
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    color: "var(--accent-color)",
                    textTransform: "uppercase",
                }, children: label }), _jsx("div", { className: "flex-1 h-px", style: { background: "var(--border-main)" } })] }));
}
// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
    const [fights, setFights] = useState(initFights);
    const [slots, setSlots] = useState(FIGHT_SLOTS);
    const [noRestrictions, setNoRestrictions] = useState(false);
    const [modal, setModal] = useState(null);
    const [eventName, setEventName] = useState("UFC 000");
    const [editingName, setEditingName] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const nameRef = useRef(null);
    // Focus input when editing name
    useEffect(() => { if (editingName)
        nameRef.current?.focus(); }, [editingName]);
    // Apply dark mode
    useEffect(() => {
        document.body.className = isDark ? 'dark' : '';
    }, [isDark]);
    // Drag and Drop sensors
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSlots((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };
    const openPick = (fightId, slot) => setModal({ fightId, slot });
    const handleSelect = useCallback((fighter) => {
        if (!modal)
            return;
        const { fightId, slot } = modal;
        setFights((prev) => {
            const fight = { ...prev[fightId], f1: { ...prev[fightId].f1 }, f2: { ...prev[fightId].f2 } };
            fight[slot] = {
                name: fighter.name,
                division: fighter.division,
                record: fighter.record,
                rank: fighter.rank ?? ""
            };
            if (!noRestrictions) {
                const other = slot === "f1" ? fight.f2 : fight.f1;
                if (!other.name)
                    fight.lockedDiv = fighter.division;
            }
            return { ...prev, [fightId]: fight };
        });
        setModal(null);
    }, [modal, noRestrictions]);
    const handleClear = (fightId, slot) => {
        setFights((prev) => {
            const fight = { ...prev[fightId], f1: { ...prev[fightId].f1 }, f2: { ...prev[fightId].f2 } };
            fight[slot] = emptyFighter();
            if (!fight.f1.name && !fight.f2.name)
                fight.lockedDiv = null;
            return { ...prev, [fightId]: fight };
        });
    };
    const toggleTitleFight = (fightId) => {
        setFights((prev) => {
            const fight = { ...prev[fightId] };
            fight.isTitleFight = !fight.isTitleFight;
            fight.rounds = fight.isTitleFight ? 5 : 3;
            return { ...prev, [fightId]: fight };
        });
    };
    const getLockedDiv = (fightId) => noRestrictions ? null : (fights[fightId]?.lockedDiv ?? null);
    const mainSlots = slots.filter((s) => s.section === "main");
    const prelimSlots = slots.filter((s) => s.section === "prelim");
    // Exclude m1 and m2 from sortable context so they cannot be dragged
    const sortableMainSlots = mainSlots.filter(s => s.id !== "m1" && s.id !== "m2");
    // Get list of already selected fighters to prevent duplicates
    const selectedFighterNames = Object.values(fights)
        .flatMap(f => [f.f1.name, f.f2.name])
        .filter(Boolean);
    return (_jsxs("div", { className: "min-h-screen", children: [_jsxs("header", { className: "sticky top-0 z-10 flex flex-wrap items-center gap-3 px-6 py-3", style: {
                    background: "var(--bg-header)",
                    borderBottom: "1px solid var(--border-main)",
                    boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
                }, children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center", style: {
                            background: "var(--accent-color)",
                            color: "#fff",
                            fontFamily: "var(--font-condensed)",
                            fontWeight: 900,
                            fontSize: 17,
                            letterSpacing: "0.15em",
                            padding: "3px 12px 3px 10px",
                            clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)",
                        }, children: "UFC" }), editingName ? (_jsx("input", { ref: nameRef, value: eventName, onChange: (e) => setEventName(e.target.value), onBlur: () => setEditingName(false), onKeyDown: (e) => e.key === "Enter" && setEditingName(false), className: "outline-none", style: {
                            fontFamily: "var(--font-condensed)",
                            fontWeight: 900,
                            fontSize: 20,
                            letterSpacing: "0.08em",
                            color: "var(--text-primary)",
                            textTransform: "uppercase",
                            background: "transparent",
                            border: "none",
                            borderBottom: "1.5px solid var(--accent-color)",
                            width: 200,
                            padding: "0 0 1px",
                        } })) : (_jsxs("button", { onClick: () => setEditingName(true), className: "flex items-center gap-2 group", style: { background: "none", border: "none", cursor: "pointer", padding: 0 }, children: [_jsx("span", { style: {
                                    fontFamily: "var(--font-condensed)",
                                    fontWeight: 900,
                                    fontSize: 20,
                                    letterSpacing: "0.08em",
                                    color: "var(--text-primary)",
                                    textTransform: "uppercase",
                                }, children: eventName }), _jsx("span", { className: "text-stone-300 group-hover:text-stone-500 transition-colors text-xs", children: "\u270F" })] })), _jsx("span", { className: "hidden sm:block mr-auto", style: {
                            fontFamily: "var(--font-condensed)",
                            fontWeight: 700,
                            fontSize: 9,
                            letterSpacing: "0.3em",
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                        }, children: "CUSTOM CARD MAKER" }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("button", { onClick: () => setIsDark(!isDark), className: "text-sm px-2 py-1 rounded transition-colors", style: { background: "var(--bg-main)", color: "var(--text-primary)", border: "1px solid var(--border-main)" }, children: isDark ? "☀️ Light" : "🌙 Dark" }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "hidden md:block text-right", style: {
                                    fontFamily: "var(--font-condensed)",
                                    fontWeight: 700,
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    color: noRestrictions ? "var(--accent-color)" : "var(--text-secondary)",
                                    textTransform: "uppercase",
                                    lineHeight: 1.3,
                                    transition: "color 0.2s",
                                }, children: ["Ingen vektklasse-", _jsx("br", {}), "restriksjoner"] }), _jsx("button", { onClick: () => setNoRestrictions((v) => !v), className: "relative flex-shrink-0 rounded-full transition-all duration-200", style: {
                                    width: 44,
                                    height: 24,
                                    background: noRestrictions ? "var(--accent-color)" : "var(--border-main)",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                }, "aria-label": "Toggle vektklasse-restriksjoner", children: _jsx("div", { className: "absolute top-0.5 rounded-full bg-white transition-all duration-200", style: {
                                        width: 20,
                                        height: 20,
                                        left: noRestrictions ? 22 : 2,
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                                    } }) })] })] }), _jsxs("main", { className: "max-w-3xl mx-auto px-4 pb-16", children: [_jsx(CardStats, { fights: fights }), _jsxs(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: [_jsx(SectionDivider, { label: "Main Card" }), mainSlots.filter(s => s.id === "m1" || s.id === "m2").map(slot => (_jsx(FightRow, { fightId: slot.id, slot: slot, fight: fights[slot.id], isMain: true, noRestrictions: noRestrictions, onPick: openPick, onClear: handleClear, onToggleTitle: toggleTitleFight, disableDrag: true }, slot.id))), _jsx(SortableContext, { items: sortableMainSlots, strategy: verticalListSortingStrategy, children: sortableMainSlots.map((slot) => (_jsx(FightRow, { fightId: slot.id, slot: slot, fight: fights[slot.id], isMain: true, noRestrictions: noRestrictions, onPick: openPick, onClear: handleClear, onToggleTitle: toggleTitleFight }, slot.id))) }), _jsx(SectionDivider, { label: "Prelims" }), _jsx(SortableContext, { items: prelimSlots, strategy: verticalListSortingStrategy, children: prelimSlots.map((slot) => (_jsx(FightRow, { fightId: slot.id, slot: slot, fight: fights[slot.id], isMain: false, noRestrictions: noRestrictions, onPick: openPick, onClear: handleClear, onToggleTitle: toggleTitleFight }, slot.id))) })] })] }), modal && (_jsx(FighterModal, { lockedDiv: getLockedDiv(modal.fightId), noRestrictions: noRestrictions, onSelect: handleSelect, onClose: () => setModal(null), selectedFighters: selectedFighterNames }))] }));
}
