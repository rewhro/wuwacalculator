import React from 'react';

const elementColors = {
    aero: '#3cc1c3',
    glacio: '#64aaff',
    spectro: '#9b79e5',
    fusion: '#ff9a3c',
    electro: '#e86aff',
    havoc: '#ff5252'
};

export default function CharacterStats({ activeCharacter, baseCharacterState, characterLevel, temporaryBuffs, finalStats }) {
    if (!activeCharacter) return null;

    const characterBaseAtk = finalStats.atk ?? 0;
    const weaponBaseAtk = activeCharacter?.weapon?.baseAtk ?? 0;
    const baseAtk = characterBaseAtk + weaponBaseAtk;
    const scaledAtk = baseAtk * (1 + (temporaryBuffs.atkPercent ?? 0) / 100);
    const bonusAtk = scaledAtk - baseAtk;

    const stats = [
        { label: 'ATK', base: baseAtk, bonus: bonusAtk, total: scaledAtk },
        { label: 'HP', base: finalStats.hp ?? 0, bonus: 0, total: finalStats.hp ?? 0 },
        { label: 'DEF', base: finalStats.def ?? 0, bonus: 0, total: finalStats.def ?? 0 },
        { label: 'Crit Rate', base: baseCharacterState?.Stats?.critRate ?? 0, bonus: temporaryBuffs.critRate ?? 0, total: (baseCharacterState?.Stats?.critRate ?? 0) + (temporaryBuffs.critRate ?? 0) },
        { label: 'Crit DMG', base: baseCharacterState?.Stats?.critDmg ?? 0, bonus: temporaryBuffs.critDmg ?? 0, total: (baseCharacterState?.Stats?.critDmg ?? 0) + (temporaryBuffs.critDmg ?? 0) },
        { label: 'Healing Bonus', base: baseCharacterState?.Stats?.healingBonus ?? 0, bonus: temporaryBuffs.healingBonus ?? 0, total: (baseCharacterState?.Stats?.healingBonus ?? 0) + (temporaryBuffs.healingBonus ?? 0) },
        { label: 'Energy Recharge', base: baseCharacterState?.Stats?.energyRegen ?? 0, bonus: temporaryBuffs.energyRegen ?? 0, total: (baseCharacterState?.Stats?.energyRegen ?? 0) + (temporaryBuffs.energyRegen ?? 0) }
    ];

    ['aero','glacio','spectro','fusion','electro','havoc'].forEach(element => {
        const base = baseCharacterState?.Stats?.[`${element}DmgBonus`] ?? 0;
        const bonus = temporaryBuffs.elementalBonuses?.[element] ?? 0;
        const total = base + bonus;
        stats.push({
            label: `${element.charAt(0).toUpperCase() + element.slice(1)} DMG Bonus`,
            base,
            bonus,
            total,
            color: elementColors[element] ?? '#fff'
        });
    });

    ['basicAtk','heavyAtk','resonanceSkill','resonanceLiberation'].forEach(skill => {
        const label = skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ' DMG Bonus';
        const value = temporaryBuffs[skill] ?? 0;
        stats.push({ label, base: 0, bonus: value, total: value });
    });

    const mainStats = stats.filter(stat => ['ATK', 'HP', 'DEF'].includes(stat.label));
    const secondaryStats = stats.filter(stat => ['Energy Recharge', 'Crit Rate', 'Crit DMG', 'Healing Bonus'].includes(stat.label));
    const dmgModifiers = stats.filter(stat => !mainStats.includes(stat) && !secondaryStats.includes(stat));

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
                        <div className="stat-bonus">+{displayValue(stat.bonus)}</div>
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
            {renderStatsGrid(dmgModifiers)}
        </div>
    );
}