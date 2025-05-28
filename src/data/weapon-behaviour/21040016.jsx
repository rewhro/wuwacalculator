import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";

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
                    <p>Gain {currentParamValues[0]} Attribute DMG Bonus.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        When using Resonance Liberation, the wielder gains {currentParamValues[1]} Resonance Liberation DMG Bonus for 8s. This effect can be extended by 5s each time Resonance Skills are cast, up to 3 times.
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
    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    const attr = parseFloat(currentParamValues[0]);
    const firstP = parseFloat(currentParamValues[1]);

    mergedBuffs[element] = (mergedBuffs[element] ?? 0) + attr;


    if (characterState?.activeStates?.firstP) {
        mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + firstP;
    }


    return { mergedBuffs, combatState, skillMeta };
}