import React from "react";
import {formatDescription} from "../../utils/formatDescription.js";
import DropdownSelect from "../../components/DropdownSelect.jsx";
import {highlightKeywordsInText} from "../../constants/echoSetData.jsx";

export default function PhrolovaUI() {
    const hasToggles = false;
    if (!hasToggles) return null;
}

export function CustomInherentSkills({
                                         character,
                                         currentSliderColor,
                                         characterRuntimeStates,
                                         setCharacterRuntimeStates,
                                         keywords
                                     }) {
    const charId = character?.Id ?? character?.id ?? character?.link;
    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};
    const charLevel = characterRuntimeStates?.[charId]?.CharacterLevel ?? 1;
    keywords.push(
        'Echo Skill',
        'Basic Attack - Hecate',
        'Apparition of Beyond - Hecate',
        'Enhanced Attack - Hecate',
        'Aftersound',
        'Volatile Note - Cadenza',
        'Volatile Notes',
        'Volatile Note',
        'Hecate',
        'Maestro'
    );

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

                const octet = lowerName.includes("octet");
                const unlockLevel = octet ? 70 : 50;
                const locked = charLevel < unlockLevel;

                if (locked) {
                    if (octet && activeStates.inherent2) updateState('inherent2', false);
                }

                return (
                    <div key={index} className="inherent-skill">
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>{name}</h4>
                        <p>
                            {highlightKeywordsInText(formatDescription(
                                node.Skill.Desc,
                                node.Skill.Param,
                                currentSliderColor
                            ), keywords)}
                        </p>

                        {octet && (
                            <div className="slider-label-with-input" style={{
                                marginTop: '8px',
                                opacity: locked ? 0.5 : 1,
                                cursor: !locked ? 'auto' : 'not-allowed'
                            }}>
                                Aftersound
                                <input
                                    type="number"
                                    className="character-level-input"
                                    min="0"
                                    max="64"
                                    style={{cursor: !locked ? 'auto' : 'not-allowed'}}
                                    disabled={locked}
                                    value={activeStates.inherent2 ?? 0}
                                    onChange={(e) => {
                                        const val = Math.max(0, Math.min(64, Number(e.target.value) || 0));
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
                                {locked && (
                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: 'gray' }}>
                                        (Unlocks at Lv. {unlockLevel})
                                    </span>
                                )}
                            </div>
                        )}
                        {!octet && locked && (
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

export function phrolovaSequenceToggles({
                                        nodeKey,
                                        sequenceToggles,
                                        toggleSequence,
                                        currentSequenceLevel,
                                    }) {
    const validKeys = ['4', '6'];
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

export function buffUI({ activeStates, toggleState, attributeColors }) {
    return (
        <div className="echo-buffs">
            <div className="echo-buff">
                <div className="echo-buff-header">
                    <div className="echo-buff-name">Outro Skill: Unfinished Piece</div>
                </div>
                <div className="echo-buff-effect">
                    The incoming Resonator gains <span className="highlight">20%</span> <span style={{ color: attributeColors['havoc'], fontWeight: 'bold' }}>Havoc DMG</span> Amplification and <span className="highlight">25%</span> <span className="highlight">Heavy Attack DMG</span> Amplification for 14s or until they are switched out.

                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.unfinishedPiece || false}
                        onChange={() => toggleState('unfinishedPiece')}
                    />
                    Enable
                </label>
            </div>
            <div className="echo-buff">
                <div className="echo-buff-header">
                    <div className="echo-buff-name">S4: A Torch Illuminating the Path</div>
                </div>
                <div className="echo-buff-effect">
                    The incoming Resonator gains <span className="highlight">20%</span> <span style={{ color: attributeColors['havoc'], fontWeight: 'bold' }}>Havoc DMG</span> Amplification and <span className="highlight">25%</span> <span className="highlight">Heavy Attack DMG</span> Amplification for 14s or until they are switched out.
                    After casting <span className="highlight">Echo Skill</span>, grant <span className="highlight">20%</span> ATK increase for all Resonators in the team for 30s.

                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.illuminating || false}
                        onChange={() => toggleState('illuminating')}
                    />
                    Enable
                </label>
            </div>
        </div>
    );
}