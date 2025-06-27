import React from 'react';

export function WeaponUI({
                             combatState,
                             setCombatState,
                             activeStates,
                             toggleState,
                             currentParamValues = [],
                             characterRuntimeStates, setCharacterRuntimeStates, charId
                         }) {
    const stacks = characterRuntimeStates?.[charId]?.activeStates?.stacks ?? 0;

    const handleChange = (newValue) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    stacks: newValue
                }
            }
        }));
    };

    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <div className="status-toggle-box-inner">
                    <p>Increases ATK by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Within 12s after dealing Echo Skill DMG, gain {currentParamValues[2]} Resonance Skill DMG Bonus and {currentParamValues[3]} Echo Skill DMG Amplification, and ignore {currentParamValues[4]} of the target's DEF when dealing damage.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.firstP || false}
                            onChange={() => toggleState('firstP')}
                        />
                        Enable
                    </label>

                </div>
            </div>
        </div>
    );
}

export function applyWeaponLogic({
                                     mergedBuffs,
                                     combatState,
                                     characterState,
                                     skillMeta = {},
                                     isToggleActive = () => false,
                                     currentParamValues = [],
                                     activeCharacter
                                 }) {
    const atk = parseFloat(currentParamValues[0]);
    const dmgBonus = parseFloat(currentParamValues[2]);
    const defIgnore = parseFloat(currentParamValues[4]);

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + dmgBonus;
        mergedBuffs.echoSkill = (mergedBuffs.echoSkill ?? 0) + dmgBonus;
        mergedBuffs.enemyDefIgnore = (mergedBuffs.enemyDefIgnore ?? 0) + defIgnore;
    }

    return { mergedBuffs, combatState, skillMeta };
}