// src/components/DamageSection.jsx
import React from 'react';
import { calculateDamage } from '../utils/damageCalculator';

export default function DamageSection({
                                          activeCharacter,
                                          finalStats,
                                          characterLevel,
                                          sliderValues,
                                          characterRuntimeStates
                                      }) {
    const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill'];

    return (
        <div className="damage-box">
            <h2 className="panel-title">Damage</h2>

            <div className="damage-section">
                {skillTabs.map((tab) => {
                    const skill = getSkillData(activeCharacter, tab);
                    const levels = skill?.Level ? Object.values(skill.Level).filter(
                        level => Array.isArray(level.Param?.[0]) &&
                            level.Param[0].some(val => typeof val === 'string' && val.includes('%'))
                    ) : [];

                    return (
                        <div key={tab} className="box-wrapper">
                            <div className="damage-inner-box">   {/* ✅ small inner box */}
                                <h3 className="damage-box-title">
                                    {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </h3>

                                {levels.length > 0 ? (
                                    <div className="damage-grid">
                                        <div></div>
                                        <div>Normal</div>
                                        <div>CRIT</div>
                                        <div>AVG</div>
                                        {levels.map((level, index) => {
                                            const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
                                            const scaling = characterRuntimeStates[charId]?.CalculationData?.skillScalingRatios?.[tab] ?? { atk: 1, hp: 0, def: 0, energyRegen: 0 };

                                            const atk = finalStats.atk ?? 0;
                                            const hp = finalStats.hp ?? 0;
                                            const def = finalStats.def ?? 0;
                                            const energyRegen = finalStats.energyRegen ?? 0;

                                            const multiplierString = level.Param?.[0]?.[sliderValues[tab] - 1] ?? "0%";
                                            const multiplier = parseFloat(multiplierString.replace('%', '')) / 100;
                                            const { normal, crit, avg } = calculateDamage(
                                                { atk, hp, def, energyRegen },
                                                multiplier,
                                                scaling
                                            );

                                            return (
                                                <React.Fragment key={index}>
                                                    <div>{level.Name}</div>
                                                    <div>{normal.toLocaleString()}</div>
                                                    <div>{crit.toLocaleString()}</div>
                                                    <div>{avg.toLocaleString()}</div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p>No multipliers.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function getSkillData(char, tab) {
    if (!char?.raw?.SkillTrees) return null;
    const tree = Object.values(char.raw.SkillTrees).find(tree =>
        tree.Skill?.Type?.toLowerCase().replace(/\s/g, '') === tab.toLowerCase()
    );
    return tree?.Skill ?? null;
}