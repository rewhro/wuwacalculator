// ✅ FINAL FIXED CharacterSelector.jsx

import React, { useEffect } from 'react';
import { formatDescription } from '../utils/formatDescription';
import SequenceSkillsBox from './SequenceSkillsBox';
import useDarkMode from '../hooks/useDarkMode';
import skillTabs from '../constants/skillTabs';

const buffIconMap = {
    'ATK+': 'atk',
    'HP+': 'hp',
    'DEF+': 'def',
    'Healing Bonus+': 'healing-bonus',
    'Crit. Rate+': 'crit-rate',
    'Crit. DMG+': 'crit-dmg',
    'Aero DMG Bonus+': 'aero-bonus',
    'Glacio DMG Bonus+': 'glacio-bonus',
    'Spectro DMG Bonus+': 'spectro-bonus',
    'Fusion DMG Bonus+': 'fusion-bonus',
    'Electro DMG Bonus+': 'electro-bonus',
    'Havoc DMG Bonus+': 'havoc-bonus'
};

const skillToBuffMap = {
    'ATK+': 'atkPercent',
    'HP+': 'hpPercent',
    'DEF+': 'defPercent',
    'Healing Bonus+': 'healingBonus',
    'Crit. Rate+': 'critRate',
    'Crit. DMG+': 'critDmg',
    'Aero DMG Bonus+': 'aeroDmgBonus',
    'Glacio DMG Bonus+': 'glacioDmgBonus',
    'Spectro DMG Bonus+': 'spectroDmgBonus',
    'Fusion DMG Bonus+': 'fusionDmgBonus',
    'Electro DMG Bonus+': 'electroDmgBonus',
    'Havoc DMG Bonus+': 'havocDmgBonus'
};


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
                                              setMenuOpen,
                                              temporaryBuffs,
                                              setTemporaryBuffs
                                          }) {
    const isDark = useDarkMode();

    useEffect(() => {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(input => {
            const min = Number(input.min ?? 0);
            const max = Number(input.max ?? 100);
            const val = Number(input.value ?? 0);
            const percent = ((val - min) * 100) / (max - min);
            input.style.setProperty('--slider-fill', `${percent}%`);
        });
    }, [sliderValues, characterLevel]);

    return (
        <div id="left-pane" className="partition partition-relative">
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

            <div className="skills-settings clickable" onClick={() => setSkillsModalOpen(true)}>
                <div onClick={(e) => e.stopPropagation()}>
                    {skillTabs.map(tab => (
                        <div className="slider-group" key={tab}>
                            <label>{tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                            <div className="slider-controls">
                                <input type="range" min="1" max="10" value={sliderValues[tab]}
                                       onChange={(e) => setSliderValues(prev => ({ ...prev, [tab]: Number(e.target.value) }))}
                                       style={{ '--slider-color': currentSliderColor }} />
                                <span>{sliderValues[tab]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {activeCharacter && (
                <div className="inherent-skills-box">
                    <h3>Inherent Skills</h3>
                    <div className="inherent-skills">
                        {Object.values(activeCharacter.raw?.SkillTrees ?? {})
                            .filter(node => node.Skill?.Type === "Inherent Skill")
                            .map((node, index) => (
                                <div key={index} className="inherent-skill">
                                    <h4>{node.Skill.Name}</h4>
                                    <p dangerouslySetInnerHTML={{
                                        __html: formatDescription(node.Skill.Desc, node.Skill.Param, currentSliderColor)
                                    }} />
                                </div>
                            ))}

                        <div className="buff-icons">
                            {Object.entries(activeCharacter.raw?.SkillTrees ?? {})
                                .filter(([, node]) => node.NodeType === 4 && node.Skill?.Name && buffIconMap[node.Skill.Name])
                                .map(([nodeId, node]) => {
                                    const iconFile = buffIconMap[node.Skill.Name];
                                    const iconPath = isDark
                                        ? `/assets/skill-icons/dark/${iconFile}.webp`
                                        : `/assets/skill-icons/light/${iconFile}.webp`;
                                    const isActive = temporaryBuffs?.activeNodes?.[nodeId] ?? false;
                                    return (
                                        <img
                                            key={nodeId}
                                            src={iconPath}
                                            alt={iconFile}
                                            className={`buff-icon ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                const nodeIdNum = Number(nodeId);
                                                const skillName = node.Skill?.Name;
                                                const buffKey = skillToBuffMap[skillName];
                                                const percent = parseFloat((node.Skill?.Param?.[0] ?? "0").replace('%', ''));

                                                setTemporaryBuffs(prev => {
                                                    const wasActive = prev.activeNodes?.[nodeIdNum] ?? false;
                                                    const newActive = !wasActive;

                                                    console.log(`🟢 Buff toggle → nodeId: ${nodeIdNum}, skill: ${skillName}, value: ${percent}, newActive: ${newActive}`);

                                                    return {
                                                        ...prev,
                                                        activeNodes: {
                                                            ...prev.activeNodes,
                                                            [nodeIdNum]: newActive
                                                        },
                                                        ...(buffKey ? {
                                                            [buffKey]: newActive
                                                                ? (prev[buffKey] ?? 0) + percent
                                                                : (prev[buffKey] ?? 0) - percent
                                                        } : {})
                                                    };
                                                });
                                            }}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            <SequenceSkillsBox
                activeCharacter={activeCharacter}
                currentSliderColor={currentSliderColor}
                sliderValues={sliderValues}
            />
        </div>
    );
}
