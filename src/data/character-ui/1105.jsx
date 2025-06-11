// src/data/character-ui/1506.jsx
import {formatDescription} from "../../utils/formatDescription.js";
import DropdownSelect from "../../components/DropdownSelect.jsx";
import React from "react";

export default function ZhezhiUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 className={'highlight'} style={{ fontSize: '18px', fontWeight: 'bold' }}>Creation's Zenith</h4>
                <div>
                    <p>When a Phantasmic Imprint is nearby and there are 2 stacks of Painter's Delight, Stroke of Genius is replaced with Creation's Zenith, which can be cast while in mid-air. When it is cast, Zhezhi will:</p>
                    <ul style={{paddingLeft: '20px'}} >
                        <li>Lose all stacks of Painter's Delight</li>
                        <li>Move to the location of the Phantasmic Imprint, remove it, and then summon an Ivory Herald to attack the target, dealing greater Glacio DMG, considered as Basic Attack DMG, additionally increasing the Basic Attack DMG Bonus by 18% for 27s. Refresh the mid-air Dodge attempts if the target Phatasmic Imprint is in mid-air.</li>
                    </ul>
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.zenith || false}
                        onChange={() => {
                            toggleState('zenith');
                        }}
                    />
                    Enable
                </label>
            </div>
        </div>
    );
}

export function CustomInherentSkills({
                                         character,
                                         currentSliderColor,
                                         characterRuntimeStates,
                                         setCharacterRuntimeStates,
                                         unlockLevels = [],
                                         charLevel = 1 // <== passed in from CharacterSelector
                                     }) {
    const charId = character?.Id ?? character?.id ?? character?.link;
    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};

    const toggleState = (key, value = null) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: value ?? !(prev[charId]?.activeStates?.[key] ?? false)
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
                const lowerName = name.toLowerCase();
                const isCalligrapher = lowerName.includes("calligrapher's touch");

                const unlockLevel = unlockLevels[index] ?? 1;
                const locked = charLevel < unlockLevel;

                // Reset dropdown value if locked and currently active
                if (locked && isCalligrapher && activeStates.inherent1 !== 0) {
                    toggleState('inherent1', 0);
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

                        {isCalligrapher && (
                            <DropdownSelect
                                label=""
                                options={[0, 1, 2, 3]}
                                value={activeStates.inherent1 ?? 0}
                                onChange={(newValue) => toggleState('inherent1', newValue)}
                                width="80px"
                                disabled={locked}
                            />
                        )}

                        {locked && (
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'gray' }}>
                                (Unlocks at Lv. {unlockLevel})
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function ZhezhiSequenceToggles({
                                        nodeKey,
                                        sequenceToggles,
                                        toggleSequence,
                                        currentSequenceLevel,
                                        setCharacterRuntimeStates,
                                        charId
                                    }) {
    const validKeys = ['1', '3', '4'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

    // === Sequence 6: dropdown input ===
    if (String(nodeKey) === '3') {
        const value = sequenceToggles['3_value'] ?? 0;

        const handleChange = (newValue) => {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    sequenceToggles: {
                        ...(prev[charId]?.sequenceToggles ?? {}),
                        ['3_value']: newValue
                    }
                }
            }));
        };

        return (
            <DropdownSelect
                label=""
                options={[0, 1, 2, 3]}
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

export function buffUI({ activeStates, toggleState, charId, setCharacterRuntimeStates, attributeColors }) {
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

    return (
        <div className="echo-buffs">
            <div className="echo-buff">
                <div className="echo-buff-header">
                    <div className="echo-buff-name">Outro Skill: Carve and Draw</div>
                </div>
                <div className="echo-buff-effect">
                    The incoming Resonator has their <span style={{ color: attributeColors['glacio'], fontWeight: 'bold' }}>Glacio DMG</span> Amplified by <span className="highlight">20%</span> and <span className="highlight">Resonance Skill DMG</span> Amplified by <span className="highlight">25%</span> for <span className="highlight">14s</span> or until they are switched out.
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.carveAndDraw || false}
                        onChange={() => toggleState('carveAndDraw')}
                    />
                    Enable
                </label>
            </div>

            <div className="echo-buff">
                <div className="echo-buff-header">
                    <div className="echo-buff-name">S4: Hue's Spectrum</div>
                </div>
                <div className="echo-buff-effect">
                    Casting <span className="highlight">Resonance Liberation</span> Living Canvas increases ATK of Resonators on the team <span className="highlight">20%</span> for <span className="highlight">30s</span>.
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.spectrum || false}
                        onChange={() => toggleState('spectrum')}
                    />
                    Enable
                </label>
            </div>
        </div>
    );
}