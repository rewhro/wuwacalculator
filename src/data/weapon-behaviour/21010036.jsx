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
                        Performing Intro Skill or Resonance Liberation increases Resonance Liberation DMG by {currentParamValues[1]}.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.firstP || false}
                            onChange={() => toggleState('firstP')}
                        />
                        Enable
                    </label>
                    <p>
                        Dealing Heavy Attack DMG extends this effect by 4s, up to 1 time. Each successful extension gives {currentParamValues[5]} Fusion DMG Bonus to all Resonators in the team for 30s. Effects of the same name cannot be stacked.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.secondP || false}
                            onChange={() => toggleState('secondP')}
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
    const ult = parseFloat(currentParamValues[1]);
    const fusion = parseFloat(currentParamValues[5]);

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + ult;
    }

    if (characterState?.activeStates?.secondP) {
        mergedBuffs.fusion = (mergedBuffs.fusion ?? 0) + fusion;
    }

    return { mergedBuffs, combatState, skillMeta };
}