import Rotations from "./Rotations.jsx";

// src/components/DamageSection.jsx
import React, {useEffect} from 'react';
import { calculateDamage } from '../utils/damageCalculator';
import { calculateSupportEffect } from '../utils/supportCalculator';
import { elementToAttribute } from '../utils/attributeHelpers';
import { getCharacterOverride, getHardcodedMultipliers } from '../data/character-behaviour';
import { getWeaponOverride } from '../data/weapon-behaviour/index';
import {getSkillDamageCache, setSkillDamageCache} from '../utils/skillDamageCache';
import { usePersistentState } from '../hooks/usePersistentState';


export default function DamageSection({
                                          activeCharacter,
                                          finalStats,
                                          characterLevel,
                                          sliderValues,
                                          characterRuntimeStates,
                                          combatState,
                                          mergedBuffs,
    rotationEntries
                                      }) {
    if (!activeCharacter) return null;
    const allSkillDamage = [];

    const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill', 'outroSkill'];
    const element = elementToAttribute[activeCharacter?.attribute] ?? '';
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;

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

                    const extra = getHardcodedMultipliers(charId, activeCharacter)?.[tab] ?? [];
                    const customLevels = extra.map(entry => ({
                        ...entry,
                        Name: entry.name
                    }));

                    if (levels.length === 0) {
                        levels = customLevels;
                    } else {
                        const existingNames = levels.map(l => l.Name);
                        const newCustom = customLevels.filter(e => !existingNames.includes(e.Name));
                        levels = levels.map(level => {
                            const match = customLevels.find(e => e.Name === level.Name);
                            return match ? { ...level, ...match, visible: match.visible ?? true } : level;
                        }).concat(newCustom);
                    }
                    return (
                        <div key={tab} className="box-wrapper">
                            <div className="damage-inner-box">
                                <h3 className="damage-box-title">
                                    {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    {skill?.Name ? `: ${skill.Name}` : ''}
                                </h3>

                                {levels.length > 0 ? (
                                    <div className="damage-grid">
                                        <div></div>
                                        <div>Normal</div>
                                        <div>CRIT</div>
                                        <div>AVG</div>
                                        {levels.map((level, index) => {
                                            if (level.visible === false) return null;

                                            const label = level.Name?.toLowerCase() ?? '';
                                            let skillType = [];

                                            // Exclusively assign the core type
                                            if (label.includes('heavy attack')) {
                                                skillType = ['heavy'];
                                            } else if (tab === 'resonanceSkill') {
                                                skillType = ['skill'];
                                            } else if (tab === 'resonanceLiberation') {
                                                skillType = ['ultimate'];
                                            } else if (tab === 'normalAttack') {
                                                skillType = ['basic'];
                                            } else if (tab === 'introSkill') {
                                                skillType = ['intro'];
                                            }

                                            // ✅ skillMeta starts with only one type — safe to add others later in override logic
                                            let skillMeta = {
                                                name: level.Name,
                                                skillType: skillType.length === 1 ? skillType[0] : skillType,
                                                multiplier: 1,
                                                amplify: 0,
                                                tab,
                                                visible: true,
                                                tags: [
                                                    ...(level.healing ? ['healing'] : []),
                                                    ...(level.shielding ? ['shielding'] : [])
                                                ]
                                            };

                                            const rawMultiplier = typeof level.Param?.[0] === 'string'
                                                ? level.Param[0]
                                                : level.Param?.[0]?.[sliderValues[tab] - 1] ?? level.Param?.[0]?.[0] ?? "0%";

                                            const { flat, percent } = extractFlatAndPercent(rawMultiplier);

                                            skillMeta.multiplier = parseCompoundMultiplier(rawMultiplier);

                                            const characterState = {
                                                activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {},
                                                toggles: characterRuntimeStates?.[charId]?.sequenceToggles ?? {}
                                            };

                                            const isActiveSequence = (seqNum) => sliderValues?.sequence >= seqNum;
                                            const isToggleActive = (toggleId) =>
                                                characterState?.toggles?.[toggleId] === true ||
                                                characterState?.activeStates?.[toggleId] === true;

                                            const override = getCharacterOverride(charId);
                                            let localMergedBuffs = structuredClone(mergedBuffs);

                                            if (override) {
                                                const result = override({
                                                    mergedBuffs: localMergedBuffs,
                                                    combatState,
                                                    skillMeta,
                                                    characterState,
                                                    isActiveSequence,
                                                    isToggleActive,
                                                    baseCharacterState: activeCharacter,
                                                    sliderValues,
                                                    getSkillData,
                                                    finalStats,
                                                    element,
                                                    characterLevel
                                                });
                                                skillMeta = result.skillMeta;
                                                localMergedBuffs = result.mergedBuffs;
                                            }

                                            const weaponId = combatState?.weaponId;
                                            const weaponOverride = getWeaponOverride(weaponId);

                                            if (weaponOverride && typeof weaponOverride === 'function') {
                                                const currentParamValues = combatState.weaponParam?.map(
                                                    p => p?.[Math.min(Math.max((combatState.weaponRank ?? 1) - 1, 0), 4)]
                                                ) ?? [];

                                                const result = weaponOverride({
                                                    mergedBuffs: localMergedBuffs,
                                                    combatState,
                                                    skillMeta,
                                                    characterState,
                                                    isToggleActive,
                                                    finalStats,
                                                    element,
                                                    currentParamValues,
                                                    baseCharacterState: activeCharacter
                                                });

                                                localMergedBuffs = result?.mergedBuffs ?? localMergedBuffs;
                                                skillMeta = result?.skillMeta ?? skillMeta;
                                            }

                                            const scaling = skillMeta.scaling ?? level.scaling ?? (
                                                characterRuntimeStates[charId]?.CalculationData?.skillScalingRatios?.[tab] ?? {
                                                    atk: 1, hp: 0, def: 0, energyRegen: 0
                                                }
                                            );

                                            if (skillMeta.visible === false) return null; // 🔒 Also check here post-override

                                            const tag = skillMeta.tags?.[0];
                                            const isSupportSkill = tag === 'healing' || tag === 'shielding';
                                            const supportColor = tag === 'healing' ? 'limegreen' : '#838383';

                                            let normal = null, crit = null, avg = null;

                                            if (isSupportSkill) {
                                                if ('flatOverride' in skillMeta) {
                                                    avg = skillMeta.flatOverride;
                                                } else {
                                                    avg = calculateSupportEffect({
                                                        finalStats,
                                                        scaling,
                                                        multiplier: skillMeta.multiplier,
                                                        type: tag,
                                                        skillHealingBonus: skillMeta.skillHealingBonus ?? 0,
                                                        skillShieldBonus: skillMeta.skillShieldBonus ?? 0,
                                                        flat
                                                    });
                                                }
                                            } else {
                                                const result = calculateDamage({
                                                    finalStats,
                                                    combatState,
                                                    multiplier: skillMeta.multiplier,
                                                    amplify: skillMeta.amplify,
                                                    scaling,
                                                    element,
                                                    skillType: skillMeta.skillType,
                                                    characterLevel,
                                                    mergedBuffs: localMergedBuffs,
                                                    skillDmgBonus: skillMeta.skillDmgBonus ?? 0,
                                                    critDmgBonus: skillMeta.critDmgBonus ?? 0,
                                                    critRateBonus: skillMeta.critRateBonus ?? 0,
                                                    skillDefIgnore: skillMeta.skillDefIgnore ?? 0
                                                });

                                                normal = result.normal;
                                                crit = result.crit;
                                                avg = result.avg;
                                                allSkillDamage.push({
                                                    name: level.Name,
                                                    tab,
                                                    type: Array.isArray(skillMeta.skillType) ? skillMeta.skillType.join(', ') : skillMeta.skillType,
                                                    normal,
                                                    crit,
                                                    avg
                                                });
                                            }

                                            const match = getSkillDamageCache().find(
                                                s => s.name === skill.name && s.tab === skill.tab
                                            );

                                            return (
                                                <React.Fragment key={index}>
                                                    <div style={isSupportSkill ? { color: supportColor, fontWeight: 'bold' } : {}}>
                                                        {level.Name}
                                                    </div>

                                                    {isSupportSkill ? (
                                                        <>
                                                            <div></div>
                                                            <div></div>
                                                            <div style={{ color: supportColor, fontWeight: 'bold' }}>
                                                                {avg.toLocaleString()}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div>{normal.toLocaleString()}</div>
                                                            <div>{crit.toLocaleString()}</div>
                                                            <div>{avg.toLocaleString()}</div>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="damage-text">No multipliers.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* 🔚 Final wrapper: custom component for rotation */}
                {setSkillDamageCache(allSkillDamage)}
                {rotationEntries.length > 0 && (
                    <div className="box-wrapper">
                        <div className="damage-inner-box">
                            <Rotations
                                activeCharacter={activeCharacter}
                                finalStats={finalStats}
                                combatState={combatState}
                                mergedBuffs={mergedBuffs}
                                allSkillDamage={allSkillDamage}
                                rotationEntries={rotationEntries}
                            />
                        </div>
                    </div>
                )}
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

export function parseCompoundMultiplier(formula) {
    if (!formula) return 0;

    const parts = formula.match(/\d+(\.\d+)?%(\*\d+)?/g);
    if (!parts) return 0;

    return parts.reduce((sum, part) => {
        const [percent, timesStr] = part.split('*');
        const value = parseFloat(percent.replace('%', '')) / 100;
        const times = timesStr ? parseInt(timesStr, 10) : 1;
        return sum + value * times;
    }, 0);
}

export function parseFlatComponent(formula) {
    //console.log(formula);
    if (!formula) return 0;

    // Extract all numeric values (both percent and flat)
    const allNumbers = formula.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];

    // Get percent contribution using existing function
    const percentMultiplier = parseCompoundMultiplier(formula) * 100;

    // Total minus percentage portion = flat component
    const total = allNumbers.reduce((sum, n) => sum + n, 0);
    return total - percentMultiplier;
}

export function extractFlatAndPercent(str) {
    const flatMatch = str.match(/^(\d+(\.\d+)?)/);
    const percentMatch = str.match(/(\d+(\.\d+)?)%/);
    const statMatch = str.match(/%[\s]*([a-zA-Z\s]+)/);

    return {
        flat: flatMatch ? parseFloat(flatMatch[1]) : 0,
        percent: percentMatch ? parseFloat(percentMatch[1]) / 100 : 0,
        stat: statMatch ? statMatch[1].trim().toLowerCase() : null
    };
}