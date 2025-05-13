// utils/getStatsForLevel.js
export const getStatsForLevel = (statsObj, level) => {
    for (const [stage, levels] of Object.entries(statsObj ?? {})) {
        const min = Math.min(...Object.keys(levels).map(Number));
        const max = Math.max(...Object.keys(levels).map(Number));
        if (level >= min && level <= max) {
            return levels[String(level)] ?? {};
        }
    }
    return {};
};