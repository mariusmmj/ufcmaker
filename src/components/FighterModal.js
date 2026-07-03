import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { DIVISION_COLOR } from "../constants";
import { DivisionBadge } from "./DivisionBadge";
import allFighters from "../data/fighters.json";
const FIGHTERS = allFighters;
function getRankNum(rank) {
    if (!rank || rank === "Unranked")
        return 999;
    if (rank === "Champion" || rank === "C")
        return 0;
    const num = parseInt(rank.replace("#", ""), 10);
    return isNaN(num) ? 999 : num;
}
function search(query, lockedDiv, selectedFighters = [], fightId) {
    const isMainEvent = fightId === "m1" || fightId === "m2";
    const q = query.toLowerCase().trim();
    return FIGHTERS.filter((f) => {
        if (selectedFighters.includes(f.name))
            return false;
        const rNum = getRankNum(f.rank);
        if (isMainEvent) {
            // Main/Co-main: ONLY top 5 or champion
            if (rNum > 5)
                return false;
        }
        else {
            // Prelims/others: NO champions allowed
            if (rNum === 0)
                return false;
        }
        const matchName = !q || f.name.toLowerCase().includes(q);
        const matchDiv = !q || (f.division?.toLowerCase().includes(q) ?? false);
        const matchQuery = matchName || matchDiv;
        const matchLocked = !lockedDiv || f.division === lockedDiv;
        return matchQuery && matchLocked;
    }).slice(0, 8);
}
export const FighterModal = ({ fightId, lockedDiv, noRestrictions, onSelect, onClose, selectedFighters = [] }) => {
    const effectiveLock = noRestrictions ? null : lockedDiv;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(() => search("", effectiveLock, selectedFighters, fightId));
    const inputRef = useRef(null);
    // Custom fighter form state
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customDiv, setCustomDiv] = useState(effectiveLock || "Lightweight");
    const [customRecord, setCustomRecord] = useState("0-0-0");
    const [customRank, setCustomRank] = useState("");
    useEffect(() => { inputRef.current?.focus(); }, []);
    const handleChange = (val) => {
        setQuery(val);
        setResults(search(val, effectiveLock, selectedFighters, fightId));
    };
    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customName.trim())
            return;
        const rankVal = customRank.trim() || "Unranked";
        const rNum = getRankNum(rankVal);
        const isMainEvent = fightId === "m1" || fightId === "m2";
        if (isMainEvent && rNum > 5) {
            alert("Bare Champions og Top 5 fighters kan være i Main Event og Co-Main Event!");
            return;
        }
        if (!isMainEvent && rNum === 0) {
            alert("Champions kan bare være i Main Event og Co-Main Event!");
            return;
        }
        onSelect({
            name: customName.trim(),
            division: customDiv,
            record: customRecord.trim() || "0-0-0",
            rank: rankVal
        });
    };
    const initials = (name) => name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }, onClick: onClose, children: _jsxs("div", { className: "fade-up flex flex-col overflow-hidden", style: {
                width: "min(480px, 96vw)",
                maxHeight: "78vh",
                background: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: 12,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3.5", style: { borderBottom: "1px solid var(--border-card)" }, children: [_jsx("span", { className: "flex-1 tracking-widest", style: { fontFamily: "var(--font-condensed)", fontWeight: 900, fontSize: 14, color: "var(--text-primary)" }, children: showCustomForm ? "NY FIGHTER" : "VELG FIGHTER" }), effectiveLock && !showCustomForm && _jsx(DivisionBadge, { division: effectiveLock, size: "md" }), noRestrictions && !showCustomForm && (_jsx("span", { className: "text-[9px] px-2 py-0.5 rounded-sm tracking-widest", style: { fontWeight: 800, border: "1px solid var(--border-main)", color: "var(--text-secondary)", background: "var(--bg-main)" }, children: "ALLE DIVISJONER" })), _jsx("button", { onClick: onClose, className: "transition-colors ml-1 rounded p-0.5", style: { fontSize: 15, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }, onMouseEnter: e => e.currentTarget.style.color = "var(--text-primary)", onMouseLeave: e => e.currentTarget.style.color = "var(--text-muted)", children: "\u2715" })] }), showCustomForm ? (
                /* ── Custom Fighter Form ────────────────── */
                _jsxs("form", { onSubmit: handleCustomSubmit, className: "flex-1 overflow-y-auto p-4 flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, fontFamily: "var(--font-condensed)", color: "var(--text-secondary)" }, children: "Navn" }), _jsx("input", { autoFocus: true, required: true, value: customName, onChange: e => setCustomName(e.target.value), className: "w-full mt-1 px-3 py-2 rounded border outline-none", style: { background: "var(--bg-main)", borderColor: "var(--border-card)", color: "var(--text-primary)" } })] }), !effectiveLock && (_jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, fontFamily: "var(--font-condensed)", color: "var(--text-secondary)" }, children: "Vektklasse" }), _jsx("select", { value: customDiv, onChange: e => setCustomDiv(e.target.value), className: "w-full mt-1 px-3 py-2 rounded border outline-none", style: { background: "var(--bg-main)", borderColor: "var(--border-card)", color: "var(--text-primary)" }, children: Object.keys(DIVISION_COLOR).map(d => _jsx("option", { value: d, children: d }, d)) })] })), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { style: { fontSize: 12, fontFamily: "var(--font-condensed)", color: "var(--text-secondary)" }, children: "Record (W-L-D)" }), _jsx("input", { value: customRecord, onChange: e => setCustomRecord(e.target.value), className: "w-full mt-1 px-3 py-2 rounded border outline-none", style: { background: "var(--bg-main)", borderColor: "var(--border-card)", color: "var(--text-primary)" } })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { style: { fontSize: 12, fontFamily: "var(--font-condensed)", color: "var(--text-secondary)" }, children: "Ranking (valgfritt)" }), _jsx("input", { placeholder: "#1, Champion, etc.", value: customRank, onChange: e => setCustomRank(e.target.value), className: "w-full mt-1 px-3 py-2 rounded border outline-none", style: { background: "var(--bg-main)", borderColor: "var(--border-card)", color: "var(--text-primary)" } })] })] }), _jsxs("div", { className: "mt-4 flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setShowCustomForm(false), className: "flex-1 py-2 rounded font-bold transition-colors", style: { background: "var(--bg-main)", border: "1px solid var(--border-card)", color: "var(--text-primary)", fontFamily: "var(--font-condensed)" }, children: "TILBAKE" }), _jsx("button", { type: "submit", className: "flex-1 py-2 rounded font-bold transition-colors", style: { background: "var(--accent-color)", border: "none", color: "#fff", fontFamily: "var(--font-condensed)" }, children: "LEGG TIL P\u00C5 KORT" })] })] })) : (
                /* ── Search & Results ───────────────────── */
                _jsxs(_Fragment, { children: [_jsx("div", { className: "px-4 py-3", style: { borderBottom: "1px solid var(--border-card)" }, children: _jsx("input", { ref: inputRef, value: query, onChange: (e) => handleChange(e.target.value), placeholder: "S\u00F8k p\u00E5 fighternavn eller vektklasse...", className: "w-full rounded-lg px-3 py-2 text-sm outline-none transition-all", style: {
                                    fontFamily: "var(--font-body)",
                                    background: "var(--bg-main)",
                                    border: "1px solid var(--border-card)",
                                    color: "var(--text-primary)",
                                    fontSize: 14,
                                }, onFocus: (e) => (e.currentTarget.style.borderColor = "var(--accent-color)"), onBlur: (e) => (e.currentTarget.style.borderColor = "var(--border-card)") }) }), _jsxs("div", { className: "overflow-y-auto flex-1 flex flex-col", children: [results.length === 0 && (_jsx("p", { className: "text-center py-8 text-sm", style: { fontFamily: "var(--font-body)", color: "var(--text-muted)" }, children: "Ingen fighters funnet." })), results.map((f, i) => {
                                    const colors = DIVISION_COLOR[f.division ?? ""] ?? { text: "#374151", bg: "#f9fafb", border: "#e5e7eb" };
                                    return (_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors", style: { borderBottom: "1px solid var(--border-main)" }, onClick: () => onSelect(f), onMouseEnter: (e) => (e.currentTarget.style.background = "var(--bg-card-hover)"), onMouseLeave: (e) => (e.currentTarget.style.background = "transparent"), children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center rounded-full text-sm", style: {
                                                    width: 38, height: 38,
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.text,
                                                    fontFamily: "var(--font-condensed)",
                                                    fontWeight: 900,
                                                    fontSize: 13,
                                                    letterSpacing: "0.05em",
                                                }, children: initials(f.name) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "mb-0.5", style: {
                                                            fontFamily: "var(--font-condensed)",
                                                            fontWeight: 800,
                                                            fontSize: 14,
                                                            color: "var(--text-primary)",
                                                            letterSpacing: "0.03em",
                                                        }, children: f.name }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx(DivisionBadge, { division: f.division }), _jsx("span", { style: { fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }, children: f.record }), f.rank && f.rank !== "Unranked" && (_jsx("span", { style: { fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", fontStyle: "italic" }, children: f.rank }))] })] }), _jsx("span", { style: { color: "var(--text-muted)" }, className: "text-base", children: "\u203A" })] }, i));
                                }), _jsx("div", { className: "p-4 mt-auto", children: _jsx("button", { onClick: () => setShowCustomForm(true), className: "w-full py-2.5 rounded-lg border-2 border-dashed transition-colors", style: {
                                            borderColor: "var(--border-card)",
                                            color: "var(--text-secondary)",
                                            fontFamily: "var(--font-condensed)",
                                            fontWeight: 800,
                                            fontSize: 12,
                                            letterSpacing: "0.05em"
                                        }, onMouseEnter: (e) => { e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.color = "var(--accent-color)"; }, onMouseLeave: (e) => { e.currentTarget.style.borderColor = "var(--border-card)"; e.currentTarget.style.color = "var(--text-secondary)"; }, children: "+ OPPRETT EGEN FIGHTER" }) })] })] }))] }) }));
};
