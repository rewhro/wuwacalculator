import React from 'react';
import { attributeColors } from '../utils/attributeHelpers';
import { getStatsForLevel } from '../utils/getStatsForLevel';

export default function CharacterStats({ activeCharacter, baseCharacterState, characterLevel, mergedBuffs, customBuffs, finalStats, combatState }) {
    if (!activeCharacter) return null;


    // MAIN STATS
    const characterBaseAtk = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel)?.["Atk"] ?? 0;
    const weaponBaseAtk = combatState?.weaponBaseAtk ?? 0;
    const baseAtk = ((getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel)?.["Atk"] ?? 0) + weaponBaseAtk);
    const atkBonus = (finalStats.atk ?? 0) - baseAtk;

    const baseHp = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel)?.["Life"] ?? 0;
    const hpBonus = (finalStats.hp ?? 0) - baseHp;

    const baseDef = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel)?.["Def"] ?? 0;
    const defBonus = (finalStats.def ?? 0) - baseDef;

    const mainStats = [
        { label: 'ATK', base: baseAtk, bonus: atkBonus, total: finalStats.atk ?? 0 },
        { label: 'HP', base: baseHp, bonus: hpBonus, total: finalStats.hp ?? 0 },
        { label: 'DEF', base: baseDef, bonus: defBonus, total: finalStats.def ?? 0 }
    ];

    // SECONDARY STATS
    const energyRegenBase = baseCharacterState?.Stats?.energyRegen ?? 0;
    const energyRegenTotal = finalStats.energyRegen ?? 0;
    const secondaryStats = ['energyRegen', 'critRate', 'critDmg', 'healingBonus'].map(statKey => {
        const labelMap = {
            energyRegen: 'Energy Regen',
            critRate: 'Crit Rate',
            critDmg: 'Crit DMG',
            healingBonus: 'Healing Bonus'
        };

        const baseFromCharacter = baseCharacterState?.Stats?.[statKey] ?? 0;
        const baseFromWeapon = combatState?.[statKey] ?? 0;
        const base = baseFromCharacter + baseFromWeapon;
        const total = finalStats?.[statKey] ?? base;
        const bonus = total - base;

        return {
            label: labelMap[statKey],
            base,
            bonus,
            total
        };
    });

    // ELEMENTAL & DAMAGE MODIFIERS
    const stats = [...mainStats, ...secondaryStats];
    ['aero','glacio','spectro','fusion','electro','havoc'].forEach(element => {
        const key = `${element}DmgBonus`;
        const base = baseCharacterState?.Stats?.[key] ?? 0;
        const bonus = mergedBuffs?.[element] ?? 0;  // mergedBuffs carries the bonus part only
        const total = base + bonus;

        stats.push({
            label: `${element.charAt(0).toUpperCase() + element.slice(1)} DMG Bonus`,
            base,
            bonus,
            total,
            color: attributeColors[element] ?? '#fff'
        });
    });

    const labelMap = {
        basicAtk: 'Basic Attack DMG Bonus',
        heavyAtk: 'Heavy Attack DMG Bonus',
        skillAtk: 'Resonance Skill DMG Bonus',
        ultimateAtk: 'Resonance Liberation DMG Bonus'
    };

    ['basicAtk','heavyAtk','skillAtk','ultimateAtk'].forEach(skill => {
        const label = labelMap[skill] ?? skill;
        const base = 0;
        const total = finalStats?.[skill] ?? 0;
        const bonus = total - base;
        stats.push({ label, base, bonus, total });
    });

    // ✅ FINAL STUDIO POLISHED DISPLAY
    const renderStatsGrid = group => (
        <div className="stats-grid">
            {group.map((stat, index) => {
                const isFlatStat = ['ATK', 'HP', 'DEF'].includes(stat.label);
                const displayValue = val => isFlatStat ? Math.floor(val) : `${val.toFixed(1)}%`;
                return (
                    <div key={index} className="stat-row">
                        <div className="stat-label" style={stat.color ? { color: stat.color } : {}}>
                            {stat.label}
                        </div>
                        <div className="stat-value">{displayValue(stat.base)}</div>
                        <div className="stat-bonus">
                            {(stat.bonus === 0 || stat.bonus === 0.0) ? '' : `+${displayValue(stat.bonus)}`}
                        </div>
                        <div className="stat-total">{displayValue(stat.total)}</div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="stats-box">
            <h2 className="panel-title">Stats</h2>

            <h3 className="stat-group-title">Main Stats</h3>
            {renderStatsGrid(mainStats)}

            <h3 className="stat-group-title">Secondary Stats</h3>
            {renderStatsGrid(secondaryStats)}

            <h3 className="stat-group-title">Damage Modifier Stats</h3>
            {renderStatsGrid(stats.slice(mainStats.length + secondaryStats.length))}
        </div>
    );
}