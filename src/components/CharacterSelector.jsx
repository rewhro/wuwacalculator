// src/components/CharacterSelector.jsx
import React from 'react';
import useDarkMode from '../hooks/useDarkMode';
import SequenceSkillsBox from './SequenceSkillsBox';
import CharacterHeader from './CharacterHeader';
import CharacterMenu from './CharacterMenu';
import SkillSettings from './SkillSettings';
import { formatDescription } from '../utils/formatDescription';

const cleanTooltipText = html => html.replace(/<[^>]*>?/gm, '');

const buffIconMap = {
    'ATK+': 'atk', 'HP+': 'hp', 'DEF+': 'def',
    'Healing Bonus+': 'healing-bonus', 'Crit. Rate+': 'crit-rate', 'Crit. DMG+': 'crit-dmg',
    'Aero DMG Bonus+': 'aero-bonus', 'Glacio DMG Bonus+': 'glacio-bonus',
    'Spectro DMG Bonus+': 'spectro-bonus', 'Fusion DMG Bonus+': 'fusion-bonus',
    'Electro DMG Bonus+': 'electro-bonus', 'Havoc DMG Bonus+': 'havoc-bonus'
};

const skillToBuffMap = {
    'ATK+': 'atkPercent', 'HP+': 'hpPercent', 'DEF+': 'defPercent',
    'Healing Bonus+': 'healingBonus', 'Crit. Rate+': 'critRate', 'Crit. DMG+': 'critDmg',
    'Aero DMG Bonus+': 'aeroDmgBonus', 'Glacio DMG Bonus+': 'glacioDmgBonus',
    'Spectro DMG Bonus+': 'spectroDmgBonus', 'Fusion DMG Bonus+': 'fusionDmgBonus',
    'Electro DMG Bonus+': 'electroDmgBonus', 'Havoc DMG Bonus+': 'havocDmgBonus'
};

export default function CharacterSelector({
                                              characters, activeCharacter, handleCharacterSelect, menuRef, menuOpen,
                                              attributeIconPath, currentSliderColor, sliderValues, setSliderValues,
                                              characterLevel, setCharacterLevel, setSkillsModalOpen, setMenuOpen,
                                              temporaryBuffs, setTemporaryBuffs
                                          }) {
    const isDark = useDarkMode();

    return (
        <>
            <CharacterHeader activeCharacter={activeCharacter} setMenuOpen={setMenuOpen} attributeIconPath={attributeIconPath} menuOpen={menuOpen} />
            <div className="character-settings">
                <div className="slider-group">
                    <div className="slider-label-with-input">
                        <label>Level</label>
                        <input type="number" className="character-level-input" value={characterLevel} min="1" max="90" onChange={(e) => setCharacterLevel(Math.min(Math.max(+e.target.value, 1), 90))} />
                    </div>
                    <div className="slider-controls">
                        <input type="range" min="1" max="90" value={characterLevel} onChange={(e) => setCharacterLevel(Number(e.target.value))} style={{ '--slider-color': currentSliderColor }} />
                        <span>{characterLevel}</span>
                    </div>
                </div>
                <div className="slider-group">
                    <label>Sequence</label>
                    <div className="slider-controls">
                        <input type="range" min="0" max="6" value={sliderValues.sequence} onChange={(e) => setSliderValues(prev => ({ ...prev, sequence: Number(e.target.value) }))} style={{ '--slider-color': currentSliderColor }} />
                        <span>{sliderValues.sequence}</span>
                    </div>
                </div>
            </div>
            <CharacterMenu characters={characters} handleCharacterSelect={handleCharacterSelect} menuRef={menuRef} menuOpen={menuOpen} />
            <SkillSettings sliderValues={sliderValues} setSliderValues={setSliderValues} currentSliderColor={currentSliderColor} setSkillsModalOpen={setSkillsModalOpen} />
            {activeCharacter && (
                <div className="inherent-skills-box">
                    <h3>Inherent Skills</h3>
                    <div className="inherent-skills">
                        {Object.values(activeCharacter.raw?.SkillTrees ?? {}).filter(node => node.Skill?.Type === "Inherent Skill").map((node, index) => (
                            <div key={index} className="inherent-skill">
                                <h4>{node.Skill.Name}</h4>
                                <p dangerouslySetInnerHTML={{ __html: formatDescription(node.Skill.Desc, node.Skill.Param, currentSliderColor) }} />
                            </div>
                        ))}
                        <div className="buff-icons">
                            {Object.entries(activeCharacter.raw?.SkillTrees ?? {})
                                .filter(([, node]) =>
                                    node.NodeType === 4 &&
                                    node.Skill?.Name &&
                                    buffIconMap[node.Skill.Name]
                                )
                                .map(([nodeId, node]) => {
                                    const iconFile = buffIconMap[node.Skill.Name];
                                    const iconPath = isDark
                                        ? `/assets/skill-icons/dark/${iconFile}.webp`
                                        : `/assets/skill-icons/light/${iconFile}.webp`;
                                    const isActive = temporaryBuffs?.activeNodes?.[nodeId] ?? false;
                                    const rawTooltip = formatDescription(node.Skill.Desc, node.Skill.Param, currentSliderColor);
                                    const tooltipText = cleanTooltipText(rawTooltip);

                                    return (
                                        <div
                                            key={nodeId}
                                            className="buff-icon-wrapper"
                                            data-tooltip={tooltipText}
                                        >
                                            <img
                                                src={iconPath}
                                                alt={iconFile}
                                                className={`buff-icon ${isActive ? 'active' : ''}`}
                                                title={tooltipText}

                                                onClick={() => {
                                                    const nodeIdNum = Number(nodeId);
                                                    const skillName = node.Skill?.Name;
                                                    const buffKey = skillToBuffMap[skillName];
                                                    const percent = parseFloat((node.Skill?.Param?.[0] ?? "0").replace('%', ''));

                                                    setTemporaryBuffs(prev => {
                                                        const wasActive = prev.activeNodes?.[nodeIdNum] ?? false;
                                                        const newActive = !wasActive;
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
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}
            <SequenceSkillsBox activeCharacter={activeCharacter} currentSliderColor={currentSliderColor} sliderValues={sliderValues} />
        </>
    );
}