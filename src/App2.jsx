// src/components/DamageSection.jsx
import React from 'react';
import { calculateDamage } from '../utils/damageCalculator';
import { elementToAttribute } from '../utils/attributeHelpers';
import { getCharacterOverride, getHardcodedMultipliers } from '../data/character-behaviour';

export default function DamageSection({
                                          activeCharacter,
                                          finalStats,
                                          characterLevel,
                                          sliderValues,
                                          characterRuntimeStates,
                                          combatState,
                                          mergedBuffs
                                      }) {
    if (!activeCharacter) return null;

    const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill'];
    const element = elementToAttribute[activeCharacter?.attribute] ?? '';

    return (
        <div className="damage-box">
            <h2 className="panel-title">Damage</h2>

            <div className="damage-section">
                {skillTabs.map((tab) => {
                    const skill = getSkillData(activeCharacter, tab);
                    let levels = [];

                    if (skill?.Level) {
                        levels = Object.values(skill.Level).filter(
                            level => Array.isArray(level.Param?.[0]) &&
                                level.Param[0].some(val => typeof val === 'string' && val.includes('%'))
                        );
                    }

                    if (tab === 'outroSkill' && levels.length === 0) {
                        const hardcoded = getHardcodedMultipliers(charId)?.outroSkill ?? [];
                        levels = hardcoded.map(entry => ({
                            Name: entry.name,
                            Param: [[entry.multiplier]],
                            scaling: entry.scaling
                        }));
                    }

                    return (
                        <div key={tab} className="box-wrapper">
                            <div className="damage-inner-box">
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
                                            const scaling = level.scaling ?? (
                                                characterRuntimeStates[charId]?.CalculationData?.skillScalingRatios?.[tab] ?? {
                                                    atk: 1, hp: 0, def: 0, energyRegen: 0
                                                }
                                            );

                                            const multiplierString =
                                                typeof level.Param?.[0] === 'string'
                                                    ? level.Param[0]
                                                    : level.Param?.[0]?.[sliderValues[tab] - 1] ?? level.Param?.[0]?.[0] ?? "0%";

                                            const multiplier = parseCompoundMultiplier(multiplierString);

                                            const element = elementToAttribute[activeCharacter?.attribute] ?? '';

                                            // ✅ Detect skillType based on label content
                                            const label = level.Name?.toLowerCase() ?? '';
                                            let skillType = '';
                                            if (label.includes('heavy attack')) skillType = 'heavy';
                                            else if (tab === 'resonanceSkill') skillType = 'skill';
                                            else if (tab === 'resonanceLiberation') skillType = 'ultimate';
                                            else if (tab === 'normalAttack') skillType = 'basic';
                                            else if (tab === 'outroSkill') skillType = 'outro';
                                            // forteCircuit intentionally left with empty skillType


                                            const { normal, crit, avg } = calculateDamage({
                                                finalStats,
                                                combatState,
                                                multiplier,
                                                scaling,
                                                element,
                                                skillType,
                                                characterLevel,
                                                mergedBuffs,
                                            });

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
        tree.Skill?.Type?.toLowerCase?.().replace(/\s/g, '') === tab.toLowerCase()
    );
    return tree?.Skill ?? null;
}

function parseCompoundMultiplier(formula) {
    if (!formula) return 0;

    // Match things like "21.58%*4" or "67.56%" etc.
    const parts = formula.match(/\d+(\.\d+)?%(\*\d+)?/g);
    if (!parts) return 0;

    return parts.reduce((sum, part) => {
        const [percent, timesStr] = part.split('*');
        const value = parseFloat(percent.replace('%', '')) / 100;
        const times = timesStr ? parseInt(timesStr, 10) : 1;
        return sum + value * times;
    }, 0);
}