// src/hooks/useCharacterStats.js
import { useMemo } from 'react';
import { getStatsForLevel } from '../utils/getStatsForLevel';

/**
 * Custom hook to get combined base + level-adjusted stats for a character.
 *
 * @param {object} characterState - live character state from characterStates.json
 * @param {object} characterData - static data from characters-mapped.json
 * @returns {object} - merged stats object
 */
export default function useCharacterStats(characterState, characterData) {
    return useMemo(() => {
        if (!characterState || !characterData) return {};

        const baseStats = characterState.Stats ?? {};
        const currentLevel = characterState.CharacterLevel ?? 1;
        const levelStats = getStatsForLevel(characterData.stats, currentLevel);

        return {
            ...baseStats,
            ...levelStats // level-specific overrides
        };

    }, [characterState, characterData]);
}
