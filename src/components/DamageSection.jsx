import Rotations from "./Rotations.jsx";

// src/components/DamageSection.jsx
import React, {useState} from 'react';
import { getHardcodedMultipliers } from '../data/character-behaviour';
import { computeSkillDamage, getSkillData } from "../utils/computeSkillDamage.js";
import { setSkillDamageCache } from "../utils/skillDamageCache";
import {elementToAttribute, attributeColors} from "../utils/attributeHelpers.js";
import {calculateAeroErosionDamage, calculateSpectroFrazzleDamage} from "../utils/damageCalculator.js";

export default function DamageSection({
                                          activeCharacter,
                                          finalStats,
                                          characterLevel,
                                          sliderValues,
                                          characterRuntimeStates,
                                          combatState,
                                          mergedBuffs,
                                          rotationEntries,
    currentSliderColor
                                      }) {
    if (!activeCharacter) return null;

    const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill', 'outroSkill'];
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const allSkillResults = [];
    const [showSubHits, setShowSubHits] = useState(true);
    const negativeEffect = combatState?.spectroFrazzle > 0 || combatState?.aeroErosion > 0;
    const {frazzleTotal, frazzle} = calculateSpectroFrazzleDamage(combatState, mergedBuffs, characterLevel);
    const {erosionTotal, erosion} = calculateAeroErosionDamage(combatState, mergedBuffs, characterLevel);

    if (frazzle > 0) {
        allSkillResults.push({
            name: 'Spectro Frazzle',
            tab: 'negativeEffect',
            skillType: 'spectroFrazzle',
            normal: Math.floor(frazzle),
            crit: Math.floor(frazzle),
            avg: Math.floor(frazzle),
            isSupportSkill: false,
            visible: true,
            supportLabel: null,
            supportColor: null
        });
    }

    if (erosion > 0) {
        allSkillResults.push({
            name: 'Aero Erosion',
            tab: 'negativeEffect',
            skillType: 'aeroErosion',
            normal: Math.floor(erosion),
            crit: Math.floor(erosion),
            avg: Math.floor(erosion),
            isSupportSkill: false,
            visible: true,
            supportLabel: null,
            supportColor: null
        });
    }

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
                                    isSupportSkill,
                                    supportColor,
                                    supportLabel: skillMeta.tags?.includes('healing') ? 'Healing' :
                                        skillMeta.tags?.includes('shielding') ? 'Shield' : null,
                                    visible: skillMeta.visible,
                                });

                                if (skillMeta.visible === false) return null;

                                const getSubHitFormula = (hits, type) => {
                                    if (!hits || hits.length === 0) return '';
                                    return hits.map(hit => {
                                        const val = Math.round(hit[type]);
                                        return hit.count > 1
                                            ? `${val.toLocaleString()} × ${hit.count}`
                                            : `${val.toLocaleString()}`;
                                    }).join(' + ');
                                };

                                return (
                                    <React.Fragment key={index}>
                                        {/* Main Skill Row */}
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
                                                <div
                                                    className="damage-tooltip-wrapper"
                                                    data-tooltip={result.subHits?.length > 0 ? `${getSubHitFormula(result.subHits, 'normal')}` : `${normal.toLocaleString()}`}
                                                >
                                                    {normal.toLocaleString()}
                                                </div>
                                                <div
                                                    className="damage-tooltip-wrapper"
                                                    data-tooltip={result.subHits?.length > 0 ? `${getSubHitFormula(result.subHits, 'crit')}` : `${crit.toLocaleString()}`}
                                                >
                                                    {crit.toLocaleString()}
                                                </div>
                                                <div
                                                    className="damage-tooltip-wrapper"
                                                    data-tooltip={result.subHits?.length > 0 ? `${getSubHitFormula(result.subHits, 'avg')}` : `${avg.toLocaleString()}`}
                                                >
                                                    {avg.toLocaleString()}
                                                </div>
                                            </>
                                        )}

                                        {/* Sub-hits */}
                                        {showSubHits && result.subHits?.length > 0 && result.subHits.map((hit, i) => (
                                            <React.Fragment key={`${index}-subhit-${i}`}>
                                                <div style={{ paddingLeft: '0.5rem', fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.8 }}>
                                                    ↳ {level.Name}-{i + 1}{hit.label && ` (${hit.label})`}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>{Math.round(hit.normal).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>{Math.round(hit.crit).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>{Math.round(hit.avg).toLocaleString()}</div>
                                            </React.Fragment>
                                        ))}
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
            <h2 className="panel-title">
                Damage
                <label className='modern-checkbox' style={{ fontSize: '1rem', gap: '0.3rem' }}>
                    Show Sub-Hits
                    <input
                        type="checkbox"
                        checked={showSubHits}
                        onChange={(e) => setShowSubHits(e.target.checked)}
                    />
                </label>
            </h2>
            <div className="damage-section">
                {skillUI}
                {(negativeEffect) && (
                    <div className="box-wrapper">
                        <div className="damage-inner-box">
                            <h3 className="damage-box-title">Negative Effects</h3>
                            <div className="damage-grid">
                                <div></div>
                                <div>Normal</div>
                                <div>CRIT</div>
                                <div>AVG</div>

                                {(combatState?.spectroFrazzle > 0) && (
                                    <>
                                        <div style={{ color: attributeColors.spectro, fontWeight: 'bold' }}>
                                            Spectro Frazzle
                                        </div>
                                        <div className="damage-tooltip-wrapper" style={{color: attributeColors.spectro, fontWeight: 'bold' }}>
                                            {Math.floor(frazzle).toLocaleString()}
                                        </div>
                                        <div className="damage-tooltip-wrapper" style={{color: attributeColors.spectro, fontWeight: 'bold' }}>
                                            {Math.floor(frazzle).toLocaleString()}
                                        </div>
                                        <div className="damage-tooltip-wrapper" style={{color: attributeColors.spectro, fontWeight: 'bold' }}>
                                            {Math.floor(frazzle).toLocaleString()}
                                        </div>
                                    </>
                                )}
                                {(combatState?.aeroErosion > 0) && (
                                    <>
                                        <div style={{ color: attributeColors.aero, fontWeight: 'bold' }}>
                                            Aero Erosion
                                        </div>
                                        <div className="damage-tooltip-wrapper" style={{color: attributeColors.aero, fontWeight: 'bold' }}>
                                            {Math.floor(erosion).toLocaleString()}
                                        </div>
                                        <div className="damage-tooltip-wrapper" style={{color: attributeColors.aero, fontWeight: 'bold' }}>
                                            {Math.floor(erosion).toLocaleString()}
                                        </div>
                                        <div className="damage-tooltip-wrapper" style={{color: attributeColors.aero, fontWeight: 'bold' }}>
                                            {Math.floor(erosion).toLocaleString()}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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