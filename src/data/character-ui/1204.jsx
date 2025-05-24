import React from "react";
import {formatDescription} from "../../utils/formatDescription.js";

export default function MortefiUI({ activeStates, toggleState }) {
    const hasToggles = false; // set to `false` if no actual toggles for this character yet

    if (!hasToggles) return null; // prevents empty box rendering

    return (
        <div className="status-toggles">
            {/* Your checkboxes and toggle logic here */}
        </div>
    );
}


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
                        {name.toLowerCase().includes("harmonic control") && (
                            <label className="modern-checkbox">
                                <input
                                    type="checkbox"
                                    checked={activeStates.inherent1 ?? false}
                                    onChange={() => toggleState('inherent1')}
                                />
                                Enable
                            </label>
                        )}

                        { name.toLowerCase().includes("rhythmic vibrato") && (
                            <div className= "slider-label-with-input" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="character-level-input"
                                    min="0"
                                    max="50"
                                    value={activeStates.inherent2 ?? 0}
                                    onChange={(e) => {
                                        const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                                        setCharacterRuntimeStates(prev => ({
                                            ...prev,
                                            [charId]: {
                                                ...(prev[charId] ?? {}),
                                                activeStates: {
                                                    ...(prev[charId]?.activeStates ?? {}),
                                                    inherent2: val
                                                }
                                            }
                                        }));
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


export function mortefiSequenceToggles({ nodeKey, sequenceToggles, toggleSequence, currentSequenceLevel }) {
    if (!['3', ' 5', '6'].includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

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