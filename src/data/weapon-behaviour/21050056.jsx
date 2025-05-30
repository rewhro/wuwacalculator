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
                    <p>Increases ATK by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Casting Echo Skill within 10s after casting Intro Skill or Basic Attacks grants 1 stack of Gentle Dream. Echoes with the same name can only trigger this effect once, stacking up to 2 times, lasting for 10s. When reaching 2 stacks, casting Echo Skill no longer resets the duration of this effect. This effect activates up to once per 10s. Switching to another Resonator ends this effect early.</p>
                    <p>
                        <p>
                            With 1 stack: Grants {currentParamValues[6]} Basic Attack DMG Bonus.
                        </p>
                        <p>
                            With 2 stacks: Ignores {currentParamValues[8]} of the target's Havoc RES.
                        </p>
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
    const basic = parseFloat(currentParamValues[6]);
    const resShred = parseFloat(currentParamValues[8]);
    const stacks = characterState?.activeStates?.stacks ?? 0;

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    if (stacks > 0) {
        mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + basic;
    }

    if (stacks > 1 && element === 'havoc') {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + resShred;
    }

    return { mergedBuffs, combatState, skillMeta };
}