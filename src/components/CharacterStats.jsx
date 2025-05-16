import React from 'react';
import { attributeColors } from '../utils/attributeHelpers';
import { getStatsForLevel } from '../utils/getStatsForLevel';

export default function CharacterStats({ activeCharacter, baseCharacterState, characterLevel, temporaryBuffs, customBuffs, finalStats, combatState }) {
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
    const secondaryStats = [
        { label: 'Energy Regen', base: energyRegenBase, bonus: energyRegenTotal - energyRegenBase, total: energyRegenTotal },
        { label: 'Crit Rate', base: baseCharacterState?.Stats?.critRate ?? 0, bonus: (temporaryBuffs?.critRate ?? 0) + (customBuffs?.critRate ?? 0), total: (baseCharacterState?.Stats?.critRate ?? 0) + (temporaryBuffs?.critRate ?? 0) + (customBuffs?.critRate ?? 0) },
        { label: 'Crit DMG', base: baseCharacterState?.Stats?.critDmg ?? 0, bonus: (temporaryBuffs?.critDmg ?? 0) + (customBuffs?.critDmg ?? 0), total: (baseCharacterState?.Stats?.critDmg ?? 0) + (temporaryBuffs?.critDmg ?? 0) + (customBuffs?.critDmg ?? 0) },
        { label: 'Healing Bonus', base: baseCharacterState?.Stats?.healingBonus ?? 0, bonus: (temporaryBuffs?.healingBonus ?? 0) + (customBuffs?.healingBonus ?? 0), total: (baseCharacterState?.Stats?.healingBonus ?? 0) + (temporaryBuffs?.healingBonus ?? 0) + (customBuffs?.healingBonus ?? 0) }
    ];

    // ELEMENTAL & DAMAGE MODIFIERS
    const stats = [...mainStats, ...secondaryStats];
    ['aero','glacio','spectro','fusion','electro','havoc'].forEach(element => {
        const key = `${element}DmgBonus`;
        const base = baseCharacterState?.Stats?.[key] ?? 0;
        const iconBuff = temporaryBuffs?.elementalBonuses?.[element] ?? 0;
        const customBuff = customBuffs?.[element] ?? 0;
        const total = base + iconBuff + customBuff;
        stats.push({
            label: `${element.charAt(0).toUpperCase() + element.slice(1)} DMG Bonus`,
            base,
            bonus: iconBuff + customBuff,
            total,
            color: attributeColors[element] ?? '#fff'
        });
    });

    ['basicAtk','heavyAtk','resonanceSkill','resonanceLiberation'].forEach(skill => {
        const label = skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ' DMG Bonus';
        const iconBuff = temporaryBuffs?.[skill] ?? 0;
        const customBuff = customBuffs?.[skill] ?? 0;
        const total = iconBuff + customBuff;
        stats.push({ label, base: 0, bonus: total, total });
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