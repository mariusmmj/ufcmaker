import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calculateHypeScore } from "../utils/hypeScore";
export const CardStats = ({ fights }) => {
    let totalFights = 0;
    let titleFights = 0;
    let totalWins = 0;
    let totalLosses = 0;
    const divisionsCount = {};
    Object.values(fights).forEach((fight) => {
        if (fight.f1.name && fight.f2.name) {
            totalFights++;
            if (fight.isTitleFight)
                titleFights++;
            // Divisions
            if (fight.lockedDiv) {
                divisionsCount[fight.lockedDiv] = (divisionsCount[fight.lockedDiv] || 0) + 1;
            }
            // Records
            const parseRecord = (record) => {
                if (!record)
                    return;
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
    const { score, stars } = calculateHypeScore(fights);
    if (totalFights === 0)
        return null;
    // Find most prominent division
    let topDiv = "-";
    let topDivCount = 0;
    Object.entries(divisionsCount).forEach(([div, count]) => {
        if (count > topDivCount) {
            topDivCount = count;
            topDiv = div;
        }
    });
    return (_jsxs("div", { className: "my-6 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-6", style: {
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }, children: [_jsxs("div", { className: "flex flex-col items-center justify-center min-w-[120px]", children: [_jsx("span", { style: {
                            fontFamily: "var(--font-condensed)",
                            fontWeight: 900,
                            fontSize: 12,
                            letterSpacing: "0.15em",
                            color: "var(--accent-color)",
                            textTransform: "uppercase",
                            marginBottom: 4,
                        }, children: "Hype Score" }), _jsx("div", { className: "flex gap-1 mb-1 text-2xl text-yellow-400", children: [1, 2, 3, 4, 5].map((s) => (_jsx("span", { style: { opacity: s <= stars ? 1 : (s - 0.5 === stars ? 0.5 : 0.2) }, children: "\u2605" }, s))) }), _jsxs("span", { style: { fontFamily: "var(--font-condensed)", fontSize: 11, color: "var(--text-muted)", fontWeight: 800 }, children: [score, " PTS"] })] }), _jsxs("div", { className: "flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { style: { fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }, children: "Kamper totalt" }), _jsx("span", { style: { fontSize: 18, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)" }, children: totalFights })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { style: { fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }, children: "Tittelkamper" }), _jsx("span", { style: { fontSize: 18, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)" }, children: titleFights })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { style: { fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }, children: "Dominerende Vekt" }), _jsx("span", { style: { fontSize: 14, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)", marginTop: 2 }, children: topDiv })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { style: { fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }, children: "Combined W-L" }), _jsxs("span", { style: { fontSize: 18, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)" }, children: [totalWins, "-", totalLosses] })] })] })] }));
};
