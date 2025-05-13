// src/components/CharacterSelector.jsx
import React from 'react';
import { formatDescription } from '../utils/formatDescription';

const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill'];

export default function CharacterSelector({
                                              characters,
                                              activeCharacter,
                                              handleCharacterSelect,
                                              menuRef,
                                              menuOpen,
                                              attributeIconPath,
                                              currentSliderColor,
                                              sliderValues,
                                              setSliderValues,
                                              characterLevel,
                                              setCharacterLevel,
                                              setSkillsModalOpen,
                                              setMenuOpen
                                          }) {
    return (
        <div id="left-pane" className="partition partition-relative">
            {/* Character Header */}
            <div className="header-with-icon">
                {activeCharacter && (
                    <img src={activeCharacter.icon} alt={activeCharacter.displayName}
                         className="header-icon" onClick={() => setMenuOpen(!menuOpen)} />
                )}
                <div className="character-info-header">
                    <h2>{activeCharacter?.displayName ?? "Character Info"}</h2>
                    {attributeIconPath && <img src={attributeIconPath} alt="attribute" className="attribute-icon" />}
                </div>
            </div>

            {/* Level & Sequence Sliders */}
            <div className="character-settings">
                <div className="slider-group">
                    <div className="slider-label-with-input">
                        <label>Level</label>
                        <input type="number" className="character-level-input" value={characterLevel}
                               min="1" max="90" onChange={(e) => setCharacterLevel(Math.min(Math.max(+e.target.value, 1), 90))} />
                    </div>
                    <div className="slider-controls">
                        <input type="range" min="1" max="90" value={characterLevel}
                               onChange={(e) => setCharacterLevel(Number(e.target.value))}
                               style={{ '--slider-color': currentSliderColor }} />
                        <span>{characterLevel}</span>
                    </div>
                </div>

                <div className="slider-group">
                    <label>Sequence</label>
                    <div className="slider-controls">
                        <input type="range" min="0" max="6" value={sliderValues.sequence}
                               onChange={(e) => setSliderValues(prev => ({ ...prev, sequence: Number(e.target.value) }))}
                               style={{ '--slider-color': currentSliderColor }} />
                        <span>{sliderValues.sequence}</span>
                    </div>
                </div>
            </div>

            {/* Character Menu */}
            <div ref={menuRef} className={`icon-menu-vertical ${menuOpen ? 'show' : ''}`}>
                {characters.length > 0 ? (
                    characters.map((char, i) => (
                        <div key={i} className="dropdown-item" onClick={() => handleCharacterSelect(char)}>
                            <img src={char.icon} alt={char.displayName} className="icon-menu-img" />
                            <span className="dropdown-label">{char.displayName}</span>
                        </div>
                    ))
                ) : <p>Loading characters...</p>}
            </div>

            {/* Skills Settings */}
            <div className="skills-settings clickable" onClick={() => setSkillsModalOpen(true)}>
                <div onClick={(e) => e.stopPropagation()}>
                    {skillTabs.map(tab => (
                        <div className="slider-group" key={tab}>
                            <label>{tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                            <div className="slider-controls">
                                <input type="range" min="1" max="10" name={tab} value={sliderValues[tab]}
                                       onChange={(e) => setSliderValues(prev => ({ ...prev, [tab]: Number(e.target.value) }))}
                                       style={{ '--slider-color': currentSliderColor }} />
                                <span>{sliderValues[tab]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inherent Skills */}
            {activeCharacter && (
                <div className="inherent-skills-box">
                    <h3>Inherent Skills</h3>
                    <div className="inherent-skills">
                        {Object.values(activeCharacter.raw?.SkillTrees ?? {})
                            .filter(node => node.Skill?.Type === "Inherent Skill")
                            .map((node, index) => (
                                <div key={index} className="inherent-skill">
                                    <h4>{node.Skill.Name}</h4>
                                    <p dangerouslySetInnerHTML={{ __html: formatDescription(node.Skill.Desc, node.Skill.Param, currentSliderColor) }} />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}