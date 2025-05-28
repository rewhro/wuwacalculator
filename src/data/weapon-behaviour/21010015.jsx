import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";

export function razorDanceUI({
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
                    <p>Increases Energy Regen by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        When Resonance Skill is cast, Resonance Liberation DMG Bonus is increased by {currentParamValues[1]}, stacking up to 3 times.
                    </p>
                    <label className="modern-checkbox">
                        <DropdownSelect
                            label=""
                            options={[0, 1, 2, 3]}
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

export const WeaponUI = razorDanceUI;

export function applyWeaponLogic({
                                     mergedBuffs,
                                     combatState,
                                     characterState,
                                     skillMeta = {},
                                     isToggleActive = () => false,
                                     currentParamValues = []
                                 }) {
    const energy = parseFloat(currentParamValues[0]);
    const stacks = characterState?.activeStates?.stacks ?? 0;
    const ult = parseFloat(currentParamValues[1]) * stacks;

    mergedBuffs.energyRegen = (mergedBuffs.energyRegen ?? 0) + energy;
    mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + ult;


    return { mergedBuffs, combatState, skillMeta };
}