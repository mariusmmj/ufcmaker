import { Fight, FightsMap } from "../types";

export function getFighterPoints(f: Fight["f1"]) {
  if (!f.name) return 0;
  let pts = 0;

  // Rank points
  if (f.rank === "Champion" || f.rank === "C") {
    pts += 5;
  } else if (f.rank) {
    const r = parseInt(f.rank.replace("#", ""), 10);
    if (!isNaN(r)) {
      if (r <= 5) pts += 5;
      else if (r <= 15) pts += 3;
    }
  }

  // Record points
  if (f.record) {
    const match = f.record.match(/^(\d+)-/);
    if (match) {
      const wins = parseInt(match[1], 10);
      if (wins >= 15) pts += 2;
      else if (wins >= 10) pts += 1;
    }
  }

  return pts;
}

export function calculateHypeScore(fights: FightsMap) {
  let score = 0;
  let activeFights = 0;

  Object.values(fights).forEach((fight) => {
    if (fight.f1.name && fight.f2.name) {
      activeFights++;
      if (fight.isTitleFight) score += 10;
      score += getFighterPoints(fight.f1);
      score += getFighterPoints(fight.f2);
    }
  });

  // Calculate stars (0 to 5)
  // Let's say a perfect fight gives ~20-25 pts. 
  // 5 fights * 20 = 100 pts. Let's make the max expected score roughly 50-60 for 5 stars on a typical card.
  // We'll scale it so that ~40 points is 5 stars.
  let rawStars = activeFights === 0 ? 0 : (score / 15);
  
  if (rawStars > 5) rawStars = 5;
  if (rawStars < 0) rawStars = 0;

  // Round to nearest half star
  const stars = Math.round(rawStars * 2) / 2;

  return { score, stars };
}
