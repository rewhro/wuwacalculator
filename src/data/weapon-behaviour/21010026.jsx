import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";
import {elementToAttribute} from "../../utils/attributeHelpers.js";

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
                    <p>Increases Attribute DMG Bonus by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Casting Intro Skill gives the equipper Ageless Marking, which grants {currentParamValues[1]} Resonance Skill DMG Bonus.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.ageless || false}
                            onChange={() => toggleState('ageless')}
                        />
                        Enable
                    </label>
                    <p>
                        Casting Resonance Skill gives the equipper Ethereal Endowment, which grants {currentParamValues[1]} Resonance Skill DMG Bonus.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.ethereal || false}
                            onChange={() => toggleState('ethereal')}
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
    const attr = parseFloat(currentParamValues[0]);
    const skill = parseFloat(currentParamValues[1]);

    for (const elem of Object.values(elementToAttribute)) {
        mergedBuffs[elem] = (mergedBuffs[elem] ?? 0) + attr;
    }
    if (characterState?.activeStates?.ageless) {
        mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + skill;
    }

    if (characterState?.activeStates?.ethereal) {
        mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + skill;
    }

    return { mergedBuffs, combatState, skillMeta };
}