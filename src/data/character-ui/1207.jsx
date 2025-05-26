import {formatDescription} from "../../utils/formatDescription.js";
import React from 'react';
import DropdownSelect from '../../components/DropdownSelect';

export default function LupaUI({ characterRuntimeStates, setCharacterRuntimeStates, charId }) {
    const packHuntValue = characterRuntimeStates?.[charId]?.activeStates?.packHunt ?? 0;

    const handleChange = (newValue) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    packHunt: newValue
                }
            }
        }));
    };

    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Pack Hunt</h4>
                <div>
                    <p>The DMG Bonus of Resonators with Pack Hunt increases by 6%, non-stackable. When the active Resonator performs Intro Skill, Pack Hunt is enhanced, further increasing the DMG Bonus of other Resonators in the team by 6%, up to a maximum of 18%.</p>
                    <p>If Lupa's Pack Hunt reaches its cap and remains active, she enters Wild Hunt state to perform Intro Skill - Nowhere to Run!. Wild Hunt can trigger once per Pack Hunt.</p>
                </div>

                <DropdownSelect
                    label=""
                    options={[0, 1, 2, 3]}
                    value={packHuntValue}
                    onChange={handleChange}
                    width="80px"
                />
            </div>
        </div>
    );
}


// If you also want to support inherent skill rendering:
export function CustomInherentSkills({
                                         character,
                                         currentSliderColor,
                                         characterRuntimeStates,
                                         setCharacterRuntimeStates
                                     }) {
    const charId = character?.Id ?? character?.id ?? character?.link;
    const charLevel = characterRuntimeStates?.[charId]?.CharacterLevel ?? 1;
    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};

    const toggleState = (key) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: !(prev[charId]?.activeStates?.[key] ?? false)
                }
            }
        }));
    };

    const updateState = (key, value) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: value
                }
            }
        }));
    };

    const skills = Object.values(character?.raw?.SkillTrees ?? {}).filter(
        node => node.Skill?.Type === "Inherent Skill"
    );

    const unlockLevels = [50, 70];

    return (
        <div className="inherent-skills">
            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Inherent Skills</h4>

            {skills.map((node, index) => {
                const name = node.Skill?.Name ?? '';
                const lowerName = name.toLowerCase();
                const rememberMyName = lowerName.includes("remember my name");
                const victory = lowerName.includes("applause of victory");

                const unlockLevel = unlockLevels[index] ?? 1;
                const locked = charLevel < unlockLevel;

                // Clear toggle/value if locked
                if (locked) {
                    if (rememberMyName && activeStates.inherent1) updateState('inherent1', false);
                    if (victory && (activeStates.inherent2?? 0) > 0) updateState('inherent2', 0);
                }

                return (
                    <div key={index} className="inherent-skill">
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>{name}</h4>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: formatDescription(
                                    node.Skill.Desc,
                                    node.Skill.Param,
                                    currentSliderColor
                                )
                            }}
                        />

                        {rememberMyName && (
                            <label className="modern-checkbox">
                                <input
                                    type="checkbox"
                                    checked={activeStates.inherent1 ?? false}
                                    onChange={() => !locked && toggleState('inherent1')}
                                    disabled={locked}
                                />
                                Enable
                                {locked && (
                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: 'gray' }}>
                                        (Unlocks at Lv. {unlockLevel})
                                    </span>
                                )}
                            </label>
                        )}

                        {victory && (
                            <div
                                className="slider-label-with-input"
                                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                Secret Strategist
                                <DropdownSelect
                                    label=""
                                    options={[0, 1, 2, 3]}
                                    value={activeStates.inherent2 ?? 0}
                                    onChange={(newValue) => updateState('inherent2', newValue)}
                                    width="80px"
                                    disabled={locked}
                                />
                                {locked && (
                                    <span style={{ fontSize: '12px', color: 'gray' }}>
                                        (Unlocks at Lv. {unlockLevel})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


// If you have sequence toggles:
export function LupaSequenceToggles({
                                          nodeKey,
                                          sequenceToggles,
                                          toggleSequence,
                                          currentSequenceLevel,
                                          setCharacterRuntimeStates,
                                          charId
                                      }) {
    const validKeys = ['1', '2', '5'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

    // === Sequence 6: dropdown input ===
    if (String(nodeKey) === '2') {
        const value = sequenceToggles['2_value'] ?? 0;

        const handleChange = (newValue) => {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    sequenceToggles: {
                        ...(prev[charId]?.sequenceToggles ?? {}),
                        ['2_value']: newValue
                    }
                }
            }));
        };

        return (
            <DropdownSelect
                label=""
                options={[0, 1, 2]}
                value={value}
                onChange={handleChange}
                disabled={isDisabled}
                className="sequence-dropdown"
                width="80px"
            />
        );
    }

    // === All other sequences: checkbox ===
    return (
        <label className="modern-checkbox" style={{ opacity: isDisabled ? 0.5 : 1 }}>
            <input
                type="checkbox"
                checked={sequenceToggles[nodeKey] || false}
                onChange={() => toggleSequence(nodeKey)}
                disabled={isDisabled}
            />
            Enable
        </label>
    );
}