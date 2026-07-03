import { emptyFighter } from "../constants";
function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}
function getRankNum(rank) {
    if (!rank || rank === "Unranked")
        return 999;
    if (rank === "Champion" || rank === "C")
        return 0;
    const num = parseInt(rank.replace("#", ""), 10);
    return isNaN(num) ? 999 : num;
}
export function generateRandomCard(slots, allFighters) {
    const newFights = {};
    const selectedNames = new Set();
    // Helper to find two available fighters in a specific division
    const getMatchup = (division, isMainEvent) => {
        const available = allFighters.filter((f) => {
            if (selectedNames.has(f.name))
                return false;
            if (f.division !== division)
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
            return true;
        });
        if (available.length < 2)
            return null;
        // Prioritize higher ranked fighters occasionally, but here we just shuffle and pick 2
        const shuffled = shuffleArray(available);
        const f1 = shuffled[0];
        const f2 = shuffled[1];
        selectedNames.add(f1.name);
        selectedNames.add(f2.name);
        return { f1, f2, lockedDiv: division };
    };
    const divisions = [...new Set(allFighters.map((f) => f.division).filter(Boolean))];
    slots.forEach((slot) => {
        const isMainEvent = slot.id === "m1" || slot.id === "m2";
        // Pick a random division for this slot
        let matchup = null;
        let attempts = 0;
        while (!matchup && attempts < 10) {
            const randomDiv = divisions[Math.floor(Math.random() * divisions.length)];
            matchup = getMatchup(randomDiv, isMainEvent);
            attempts++;
        }
        if (matchup) {
            newFights[slot.id] = {
                f1: { name: matchup.f1.name, division: matchup.f1.division, record: matchup.f1.record, rank: matchup.f1.rank },
                f2: { name: matchup.f2.name, division: matchup.f2.division, record: matchup.f2.record, rank: matchup.f2.rank },
                lockedDiv: matchup.lockedDiv,
                isTitleFight: slot.id === "m1", // Automatically make m1 a title fight
                rounds: slot.id === "m1" ? 5 : 3,
            };
        }
        else {
            newFights[slot.id] = {
                f1: emptyFighter(),
                f2: emptyFighter(),
                lockedDiv: null,
                isTitleFight: false,
                rounds: 3,
            };
        }
    });
    return newFights;
}
