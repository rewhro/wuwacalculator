// src/CharacterSelector.jsx
import React from 'react';
import SequenceSkillsBox from './SequenceSkillsBox';
import CharacterHeader from './CharacterHeader';
import CharacterMenu from './CharacterMenu';
import SkillSettings from './SkillSettings';
import { formatDescription } from '../utils/formatDescription';
import { getCharacterUIComponent } from '../data/character-ui';
import { getCustomInherentSkillsComponent } from '../data/character-ui';
import useDarkMode from '../hooks/useDarkMode';

const cleanTooltipText = html => html.replace(/<[^>]*>?/gm, '');

const traceNodeIconMap = {
    'ATK+': 'atk', 'HP+': 'hp', 'DEF+': 'def',
    'Healing Bonus+': 'healing-bonus', 'Crit. Rate+': 'crit-rate', 'Crit. DMG+': 'crit-dmg',
    'Aero DMG Bonus+': 'aero-bonus', 'Glacio DMG Bonus+': 'glacio-bonus',
    'Spectro DMG Bonus+': 'spectro-bonus', 'Fusion DMG Bonus+': 'fusion-bonus',
    'Electro DMG Bonus+': 'electro-bonus', 'Havoc DMG Bonus+': 'havoc-bonus'
};

const skillToBuffMap = {
    'ATK+': 'atkPercent', 'HP+': 'hpPercent', 'DEF+': 'defPercent',
    'Healing Bonus+': 'healingBonus', 'Crit. Rate+': 'critRate', 'Crit. DMG+': 'critDmg',
    'Aero DMG Bonus+': 'aero',
    'Glacio DMG Bonus+': 'glacio',
    'Spectro DMG Bonus+': 'spectro',
    'Fusion DMG Bonus+': 'fusion',
    'Electro DMG Bonus+': 'electro',
    'Havoc DMG Bonus+': 'havoc'
};

