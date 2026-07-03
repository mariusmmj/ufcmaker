import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DIVISION_COLOR } from "../constants";
import { DivisionBadge } from "./DivisionBadge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
const FighterCell = ({ fighter, isMain, onClick, onClear }) => {
    // Always left align the text to make better use of space, and put X on the right.
    const align = "items-start text-left";
    const clearPos = "right-3";
    if (!fighter.name) {
        return (_jsx("div", { onClick: onClick, className: `flex-1 flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all group`, style: {
                minHeight: isMain ? 64 : 52,
                border: "1.5px dashed var(--border-main)",
                background: "var(--bg-card-empty)",
            }, onMouseEnter: (e) => {
                e.currentTarget.style.borderColor = "var(--accent-color)";
                e.currentTarget.style.background = "var(--accent-bg)";
            }, onMouseLeave: (e) => {
                e.currentTarget.style.borderColor = "var(--border-main)";
                e.currentTarget.style.background = "var(--bg-card-empty)";
            }, children: _jsx("span", { className: "transition-colors", style: {
                    fontFamily: "var(--font-condensed)",
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    color: "var(--text-muted)",
                }, children: "+ LEGG TIL FIGHTER" }) }));
    }
    const metaDir = "flex-row";
    return (_jsxs("div", { onClick: onClick, className: `flex-1 flex flex-col justify-center ${align} px-4 rounded-xl cursor-pointer transition-all relative group overflow-hidden`, style: {
            minHeight: isMain ? 64 : 52,
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
        }, onMouseEnter: (e) => (e.currentTarget.style.background = "var(--bg-card-hover)"), onMouseLeave: (e) => (e.currentTarget.style.background = "var(--bg-card)"), children: [_jsx("button", { className: `absolute ${clearPos} opacity-50 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center`, onClick: (e) => { e.stopPropagation(); onClear(); }, title: "Fjern fighter", style: {
                    background: "#ef4444",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    lineHeight: 1,
                    borderRadius: "50%",
                    fontFamily: "var(--font-condensed)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    top: "50%",
                    transform: "translateY(-50%)"
                }, onMouseEnter: (e) => (e.currentTarget.style.background = "#dc2626"), onMouseLeave: (e) => (e.currentTarget.style.background = "#ef4444"), children: "\u2715" }), _jsx("div", { className: "relative z-10 flex items-center gap-2", children: _jsx("p", { style: {
                        fontFamily: "var(--font-condensed)",
                        fontWeight: 900,
                        fontSize: isMain ? 16 : 14,
                        letterSpacing: "0.05em",
                        color: "var(--text-primary)",
                        lineHeight: 1.1,
                        marginBottom: 4,
                        textTransform: "uppercase",
                    }, children: fighter.name }) }), _jsxs("div", { className: `flex ${metaDir} items-center gap-2 flex-wrap relative z-10 pr-8`, children: [_jsx(DivisionBadge, { division: fighter.division }), _jsx("span", { style: { fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }, children: fighter.record }), fighter.rank && fighter.rank !== "Unranked" && (_jsx("span", { style: { fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", fontStyle: "italic" }, children: fighter.rank }))] })] }));
};
export const FightRow = ({ fightId, slot, fight, isMain, noRestrictions, onPick, onClear, onToggleTitle, disableDrag }) => {
    const { f1, f2, lockedDiv, isTitleFight } = fight;
    const mismatch = !noRestrictions && !!f1.division && !!f2.division && f1.division !== f2.division;
    const divColors = lockedDiv ? DIVISION_COLOR[lockedDiv] : null;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: fightId });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: mismatch ? "1px solid var(--border-mismatch)" : "1px solid var(--border-card)",
        background: mismatch ? "var(--bg-mismatch)" : "var(--bg-main)",
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        position: "relative",
    };
    return (_jsxs("div", { ref: disableDrag ? undefined : setNodeRef, style: style, className: "rounded-2xl mb-2 overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 pt-2 pb-1.5", children: [!disableDrag && (_jsx("div", { ...attributes, ...listeners, className: "cursor-grab text-stone-400 hover:text-stone-600 px-1", title: "Dra for \u00E5 flytte", children: "\u22EE\u22EE" })), (isMain && slot.id === "m1") || isTitleFight ? (_jsx("span", { style: { fontSize: 13 }, children: "\uD83C\uDFC6" })) : null, _jsx("span", { style: {
                            fontFamily: "var(--font-condensed)",
                            fontWeight: 800,
                            fontSize: 9,
                            letterSpacing: "0.15em",
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                        }, children: slot.label }), lockedDiv && !noRestrictions && (_jsx("span", { className: "ml-1", style: {
                            fontFamily: "var(--font-condensed)",
                            fontWeight: 800,
                            fontSize: 8,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: divColors?.text,
                            background: divColors?.bg,
                            border: `1px solid ${divColors?.border}`,
                            padding: "1px 5px",
                            borderRadius: 3,
                        }, children: lockedDiv })), (f1.name || f2.name) && (_jsx("button", { onClick: () => onToggleTitle?.(fightId), className: "ml-2 px-2 py-0.5 rounded border text-[10px] transition-colors", style: {
                            fontFamily: "var(--font-condensed)",
                            background: "var(--bg-card)",
                            color: isTitleFight ? "var(--accent-color)" : "var(--text-muted)",
                            borderColor: isTitleFight ? "var(--accent-color)" : "var(--border-card)"
                        }, children: isTitleFight ? "TITTELKAMP (5 RUNDER)" : "Gjør til tittelkamp" })), mismatch && (_jsx("span", { className: "ml-auto", style: { fontFamily: "var(--font-body)", fontSize: 9, color: "#d97706", fontStyle: "italic" }, children: "\u26A0 divisjon mismatch" }))] }), _jsxs("div", { className: "flex items-stretch gap-2 px-2 pb-2", children: [_jsx(FighterCell, { fighter: f1, isMain: isMain, onClick: () => onPick(fightId, "f1"), onClear: () => onClear(fightId, "f1") }), _jsx("div", { className: "flex-shrink-0 flex items-center justify-center", style: { width: 36 }, children: _jsx("span", { style: {
                                fontFamily: "var(--font-condensed)",
                                fontWeight: 900,
                                fontSize: 11,
                                letterSpacing: "0.2em",
                                color: divColors?.text ?? "var(--text-muted)",
                            }, children: "VS" }) }), _jsx(FighterCell, { fighter: f2, isMain: isMain, onClick: () => onPick(fightId, "f2"), onClear: () => onClear(fightId, "f2") })] })] }));
};
