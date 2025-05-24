import React from "react";
import {formatDescription} from "../../utils/formatDescription.js";

export default function BrantUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Theatrical Moment</h4>
                <div>
                    <p>Brant gains additional ATK based on his Energy Regen: For every 1% of his Energy Regen over 150%, Brant gains additional 12 points of ATK, up to 1560.</p>
                </div>
            </div>
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>"My" Moment</h4>
                <p>Brant gains additional ATK based on his Energy Regen: For every 1% of his Energy Regen over 150%, Brant gains additional 20 points of ATK, up to 2600.</p>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.myMoment || false}
                        onChange={() => {
                            toggleState('myMoment');
                        }}
                    />
                    "My" Moment?
                </label>
            </div>
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
                        {name.toLowerCase().includes("trial by fire and tide") && (
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

export function brantSequenceToggles({ nodeKey, sequenceToggles, toggleSequence, currentSequenceLevel }) {
    if (!['1', '2', '5'].includes(String(nodeKey))) return null;

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
