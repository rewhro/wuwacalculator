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
                                         setCharacterRuntimeStates,
                                         charLevel,
                                         unlockLevels = [50, 70]
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
                const lowerName = name.toLowerCase();
                const isPride = lowerName.includes("lion's pride");
                const isPractice = lowerName.includes("diligent practice");

                const unlockLevel = unlockLevels[index] ?? 1;
                const locked = charLevel < unlockLevel;

                // Turn off toggle if currently enabled but locked
                if (locked) {
                    if (isPride && activeStates.inherent1) {
                        toggleState('inherent1');
                    }
                    if (isPractice && activeStates.inherent2) {
                        toggleState('inherent2');
                    }
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

                        {isPride && (
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

                        {isPractice && (
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
                    <div className="echo-buff-name">S4: Immortals Bow, in Reverence Flawed</div>
                </div>
                <div className="echo-buff-effect">
                    Outro Skill <span className="highlight">Frosty Marks</span> increases the <span style={{ color: attributeColors['glacio'], fontWeight: 'bold' }}>Glacio DMG Bonus</span> of all team members by <span className="highlight">20%</span> for 30s.
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.immortals || false}
                        onChange={() => toggleState('immortals')}
                    />
                    Enable
                </label>
            </div>
        </div>
    );
}