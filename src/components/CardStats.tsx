import React from "react";
import { FightsMap } from "../types";
import { calculateHypeScore } from "../utils/hypeScore";

interface Props {
  fights: FightsMap;
}

export const CardStats: React.FC<Props> = ({ fights }) => {
  let totalFights = 0;
  let titleFights = 0;
  let totalWins = 0;
  let totalLosses = 0;
  const divisionsCount: Record<string, number> = {};

  Object.values(fights).forEach((fight) => {
    if (fight.f1.name && fight.f2.name) {
      totalFights++;
      if (fight.isTitleFight) titleFights++;

      // Divisions
      if (fight.lockedDiv) {
        divisionsCount[fight.lockedDiv] = (divisionsCount[fight.lockedDiv] || 0) + 1;
      }

      // Records
      const parseRecord = (record?: string) => {
        if (!record) return;
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

  if (totalFights === 0) return null;

  // Find most prominent division
  let topDiv = "-";
  let topDivCount = 0;
  Object.entries(divisionsCount).forEach(([div, count]) => {
    if (count > topDivCount) {
      topDivCount = count;
      topDiv = div;
    }
  });

  return (
    <div
      className="my-6 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-6"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      {/* Hype Score Box */}
      <div className="flex flex-col items-center justify-center min-w-[120px]">
        <span
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.15em",
            color: "var(--accent-color)",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Hype Score
        </span>
        <div className="flex gap-1 mb-1 text-2xl text-yellow-400">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} style={{ opacity: s <= stars ? 1 : (s - 0.5 === stars ? 0.5 : 0.2) }}>
              ★
            </span>
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "var(--text-muted)", fontWeight: 800 }}>
          {score} PTS
        </span>
      </div>

      {/* Stats Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        <div className="flex flex-col">
          <span style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }}>Kamper totalt</span>
          <span style={{ fontSize: 18, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)" }}>{totalFights}</span>
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }}>Tittelkamper</span>
          <span style={{ fontSize: 18, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)" }}>{titleFights}</span>
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }}>Dominerende Vekt</span>
          <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)", marginTop: 2 }}>{topDiv}</span>
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }}>Combined W-L</span>
          <span style={{ fontSize: 18, color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-condensed)" }}>{totalWins}-{totalLosses}</span>
        </div>
      </div>
    </div>
  );
};
