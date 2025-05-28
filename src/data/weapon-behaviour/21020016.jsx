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
                        The wielder gains 1 stack of Searing Feather upon dealing damage, which can be triggered once every 0.5s, and gains 5 stacks of the same effect upon casting Resonance Skill. Each stack of Searing Feather gives {currentParamValues[1]} additional Resonance Skill DMG Bonus for up to 14 stacks.
                    </p>
                    <input
                        type="number"
                        className="character-level-input"
                        min="0"
                        max="14"
                        value={activeStates.stacks ?? 0}
                        onChange={(e) => {
                            const val = Math.max(0, Math.min(14, Number(e.target.value) || 0));
                            setCharacterRuntimeStates(prev => ({
                                ...prev,
                                [charId]: {
                                    ...(prev[charId] ?? {}),
                                    activeStates: {
                                        ...(prev[charId]?.activeStates ?? {}),
                                        stacks: val
                                    }
                                }
                            }));
                        }}
                    />
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
    const skill = parseFloat(currentParamValues[1]) * (characterState?.activeStates?.stacks ?? 0);

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;
    mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + skill;

    return { mergedBuffs, combatState, skillMeta };
}