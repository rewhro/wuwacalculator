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

export function getFinalStats(activeCharacter, baseCharacterState, characterLevel, mergedBuffs, combatState) {
    const baseStats = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel) ?? {};

    const weaponBaseAtk = combatState?.weaponBaseAtk ?? 0;
    const characterBaseAtk = (baseStats["Atk"] ?? 0);

    const baseAtk = characterBaseAtk + weaponBaseAtk;
    const totalAtkPercent = mergedBuffs?.atkPercent ?? 0;
    const totalAtkFlat = mergedBuffs?.atkFlat ?? 0;

    const finalStats = { ...baseStats };
    finalStats.atk = baseAtk * (1 + totalAtkPercent / 100) + totalAtkFlat;

    const baseHp = baseStats["Life"] ?? 0;
    const totalHpPercent = mergedBuffs?.hpPercent ?? 0;
    const totalHpFlat = mergedBuffs?.hpFlat ?? 0;
    finalStats.hp = baseHp * (1 + totalHpPercent / 100) + totalHpFlat;

    const baseDef = baseStats["Def"] ?? 0;
    const totalDefPercent = mergedBuffs?.defPercent ?? 0;
    const totalDefFlat = mergedBuffs?.defFlat ?? 0;
    finalStats.def = baseDef * (1 + totalDefPercent / 100) + totalDefFlat;

    finalStats.critRate = (baseCharacterState?.Stats?.critRate ?? 0) + (mergedBuffs?.critRate ?? 0);
    finalStats.critDmg = (baseCharacterState?.Stats?.critDmg ?? 0) + (mergedBuffs?.critDmg ?? 0);
    finalStats.healingBonus = (baseCharacterState?.Stats?.healingBonus ?? 0) + (mergedBuffs?.healingBonus ?? 0);
    finalStats.energyRegen = (baseCharacterState?.Stats?.energyRegen ?? 0) + (mergedBuffs?.energyRegen ?? 0);

    ['aero','glacio','spectro','fusion','electro','havoc'].forEach(element => {
        const key = `${element}DmgBonus`;
        const bonus = mergedBuffs?.elementalBonuses?.[element] ?? 0;
        finalStats[key] = (finalStats[key] ?? 0) + bonus;
    });

    ['basicAtk','heavyAtk','skillAtk','ultimateAtk'].forEach(skill => {
        finalStats[skill] = mergedBuffs?.[skill] ?? 0;
    });

    return finalStats;
}