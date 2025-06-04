import Rotations from "./Rotations.jsx";

// src/components/DamageSection.jsx
import React from 'react';
import { getHardcodedMultipliers } from '../data/character-behaviour';
import { computeSkillDamage, getSkillData } from "../utils/computeSkillDamage.js";
import { setSkillDamageCache } from "../utils/skillDamageCache";

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

    const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill', 'outroSkill'];
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const allSkillResults = [];

    const skillUI = skillTabs.map((tab) => {
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
                                const result = computeSkillDamage({
                                    entry: {
                                        label: level.Name,
                                        detail: level.Type ?? tab,
                                        tab
                                    },
                                    levelData: level,
                                    activeCharacter,
                                    characterRuntimeStates,
                                    finalStats,
                                    combatState,
                                    mergedBuffs,
                                    sliderValues,
                                    characterLevel,
                                    getSkillData
                                });

                                const { normal, crit, avg, skillMeta = {} } = result;

                                const isSupportSkill = skillMeta.tags?.includes('healing') || skillMeta.tags?.includes('shielding');
                                const supportColor = skillMeta.tags?.includes('healing') ? 'limegreen' : '#838383';

                                allSkillResults.push({
                                    name: level.Name,
                                    tab,
                                    skillType: result?.skillMeta?.skillType ?? 'basic',
                                    normal: result.normal,
                                    crit: result.crit,
                                    avg: result.avg,
                                    isSupportSkill: isSupportSkill,
                                    supportColor: supportColor,
                                    supportLabel: skillMeta.tags?.includes('healing') ? 'Healing' :
                                        skillMeta.tags?.includes('shielding') ? 'Shield' : null,
                                    visible: skillMeta.visible
                                });

                                return skillMeta.visible === false ? null : (
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
    });

    // ✅ Set cache once after processing all skillTabs
    setSkillDamageCache(allSkillResults);
    if (typeof window !== 'undefined') {
        window.lastSkillCacheUpdate = Date.now();
    }

    return (
        <div className="damage-box">
            <h2 className="panel-title">Damage</h2>
            <div className="damage-section">
                {skillUI}

                {rotationEntries.length > 0 && (
                    <div className="box-wrapper">
                        <div className="damage-inner-box">
                            <Rotations
                                activeCharacter={activeCharacter}
                                rotationEntries={rotationEntries}
                                finalStats={finalStats}
                                combatState={combatState}
                                mergedBuffs={mergedBuffs}
                                sliderValues={sliderValues}
                                characterLevel={characterLevel}
                                characterRuntimeStates={characterRuntimeStates}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}