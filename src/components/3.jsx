// ✅ FINAL studio version: src/components/CharacterStats.jsx
import React from 'react';
import { getUnifiedStatPool } from '../utils/getUnifiedStatPool';

export default function CharacterStats({ activeCharacter, baseCharacterState, characterLevel, temporaryBuffs, customBuffs }) {
    if (!activeCharacter) return null;

    // ✅ studio-safe: calculate unified stat pool
    const unifiedStats = getUnifiedStatPool([temporaryBuffs, customBuffs]);

    const stats = [
        { label: 'ATK %', value: unifiedStats.atkPercent ?? 0 },
        { label: 'HP %', value: unifiedStats.hpPercent ?? 0 },
        { label: 'DEF %', value: unifiedStats.defPercent ?? 0 },
        { label: 'Crit Rate', value: unifiedStats.critRate ?? 0 },
        { label: 'Crit DMG', value: unifiedStats.critDmg ?? 0 },
        { label: 'Healing Bonus', value: unifiedStats.healingBonus ?? 0 },
        { label: 'Energy Regen', value: unifiedStats.energyRegen ?? 0 },

        { label: 'Basic Attack DMG', value: unifiedStats.basicAtk ?? 0 },
        { label: 'Heavy Attack DMG', value: unifiedStats.heavyAtk ?? 0 },
        { label: 'Resonance Skill DMG', value: unifiedStats.resonanceSkill ?? 0 },
        { label: 'Resonance Liberation DMG', value: unifiedStats.resonanceLiberation ?? 0 },

        { label: 'Aero DMG', value: unifiedStats.elementalBonuses?.aero ?? 0 },
        { label: 'Glacio DMG', value: unifiedStats.elementalBonuses?.glacio ?? 0 },
        { label: 'Spectro DMG', value: unifiedStats.elementalBonuses?.spectro ?? 0 },
        { label: 'Fusion DMG', value: unifiedStats.elementalBonuses?.fusion ?? 0 },
        { label: 'Electro DMG', value: unifiedStats.elementalBonuses?.electro ?? 0 },
        { label: 'Havoc DMG', value: unifiedStats.elementalBonuses?.havoc ?? 0 }
    ];

    return (
        <div className="stats-box">
            <h2 className="panel-title">Stats</h2>
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-row">
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value.toFixed(1)}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