export default function CharacterSelector({
                                              characters, activeCharacter, handleCharacterSelect, menuRef, menuOpen,
                                              attributeIconPath, currentSliderColor, sliderValues, setSliderValues,
                                              characterLevel, setCharacterLevel, setSkillsModalOpen, setMenuOpen,
                                              temporaryBuffs, setTemporaryBuffs,
                                              characterRuntimeStates, setCharacterRuntimeStates
                                          }) {
    const isDark = useDarkMode();
    const safeLevel = Math.min(Math.max(Number(characterLevel ?? 1), 1), 90);

    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};
    const CustomCharacterUI = getCharacterUIComponent(charId);
    const CustomInherents = getCustomInherentSkillsComponent(charId);
    const sequenceToggles = characterRuntimeStates?.[charId]?.sequenceToggles ?? {};

    const toggleState = (stateKey) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [stateKey]: !(prev[charId]?.activeStates?.[stateKey] ?? false)
                }
            }
        }));
    };

    const toggleSequence = (seqKey) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                sequenceToggles: {
                    ...(prev[charId]?.sequenceToggles ?? {}),
                    [seqKey]: !(prev[charId]?.sequenceToggles?.[seqKey] ?? false)
                }
            }
        }));
    };

    return (
        <>
            <CharacterHeader
                activeCharacter={activeCharacter}
                setMenuOpen={setMenuOpen}
                attributeIconPath={attributeIconPath}
                menuOpen={menuOpen}
            />

            <div className="character-settings">
                {/* Level input + slider */}
                <div className="slider-group">
                    <div className="slider-label-with-input">
                        <label>Level</label>
                        <input
                            type="number"
                            className="character-level-input"
                            value={safeLevel}
                            min="1"
                            max="90"
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    setCharacterLevel(Math.min(Math.max(val, 1), 90));
                                }
                            }}
                        />
                    </div>
                    <div className="slider-controls">
                        <input
                            type="range"
                            min="1"
                            max="90"
                            value={safeLevel}
                            onChange={(e) => setCharacterLevel(Number(e.target.value))}
                            style={{ '--slider-color': currentSliderColor }}
                        />
                        <span>{safeLevel}</span>
                    </div>
                </div>

                {/* Sequence slider */}
                <div className="slider-group">
                    <label>Sequence</label>
                    <div className="slider-controls">
                        <input
                            type="range"
                            min="0"
                            max="6"
                            value={sliderValues.sequence}
                            onChange={(e) =>
                                setSliderValues(prev => ({ ...prev, sequence: Number(e.target.value) }))
                            }
                            style={{ '--slider-color': currentSliderColor }}
                        />
                        <span>{sliderValues.sequence}</span>
                    </div>
                </div>
            </div>

            <CharacterMenu
                characters={characters}
                handleCharacterSelect={handleCharacterSelect}
                menuRef={menuRef}
                menuOpen={menuOpen}
            />

            <SkillSettings
                sliderValues={sliderValues}
                setSliderValues={setSliderValues}
                currentSliderColor={currentSliderColor}
                setSkillsModalOpen={setSkillsModalOpen}
            />

            {activeCharacter && (
                <div className="inherent-skills-box">
                    {!CustomInherents && <h3>Inherent Skills</h3>}
                    {CustomInherents ? (
                        <CustomInherents
                            character={activeCharacter}
                            currentSliderColor={currentSliderColor}
                            characterRuntimeStates={characterRuntimeStates}
                            setCharacterRuntimeStates={setCharacterRuntimeStates}
                        />
                    ) : (
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
                        </div>
                    )}

                    {/* Trace Buff Icons */}
                    <div className="buff-icons">
                        {Object.entries(activeCharacter.raw?.SkillTrees ?? {})
                            .filter(([, node]) =>
                                node.NodeType === 4 &&
                                node.Skill?.Name &&
                                traceNodeIconMap[node.Skill.Name]
                            )
                            .map(([nodeId, node]) => {
                                const iconFile = traceNodeIconMap[node.Skill.Name];
                                const themeSuffix = isDark ? 'dark' : 'light';
                                const iconPath = `/assets/skill-icons/${themeSuffix}/${iconFile}.webp?v=${themeSuffix}`;
                                const isActive = temporaryBuffs?.activeNodes?.[nodeId] ?? false;
                                const tooltipText = cleanTooltipText(
                                    formatDescription(node.Skill.Desc, node.Skill.Param, currentSliderColor)
                                );

                                return (
                                    <div
                                        key={nodeId}
                                        className="buff-icon-wrapper"
                                        data-tooltip={tooltipText}
                                    >
                                        <img
                                            key={`${iconFile}-${themeSuffix}`}
                                            src={iconPath}
                                            alt={iconFile}
                                            className={`buff-icon ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                const nodeIdNum = Number(nodeId);
                                                const skillName = node.Skill?.Name;
                                                const buffKey = skillToBuffMap[skillName];
                                                const percent = parseFloat((node.Skill?.Param?.[0] ?? "0").replace('%', ''));

                                                setTemporaryBuffs(prev => {
                                                    // Toggle the node
                                                    const wasActive = prev.activeNodes?.[nodeIdNum] ?? false;
                                                    const newActiveNodes = {
                                                        ...prev.activeNodes,
                                                        [nodeIdNum]: !wasActive
                                                    };

                                                    // If no buffKey, just return updated activeNodes
                                                    if (!buffKey) {
                                                        return {
                                                            ...prev,
                                                            activeNodes: newActiveNodes
                                                        };
                                                    }

                                                    // Recalculate total buff for this buffKey
                                                    const total = Object.entries(newActiveNodes)
                                                        .filter(([, isActive]) => isActive)
                                                        .map(([id]) => {
                                                            const otherNode = activeCharacter.raw?.SkillTrees?.[id];
                                                            const otherSkillName = otherNode?.Skill?.Name;
                                                            const otherBuffKey = skillToBuffMap[otherSkillName];
                                                            const value = parseFloat((otherNode?.Skill?.Param?.[0] ?? "0").replace('%', ''));
                                                            return otherBuffKey === buffKey ? value : 0;
                                                        })
                                                        .reduce((sum, val) => sum + val, 0);

                                                    return {
                                                        ...prev,
                                                        activeNodes: newActiveNodes,
                                                        [buffKey]: total
                                                    };
                                                });
                                            }}
                                        />
                                    </div>
                                );
                            })}
                    </div>
                    {CustomCharacterUI && (
                        <div className="inherent-skills-box">
                            <CustomCharacterUI
                                activeStates={activeStates}
                                toggleState={toggleState}
                            />
                        </div>
                    )}
                </div>
            )}

            <SequenceSkillsBox
                activeCharacter={activeCharacter}
                currentSliderColor={currentSliderColor}
                sliderValues={sliderValues}
                characterRuntimeStates={characterRuntimeStates}
                setCharacterRuntimeStates={setCharacterRuntimeStates}
                sequenceToggles={sequenceToggles}
                toggleSequence={toggleSequence}
            />
        </>
    );
}
