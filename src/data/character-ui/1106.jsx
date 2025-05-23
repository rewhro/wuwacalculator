import {formatDescription} from "../../utils/formatDescription.js";
import React from "react";
import DropdownSelect from "../../components/DropdownSelect.jsx";

export default function YouhuUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Poetic Essence</h3>

                <div className="status-toggle-box-inner">
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Antithesis</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>A pair of Auspices. Increase Poetic Essence's DMG by 70%.</li>
                    </ul>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.antithesis || false}
                            onChange={() => toggleState('antithesis')}
                        />
                        Enable
                    </label>
                </div>

                <div className="status-toggle-box-inner">
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Triplet</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>Three identical Auspices. Increase Poetic Essence's DMG by 175%.</li>
                    </ul>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.triplet || false}
                            onChange={() => toggleState('triplet')}
                        />
                        Enable
                    </label>
                </div>
            </div>
        </div>
    );
}

// ✅ Custom inherent skills section
export function CustomInherentSkills({
                                         character,
                                         currentSliderColor,
                                         characterRuntimeStates,
                                         setCharacterRuntimeStates
                                     }) {
    const charId = character?.Id ?? character?.id ?? character?.link;
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

    const skills = Object.values(character?.raw?.SkillTrees ?? {}).filter(
        node => node.Skill?.Type === "Inherent Skill"
    );

    return (
        <div className="inherent-skills">
            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Inherent Skills</h4>

            {skills.map((node, index) => {
                const name = node.Skill?.Name ?? '';
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

                        {/* Toggle under skill name directly */}
                        {name.toLowerCase().includes("treasured piece") && (
                            <label className="modern-checkbox">
                                <input
                                    type="checkbox"
                                    checked={activeStates.inherent1 ?? false}
                                    onChange={() => toggleState('inherent1')}
                                />
                                Enable
                            </label>
                        )}

                        {name.toLowerCase().includes("rare find") && (
                            <label className="modern-checkbox">
                                <input
                                    type="checkbox"
                                    checked={activeStates.inherent2 ?? false}
                                    onChange={() => toggleState('inherent2')}
                                />
                                Enable
                            </label>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function youhuSequenceToggles({
                                        nodeKey,
                                        sequenceToggles,
                                        toggleSequence,
                                        currentSequenceLevel,
                                        setCharacterRuntimeStates,
                                        charId
                                    }) {
    const validKeys = ['5', '6'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

    // === Sequence 6: dropdown input ===
    if (String(nodeKey) === '6') {
        const value = sequenceToggles['6_value'] ?? 0;

        const handleChange = (newValue) => {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    sequenceToggles: {
                        ...(prev[charId]?.sequenceToggles ?? {}),
                        ['6_value']: newValue
                    }
                }
            }));
        };

        return (
            <DropdownSelect
                label=""
                options={[0, 1, 2, 3, 4]}
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