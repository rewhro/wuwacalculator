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
    const weaponBaseAtk = activeCharacter?.weapon?.baseAtk ?? 0;  // 👈 will be 0 for now
    const baseAtk = characterBaseAtk + weaponBaseAtk;
    const scaledAtk = baseAtk * (1 + (temporaryBuffs.atkPercent ?? 0) / 100);
    const bonusAtk = scaledAtk - baseAtk;

    const stats = [
        { label: 'ATK', base: baseAtk, bonus: bonusAtk, total: scaledAtk },
        {
            label: 'HP',
            base: baseCharacterState?.Stats?.hp ?? 0,
            bonus: temporaryBuffs.hpPercent ?? 0,
            total: (baseCharacterState?.Stats?.hp ?? 0) * (1 + (temporaryBuffs.hpPercent ?? 0) / 100)
        },
        {
            label: 'DEF',
            base: baseCharacterState?.Stats?.def ?? 0,
            bonus: temporaryBuffs.defPercent ?? 0,
            total: (baseCharacterState?.Stats?.def ?? 0) * (1 + (temporaryBuffs.defPercent ?? 0) / 100)
        },
        {
            label: 'Crit Rate',
            base: baseCharacterState?.Stats?.critRate ?? 0,
            bonus: temporaryBuffs.critRate ?? 0,
            total: (baseCharacterState?.Stats?.critRate ?? 0) + (temporaryBuffs.critRate ?? 0)
        },
        {
            label: 'Crit DMG',
            base: baseCharacterState?.Stats?.critDmg ?? 0,
            bonus: temporaryBuffs.critDmg ?? 0,
            total: (baseCharacterState?.Stats?.critDmg ?? 0) + (temporaryBuffs.critDmg ?? 0)
        },
        {
            label: 'Healing Bonus',
            base: baseCharacterState?.Stats?.healingBonus ?? 0,
            bonus: temporaryBuffs.healingBonus ?? 0,
            total: (baseCharacterState?.Stats?.healingBonus ?? 0) + (temporaryBuffs.healingBonus ?? 0)
        },
        {
            label: 'Energy Recharge',
            base: baseCharacterState?.Stats?.energyRegen ?? 0,
            bonus: temporaryBuffs.energyRegen ?? 0,
            total: (baseCharacterState?.Stats?.energyRegen ?? 0) + (temporaryBuffs.energyRegen ?? 0)
        }
    ];

    ['aero', 'glacio', 'spectro', 'fusion', 'electro', 'havoc'].forEach(element => {
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

    return (
        <div>
            <h2 className="panel-title">Stats</h2>
            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const isFlatStat = ['ATK', 'HP', 'DEF'].includes(stat.label);

                    return (
                        <div key={index} className="stat-row">
                            <div
                                className="stat-label"
                                style={stat.color ? { color: stat.color } : {}}
                            >
                                {stat.label}
                            </div>
                            <div className="stat-value">
                                {isFlatStat ? Math.floor(stat.base) : stat.base.toFixed(1)}
                            </div>
                            <div className="stat-bonus">
                                +{isFlatStat ? Math.floor(stat.bonus) : stat.bonus.toFixed(1)}
                            </div>
                            <div className="stat-total">
                                {isFlatStat ? Math.floor(stat.total) : stat.total.toFixed(1)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}