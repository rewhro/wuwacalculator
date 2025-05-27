import React from "react";
import {formatDescription} from "../../utils/formatDescription.js";

export default function SkUI({ setCharacterRuntimeStates, charId, activeStates, toggleState }) {

    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <div className="status-toggle-box-inner">
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Inner Stellarealm</h4>
                    <div>
                        <p>When a party member uses Intro Skill within the Outer Stellarealm, it evolves into the Inner Stellarealm. Within the effective range of the Inner Stellarealm, for every 0.2% of Shorekeeper's Energy Regen, all party members gain a 0.01% increase of Crit. Rate, up to 12.5%.</p>
                    </div>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.innerS || false}
                            onChange={() => {
                                const newState = !activeStates.innerS;
                                toggleState('innerS');

                                // Auto-disable supernal if inner gets turned off
                                if (!newState && activeStates.supernal) {
                                    toggleState('supernal');
                                }
                            }}
                        />
                        Enable
                    </label>
                </div>

                <div className="status-toggle-box-inner">
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Supernal Stellarealm</h4>
                    <div>
                        <p>When a party member uses Intro Skill within the Inner Stellarealm, it evolves into the Supernal Stellarealm. Within the effective range of the Supernal Stellarealm, for every 0.1% of Shorekeeper's Energy Regen, all party members gain a 0.01% increase of Crit. DMG, up to 25%.<br/>
                            Supernal Stellarealm has all the effects of the Inner Stellarealm.</p>
                    </div>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.supernal || false}
                            onChange={() => toggleState('supernal')}
                            disabled={!activeStates.innerS}
                        />
                        Enable
                        {!activeStates.innerS && (
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'gray' }}>
                (Requires Inner Stellarealm)
            </span>
                        )}
                    </label>
                </div>
                <div className="status-toggles">
                    <div className="status-toggle-box">
                        <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Outro Skill: Binary Butterfly</h4>
                        <p>All nearby party members' DMG is Amplified by 15%.</p>
                        <label className="modern-checkbox">
                            <input
                                type="checkbox"
                                checked={activeStates.butterfly || false}
                                onChange={() => {
                                    toggleState('butterfly');
                                }}
                            />
                            Enable
                        </label>
                    </div>
                </div>
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
    const charLevel = characterRuntimeStates?.[charId]?.CharacterLevel ?? 1;

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

    return (
        <div className="inherent-skills">
            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Inherent Skills</h4>

            {skills.map((node, index) => {
                const name = node.Skill?.Name ?? '';
                const lowerName = name.toLowerCase();

                const gravitation = lowerName.includes("self gravitation");
                const unlockLevel = gravitation ? 70 : 50;
                const locked = charLevel < unlockLevel;

                if (locked) {
                    if (gravitation && activeStates.inherent2) updateState('inherent2', false);
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

                        {gravitation && (
                            <label className="modern-checkbox">
                                <input
                                    type="checkbox"
                                    checked={activeStates.inherent2 ?? false}
                                    onChange={() => !locked && toggleState('inherent2')}
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
                        {!gravitation && locked && (
                            <span style={{ fontSize: '12px', color: 'gray' }}>
                                (Unlocks at Lv. {unlockLevel})
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function skSequenceToggles({ nodeKey, sequenceToggles, toggleSequence, currentSequenceLevel }) {
    if (!['4'].includes(String(nodeKey))) return null;

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