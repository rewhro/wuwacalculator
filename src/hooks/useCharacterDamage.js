// src/hooks/useCharacterDamage.js
import { useMemo } from 'react';
import { calculateDamage } from '../utils/damageCalculator';

/**
 * Custom hook to calculate all damage values based on character stats, multipliers, and scaling data.
 * Returns an array of { normal, crit, avg } damage objects.
 */
export default function useCharacterDamage(characterStats, multipliers, scalingData) {
    return useMemo(() => {
        if (!characterStats || !multipliers || !scalingData) return [];

        return multipliers.map(multiplier =>
            calculateDamage(characterStats, multiplier, scalingData)
        );
    }, [characterStats, multipliers, scalingData]);
}
