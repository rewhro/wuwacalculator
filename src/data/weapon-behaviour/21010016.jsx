import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";

export function verdantUI({
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
                    <p>Increases Attribute DMG Bonus by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Every time Intro Skill or Resonance Liberation is cast, increases Heavy Attack DMG Bonus by {currentParamValues[1]}, stacking up to 2 time(s).
                    </p>
                    <label className="modern-checkbox">
                        <DropdownSelect
                            label=""
                            options={[0, 1, 2]}
                            value={stacks}
                            onChange={handleChange}
                            width="80px"
                        />
                        Stacks
                    </label>
                </div>
            </div>
        </div>
    );
}

export const WeaponUI = verdantUI;

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
    const stacks = characterState?.activeStates?.stacks ?? 0;
    const heavy = parseFloat(currentParamValues[1]) * stacks;

    mergedBuffs[element] = (mergedBuffs[element] ?? 0) + attr;
    mergedBuffs.heavyAtk = (mergedBuffs.heavyAtk ?? 0) + heavy;

    return { mergedBuffs, combatState, skillMeta };
}