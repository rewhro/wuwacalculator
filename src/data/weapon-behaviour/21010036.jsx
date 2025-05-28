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
                        Dealing Heavy Attack DMG extends this effect by 4s, up to 1 times. Each successful extension gives {currentParamValues[5]} DMG Bonus to all Resonators in the team. Effects of the same name cannot be stacked.
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
    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    const atk = parseFloat(currentParamValues[0]);
    const ult = parseFloat(currentParamValues[1]);
    const attr = parseFloat(currentParamValues[5]);

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + ult;
    }

    if (characterState?.activeStates?.secondP) {
        mergedBuffs[element] = (mergedBuffs[element] ?? 0) + attr;
    }

    return { mergedBuffs, combatState, skillMeta };
}