// src/components/CharacterStats.jsx
import React from 'react';
import { getStatsForLevel } from '../utils/getStatsForLevel';
import { attributeColors } from '../utils/attributeHelpers';   // ✅ import your attributeColors!

export default function CharacterStats({ activeCharacter, currentCharacterState, characterLevel }) {
    const jsonStatKeys = { atk: "Atk", hp: "Life", def: "Def" };
    const statsConfig = [
        { key: 'atk', label: 'Attack' },
        { key: 'hp', label: 'HP' },
        { key: 'def', label: 'Defense' },
        { key: 'critRate', label: 'Crit Rate', isPct: true },
        { key: 'critDmg', label: 'Crit DMG', isPct: true },
        { key: 'energyRegen', label: 'Energy Regen', isPct: true },
        { key: 'basicAttackBonus', label: 'Basic Attack DMG Bonus', isPct: true },
        { key: 'heavyAttackBonus', label: 'Heavy Attack DMG Bonus', isPct: true },
        { key: 'resonanceSkillBonus', label: 'Resonance Skill DMG Bonus', isPct: true },
        { key: 'resonanceLiberationBonus', label: 'Resonance Liberation DMG Bonus', isPct: true },
        { key: 'glacioDmgBonus', label: 'Glacio DMG Bonus', isPct: true },
        { key: 'fusionDmgBonus', label: 'Fusion DMG Bonus', isPct: true },
        { key: 'electroDmgBonus', label: 'Electro DMG Bonus', isPct: true },
        { key: 'aeroDmgBonus', label: 'Aero DMG Bonus', isPct: true },
        { key: 'spectroDmgBonus', label: 'Spectro DMG Bonus', isPct: true },
        { key: 'havocDmgBonus', label: 'Havoc DMG Bonus', isPct: true },
        { key: 'healingBonus', label: 'Healing Bonus', isPct: true }
    ];
    const levelStats = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel);

    // ✅ map label to element
    const statLabelToElement = {
        'Glacio DMG Bonus': 'glacio',
        'Fusion DMG Bonus': 'fusion',
        'Electro DMG Bonus': 'electro',
        'Aero DMG Bonus': 'aero',
        'Spectro DMG Bonus': 'spectro',
        'Havoc DMG Bonus': 'havoc'
    };

    return (
        <>
            <h2>Character Stats</h2>

            <div className="stats-grid">
                {statsConfig.map(({ key, label, isPct }) => {
                    const raw = currentCharacterState?.Stats?.[key] ?? 0;
                    const isBaseStat = ['atk', 'hp', 'def'].includes(key);
                    const value = isBaseStat
                        ? (levelStats[jsonStatKeys[key]] ?? raw)
                        : raw;

                    const display = isBaseStat
                        ? Math.trunc(value)
                        : (isPct
                            ? `${value.toFixed(1)}%`
                            : (typeof value === 'number' ? value.toLocaleString() : value));

                    // ✅ get element + color for attribute stats
                    const element = statLabelToElement[label];
                    const color = element ? attributeColors[element] : undefined;

                    return (
                        <div key={key} className="stat-row">
                            <div
                                className="stat-label"
                                style={color ? { color, fontWeight: 'bold' } : {}}
                            >
                                {label}
                            </div>
                            <div className="stat-value">{display}</div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}