import {formatDescription} from "../../utils/formatDescription.js";
import React from "react";

export default function LingYangUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Lion's Vigor</h4>
                <div>
                    <p>Lingyang gains 50% Glacio DMG Bonus.</p>
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.lionsVigor || false}
                        onChange={() => {
                            toggleState('lionsVigor');
                        }}
                    />
                    Lion's Vigor?
                </label>
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
                        {name.toLowerCase().includes("lion's pride") && (
                            <label className="modern-checkbox">
                                <input
                                    type="checkbox"
                                    checked={activeStates.inherent1 ?? false}
                                    onChange={() => toggleState('inherent1')}
                                />
                                Enable
                            </label>
                        )}

                        {name.toLowerCase().includes("diligent practice") && (
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
// If you have sequence toggles:
export function LingyangSequenceToggles({ nodeKey, sequenceToggles, toggleSequence, currentSequenceLevel }) {
    const validKeys = ['3', '5', '6'];
    if (!validKeys.includes(String(nodeKey))) return null;

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