// src/components/CharacterStats.jsx
import React from 'react';
import { getStatsForLevel } from '../utils/getStatsForLevel';
import { attributeColors } from '../utils/attributeHelpers';

export default function CharacterStats({
                                           activeCharacter,
                                           baseCharacterState,
                                           characterLevel,
                                           temporaryBuffs
                                       }) {
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
    const baseStats = baseCharacterState?.Stats ?? {};
    const levelStats = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel);

    // mapping label → element type for coloring
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
            <h2 style={{ marginTop: '20px', textAlign: 'left' }}>Stats</h2>

            <div className="stats-grid">
                {statsConfig.map(({ key, label, isPct }) => {
                    const isBaseStat = ['atk', 'hp', 'def'].includes(key);

                    // get base value from level scaling OR json
                    const baseValue = isBaseStat
                        ? (levelStats[jsonStatKeys[key]] ?? baseStats[key] ?? 0)
                        : (baseStats[key] ?? 0);

                    let finalValue = baseValue;

                    // apply buffs
                    if (isBaseStat) {
                        const buffKey = {
                            atk: 'atkPercent',
                            hp: 'hpPercent',
                            def: 'defPercent'
                        }[key];
                        const percentBuff = temporaryBuffs?.[buffKey] ?? 0;
                        finalValue = baseValue * (1 + percentBuff / 100);
                    } else if (statLabelToElement[label]) {
                        const element = statLabelToElement[label];
                        const bonusBuff = temporaryBuffs?.elementalBonuses?.[element] ?? 0;
                        console.log(
                            `🔎 Element bonus check → stat: ${label}, element: ${element}, base: ${baseValue}, buff: ${temporaryBuffs.elementalBonuses[element] ?? 0}`
                        );
                        finalValue += bonusBuff;
                    } else {
                        finalValue += temporaryBuffs?.[key] ?? 0;
                    }

                    //console.log(`[${label}] Base: ${baseValue}, Buffed: ${finalValue}`);
                    const display = isBaseStat
                        ? Math.trunc(finalValue)
                        : (isPct
                            ? `${finalValue.toFixed(1)}%`
                            : (typeof finalValue === 'number' ? finalValue.toLocaleString() : finalValue));
                    console.log(`📊 Stat: ${label} → base: ${baseValue}, buffs applied: ${finalValue - baseValue}, final: ${finalValue}`);

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